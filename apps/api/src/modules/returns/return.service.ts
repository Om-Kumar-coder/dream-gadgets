import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Return } from './entities/return.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Payment } from '../sales/entities/payment.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateSaleReturnDto, CreatePurchaseReturnDto } from './dto/create-return.dto';
import { getRequiredReturnRole, calculateGST } from '../../common/utils/business-logic';
import { loadReturnThresholds } from '../../common/utils/settings-thresholds';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';

// Role hierarchy for return approval
const ROLE_LEVEL: Record<string, number> = { any: 0, manager: 1, owner: 2 };

function getUserRoleLevel(roleName: string): number {
  if (!roleName) return 0;
  const lower = roleName.toLowerCase();
  if (lower === 'shop_owner' || lower === 'shop owner') return 2;
  if (lower === 'store_manager' || lower === 'store manager') return 1;
  return 0;
}

function generateReturnNumber(): string {
  const year = new Date().getFullYear();
  const ts = Date.now();
  return `RET-${year}-${ts}`;
}

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name);

  constructor(
    @InjectRepository(Return)
    private returnRepo: Repository<Return>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
    private configService: ConfigService,
    private dataSource: DataSource,
    private redisService: RedisService,
    private eventService: EventService,
  ) {}

  // ─── 11.2 / 11.3 Create sale return ─────────────────────────────────────────

  async createSaleReturn(
    saleId: string,
    dto: CreateSaleReturnDto,
    userId: string,
    userRole: string,
  ): Promise<Return> {
    // Load sale with items and payments
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
      relations: ['items', 'payments'],
    });
    if (!sale) throw new NotFoundException(`Sale ${saleId} not found`);

    if (sale.isVoided) {
      throw new BadRequestException({
        code: 'SALE_VOIDED',
        message: 'Cannot return a voided sale',
      });
    }

    // 11.3 Check return window
    const returnWindowDays = this.getReturnWindowDays();
    const saleDate = new Date(sale.saleDate);
    const now = new Date();
    const daysSinceSale = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceSale > returnWindowDays && !dto.managerOverride) {
      throw new BadRequestException({
        code: 'RETURN_WINDOW_EXPIRED',
        message: `Return window of ${returnWindowDays} days has expired (${daysSinceSale} days since sale)`,
      });
    }

    // 11.3 Check approval threshold — BUG-19: thresholds come from `settings`
    // (₹5000/₹25000 defaults) instead of hardcoded constants.
    const refundAmount = dto.refundAmount ?? Number(sale.totalAmount);
    const returnThresholds = await loadReturnThresholds(this.dataSource);
    const requiredRole = getRequiredReturnRole(refundAmount, returnThresholds);

    if (requiredRole !== 'any') {
      const userLevel = getUserRoleLevel(userRole);
      const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;
      if (userLevel < requiredLevel) {
        throw new ForbiddenException({
          code: 'RETURN_NOT_AUTHORIZED',
          message: `Return of ₹${refundAmount} requires ${requiredRole} authorization`,
        });
      }
    }

    // 11.4 + return record: ONE transaction (BUG-09). Inventory restore and
    // the return row must commit or roll back together — previously items were
    // restored first, then the row was inserted with no transaction, so a
    // failed insert left restored inventory with no return record.
    const conditionAssessment = dto.conditionAssessment ?? 'available';
    const saleItems = sale.items ?? [];

    const saved = await this.dataSource.transaction(async (manager) => {
      const itemsRepo = manager.getRepository(InventoryItem);
      const returnsRepo = manager.getRepository(Return);

      // 11.4 Update inventory items status
      for (const si of saleItems) {
        await itemsRepo.update(si.itemId, { status: conditionAssessment });
      }

      // Create return record — refundStatus starts 'pending' for online
      // refunds; the actual money movement happens AFTER this commits.
      const returnRecord = returnsRepo.create({
        returnNumber: generateReturnNumber(),
        returnType: 'sale',
        originalId: saleId,
        clientId: sale.clientId ?? null,
        reason: dto.reason,
        refundMethod: dto.refundMethod ?? null,
        refundAmount,
        refundStatus: 'pending',
        approvedById: dto.approvedById ?? null,
        createdById: userId,
      });

      return returnsRepo.save(returnRecord);
    });

    // 11.5 Razorpay refund trigger (INTEGRATED) — runs only once the return
    // record is durable. Refunding before the insert meant a failed insert
    // left the money gone with nothing on record; with this ordering a failed
    // refund leaves a 'failed' record that can be retried, never a lost one.
    if (dto.refundMethod === 'original_payment') {
      const refundStatus = await this.executeOriginalPaymentRefund(sale, saleId, refundAmount);
      if (refundStatus !== saved.refundStatus) {
        try {
          await this.returnRepo.update(saved.id, { refundStatus });
          saved.refundStatus = refundStatus;
        } catch (err: any) {
          this.logger.error(
            `[Returns] Refund for sale ${saleId} finished with status '${refundStatus}' but the status update failed: ${err?.message}`,
          );
        }
      }
    }

    // Emit realtime event
    try {
      this.eventService.emitReturnCreated(sale.branchId, {
        returnId: saved.id,
        returnNumber: saved.returnNumber,
        returnType: 'sale',
        originalId: saleId,
        refundAmount: Number(refundAmount),
        branchId: sale.branchId,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`[Returns] Failed to emit return.created: ${err?.message}`);
    }

    return saved;
  }

  // ─── 12.1 Create purchase return ─────────────────────────────────────────────

  async createPurchaseReturn(
    purchaseId: string,
    dto: CreatePurchaseReturnDto,
    userId: string,
  ): Promise<Return> {
    const purchase = await this.purchaseRepo.findOne({ where: { id: purchaseId } });
    if (!purchase) throw new NotFoundException(`Purchase ${purchaseId} not found`);

    // Load linked inventory items
    let items: InventoryItem[];
    if (dto.itemIds && dto.itemIds.length > 0) {
      items = await this.itemRepo.find({ where: { id: In(dto.itemIds) } });
      if (items.length !== dto.itemIds.length) {
        throw new NotFoundException('Some inventory items not found');
      }
    } else {
      items = await this.itemRepo.find({ where: { purchaseId } as any });
    }

    // 12.1 Remove items from active inventory + record the return atomically
    // (BUG-09): a failed insert must never leave half the stock scrapped.
    const conditionAssessment = dto.conditionAssessment ?? 'scrapped';

    const saved = await this.dataSource.transaction(async (manager) => {
      const itemsRepo = manager.getRepository(InventoryItem);
      const returnsRepo = manager.getRepository(Return);

      for (const item of items) {
        await itemsRepo.update(item.id, { status: conditionAssessment });
      }

      const returnRecord = returnsRepo.create({
        returnNumber: generateReturnNumber(),
        returnType: 'purchase',
        originalId: purchaseId,
        clientId: null,
        reason: dto.reason,
        refundMethod: null,
        refundAmount: Number(purchase.totalAmount),
        refundStatus: 'pending',
        approvedById: null,
        createdById: userId,
      });

      return returnsRepo.save(returnRecord);
    });

    // Emit realtime event
    try {
      this.eventService.emitReturnCreated(purchase.branchId ?? '', {
        returnId: saved.id,
        returnNumber: saved.returnNumber,
        returnType: 'purchase',
        originalId: purchaseId,
        refundAmount: Number(purchase.totalAmount),
        branchId: purchase.branchId ?? '',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`[Returns] Failed to emit return.created: ${err?.message}`);
    }

    return saved;
  }

  // ─── List returns ────────────────────────────────────────────────────────────

  async findAll(query: {
    page?: number;
    limit?: number;
    returnType?: string;
    originalId?: string;
  }): Promise<{ data: Return[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, returnType, originalId } = query;

    const qb = this.returnRepo
      .createQueryBuilder('ret')
      .orderBy('ret.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (returnType) qb.andWhere('ret.returnType = :returnType', { returnType });
    if (originalId) qb.andWhere('ret.originalId = :originalId', { originalId });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── Get return by ID ────────────────────────────────────────────────────────

  async findById(id: string): Promise<Return> {
    const ret = await this.returnRepo.findOne({
      where: { id },
      relations: ['createdBy', 'approvedBy'],
    });
    if (!ret) throw new NotFoundException(`Return ${id} not found`);
    return ret;
  }

  // ─── 11.6 / 12.2 Generate credit note / return note PDF ─────────────────────

  async generateReturnPdf(id: string): Promise<Buffer> {
    const ret = await this.findById(id);
    const html = this.buildReturnNoteHtml(ret);
    return this.renderPdf(html);
  }

  private buildReturnNoteHtml(ret: Return): string {
    const title = ret.returnType === 'sale' ? 'Credit Note / Return Invoice' : 'Purchase Return Note';
    return `<!DOCTYPE html><html><head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
  h1 { font-size: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #E0E0E0; padding: 6px; text-align: left; }
  th { background: #E5E5E5; }
</style>
</head><body>
<h1>Dream Gadgets — ${title}</h1>
<p><strong>Return #:</strong> ${ret.returnNumber}</p>
<p><strong>Date:</strong> ${new Date(ret.createdAt).toLocaleDateString('en-IN')}</p>
<p><strong>Type:</strong> ${ret.returnType === 'sale' ? 'Sale Return' : 'Purchase Return'}</p>
<p><strong>Original ID:</strong> ${ret.originalId}</p>
<p><strong>Reason:</strong> ${ret.reason}</p>
${ret.refundAmount != null ? `<p><strong>Refund Amount:</strong> ₹${Number(ret.refundAmount).toFixed(2)}</p>` : ''}
${ret.refundMethod ? `<p><strong>Refund Method:</strong> ${ret.refundMethod}</p>` : ''}
<p><strong>Refund Status:</strong> ${ret.refundStatus}</p>
</body></html>`;
  }

  private async renderPdf(html: string): Promise<Buffer> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (err: any) {
      // BUG-12: fail loudly instead of returning corrupted placeholder bytes.
      this.logger.error(`Return PDF generation failed: ${err?.message}`);
      throw new InternalServerErrorException({
        code: 'PDF_GENERATION_FAILED',
        message: 'PDF rendering is unavailable — please retry or contact support',
      });
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Execute the Razorpay refund for an original_payment return and return the
   * refund status to persist. Called AFTER the return record is committed
   * (BUG-09) so money movement can never precede the record of the return.
   * Returns 'processed' when there is no online payment to refund, and
   * 'failed' when the provider call throws — never silently loses the refund.
   */
  private async executeOriginalPaymentRefund(
    sale: Sale,
    saleId: string,
    refundAmount: number,
  ): Promise<string> {
    const originalPayment = sale.payments?.find(p => p.razorpayPaymentId);
    if (!originalPayment?.razorpayPaymentId) {
      this.logger.log(`[Returns] No Razorpay payment found for sale ${saleId}, marking refund as processed`);
      return 'processed';
    }

    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
      });

      const refund = await razorpay.payments.refund(
        originalPayment.razorpayPaymentId,
        { amount: Math.round(refundAmount * 100) }, // Convert to paise
      );

      this.logger.log(`[Returns] Razorpay refund processed for sale ${saleId}: ${refund.id}`);
      return refund.status ?? 'processed';
    } catch (err: any) {
      this.logger.warn(`[Returns] Razorpay refund failed for sale ${saleId}: ${err?.message}`);
      return 'failed';
    }
  }

  private getReturnWindowDays(): number {
    try {
      return this.configService.get<number>('RETURN_WINDOW_DAYS') ?? 7;
    } catch {
      return 7;
    }
  }
}