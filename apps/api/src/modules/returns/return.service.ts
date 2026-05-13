import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Return } from './entities/return.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Payment } from '../sales/entities/payment.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateSaleReturnDto, CreatePurchaseReturnDto } from './dto/create-return.dto';
import { getRequiredReturnRole } from '../../common/utils/business-logic';

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
  private redisClient: any;

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
  ) {}

  // ─── Redis lazy init ─────────────────────────────────────────────────────────

  private async getRedis(): Promise<any> {
    if (!this.redisClient) {
      const { createClient } = await import('redis');
      const client = createClient({ url: this.configService.get<string>('redis.url') });
      await client.connect();
      this.redisClient = client;
    }
    return this.redisClient;
  }

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

    // 11.3 Check approval threshold
    const refundAmount = dto.refundAmount ?? Number(sale.totalAmount);
    const requiredRole = getRequiredReturnRole(refundAmount);

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

    // 11.4 Update inventory items status
    const conditionAssessment = dto.conditionAssessment ?? 'available';
    const saleItems = sale.items ?? [];
    for (const si of saleItems) {
      await this.itemRepo.update(si.itemId, { status: conditionAssessment });
    }

    // 11.5 Razorpay refund trigger (INTEGRATED)
    let refundStatus = 'pending';
    if (dto.refundMethod === 'original_payment') {
      // Find the original payment record
      const originalPayment = sale.payments?.find(p => p.razorpayPaymentId);
      if (originalPayment && originalPayment.razorpayPaymentId) {
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

          refundStatus = refund.status;
          this.logger.log(`[Returns] Razorpay refund processed for sale ${saleId}: ${refund.id}`);
        } catch (err: any) {
          this.logger.warn(`[Returns] Razorpay refund failed for sale ${saleId}: ${err?.message}`);
          refundStatus = 'failed';
        }
      } else {
        this.logger.log(`[Returns] No Razorpay payment found for sale ${saleId}, marking refund as processed`);
        refundStatus = 'processed';
      }
    }

    // Create return record
    const returnRecord = this.returnRepo.create({
      returnNumber: generateReturnNumber(),
      returnType: 'sale',
      originalId: saleId,
      clientId: sale.clientId ?? null,
      reason: dto.reason,
      refundMethod: dto.refundMethod ?? null,
      refundAmount,
      refundStatus,
      approvedById: dto.approvedById ?? null,
      createdById: userId,
    });

    return this.returnRepo.save(returnRecord);
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
      items = await this.itemRepo.findByIds(dto.itemIds);
      if (items.length !== dto.itemIds.length) {
        throw new NotFoundException('Some inventory items not found');
      }
    } else {
      items = await this.itemRepo.find({ where: { purchaseId } as any });
    }

    // 12.1 Remove items from active inventory
    const conditionAssessment = dto.conditionAssessment ?? 'scrapped';
    for (const item of items) {
      await this.itemRepo.update(item.id, { status: conditionAssessment });
    }

    const returnRecord = this.returnRepo.create({
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

    return this.returnRepo.save(returnRecord);
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
  th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
  th { background: #f5f5f5; }
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
    } catch {
      return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private getReturnWindowDays(): number {
    try {
      return this.configService.get<number>('RETURN_WINDOW_DAYS') ?? 7;
    } catch {
      return 7;
    }
  }
}