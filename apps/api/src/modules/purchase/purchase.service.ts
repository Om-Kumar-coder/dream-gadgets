import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { calculateGST } from '../../common/utils/business-logic';
import { getStateCode } from '../../common/utils/state-codes';
import { GSTIN_FORMAT } from '../admin/branch-gstin.validation';

const TAX_EPSILON = 0.01;

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepo: Repository<PurchaseItem>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  // ─── Invoice number generation ───────────────────────────────────────────────
  // Format: PUR-{BRANCH_CODE}-{YEAR}-{TIMESTAMP}

  private generateInvoiceNumber(branchId: string): string {
    const branchCode = branchId.slice(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PUR-${branchCode}-${year}-${timestamp}`;
  }

  // ─── 6.2 Create purchase ─────────────────────────────────────────────────────

  /**
   * Resolve the vendor state code (GST state code, 2 digits):
   *   1. explicit dto.vendorStateCode (UI override)
   *   2. first 2 digits of the vendor GSTIN
   * Returns null when unresolvable.
   */
  private resolveVendorStateCode(dto: CreatePurchaseDto): string | null {
    if (dto.vendorStateCode) return dto.vendorStateCode;
    if (dto.vendorGstin && GSTIN_FORMAT.test(dto.vendorGstin.toUpperCase())) {
      return dto.vendorGstin.slice(0, 2);
    }
    return null;
  }

  /**
   * Resolve the supply type (intra vs inter-state).
   * Order: manual override → derive from place of supply vs branch state.
   * Unknown/missing states degrade to 'intra' — same behavior as
   * gst.service.isInterState(null, x) → false, so reports stay consistent.
   */
  private resolveSupplyType(
    dto: CreatePurchaseDto,
    vendorStateCode: string | null,
    branchStateCode: string | null,
  ): { supplyType: 'intra' | 'inter'; source: 'derived' | 'manual' } {
    if (dto.supplyType) return { supplyType: dto.supplyType, source: 'manual' };

    const placeOfSupply = dto.placeOfSupply ?? vendorStateCode;
    if (placeOfSupply && branchStateCode && placeOfSupply !== branchStateCode) {
      return { supplyType: 'inter', source: 'derived' };
    }
    return { supplyType: 'intra', source: 'derived' };
  }

  /**
   * Build normalized line items. When the client sends only itemIds (legacy
   * admin form), auto-create one line per inventory item using its stored
   * cost/tax data so legacy clients keep working unmodified.
   */
  private resolveLines(
    dto: CreatePurchaseDto,
    items: InventoryItem[],
  ): Array<{
    itemId: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxableValue: number;
  }> {
    if (dto.items && dto.items.length > 0) {
      return dto.items.map((line) => ({
        itemId: line.itemId ?? null,
        description: line.description,
        quantity: line.quantity ?? 1,
        unitPrice: Number(line.unitPrice),
        taxRate: line.taxRate ?? 0,
        taxableValue: Number(line.taxableValue ?? (line.quantity ?? 1) * Number(line.unitPrice)),
      }));
    }

    // Legacy path: one line per linked inventory item.
    return items.map((item) => {
      const purchasePrice = Number(item.purchasePrice ?? 0);
      const itemTax = Number(item.taxAmount ?? 0);
      const taxable = purchasePrice > 0 ? purchasePrice : Number(item.totalCost ?? 0) - itemTax;
      return {
        itemId: item.id,
        description: `IMEI ${item.imei}`,
        quantity: 1,
        unitPrice: Math.max(0, Number(taxable.toFixed(2))),
        taxRate: Number(item.taxRate ?? 0),
        taxableValue: Math.max(0, Number(taxable.toFixed(2))),
      };
    });
  }

  async create(dto: CreatePurchaseDto, userId: string): Promise<Purchase> {
    const { itemIds = [], taxAmount } = dto;
    const usingExplicitLines = !!(dto.items && dto.items.length > 0);

    // Validate at least one item — either explicit lines or legacy itemIds
    if (!usingExplicitLines && itemIds.length === 0) {
      throw new BadRequestException({
        code: 'NO_ITEMS',
        message: 'At least one inventory item must be provided',
      });
    }

    // Load and validate linked inventory items exist
    let items: InventoryItem[] = [];
    if (itemIds.length > 0) {
      items = await this.itemRepo.findByIds(itemIds);
      if (items.length !== itemIds.length) {
        const foundIds = items.map((i) => i.id);
        const missing = itemIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
      }
    }

    const lines = this.resolveLines(dto, items);

    // ─── GST split resolution ────────────────────────────────────────────────
    const vendorStateCode = this.resolveVendorStateCode(dto);
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    const branchStateCode = branch?.state ? getStateCode(branch.state) : null;
    const placeOfSupply = dto.placeOfSupply ?? vendorStateCode;
    const { supplyType, source } = this.resolveSupplyType(dto, vendorStateCode, branchStateCode);

    // Unresolved supply type with actual tax would silently misfile ITC.
    // New explicit-lines requests must resolve it (the UI shows the toggle);
    // legacy itemIds clients degrade to intra (auditable, matches backfill).
    const dtoTaxProvided = taxAmount !== undefined;
    if (usingExplicitLines && !dto.supplyType && !placeOfSupply && dtoTaxProvided && Number(taxAmount) > 0) {
      throw new BadRequestException({
        code: 'SUPPLY_TYPE_UNRESOLVED',
        message:
          'Cannot determine intra/inter-state supply — provide vendor GSTIN, vendor state code, or an explicit supplyType',
      });
    }

    // Per-line tax split via the shared util (same math as sales)
    const isInterState = supplyType === 'inter';
    const lineItems = lines.map((line) => {
      const gst = calculateGST(line.taxableValue, line.taxRate, isInterState);
      return {
        ...line,
        hsnCode: null as string | null,
        cgstAmount: Number(gst.cgst.toFixed(2)),
        sgstAmount: Number(gst.sgst.toFixed(2)),
        igstAmount: Number(gst.igst.toFixed(2)),
        taxAmount: Number(gst.total.toFixed(2)),
        lineTotal: Number((line.taxableValue + gst.total).toFixed(2)),
      };
    });

    const sumTax = lineItems.reduce((s, l) => s + l.taxAmount, 0);
    const sumCgst = lineItems.reduce((s, l) => s + l.cgstAmount, 0);
    const sumSgst = lineItems.reduce((s, l) => s + l.sgstAmount, 0);
    const sumIgst = lineItems.reduce((s, l) => s + l.igstAmount, 0);

    // If the client sent an explicit header taxAmount, it must match the
    // computed line split (± ₹0.01).
    if (dtoTaxProvided && Math.abs(Number(taxAmount) - sumTax) > TAX_EPSILON) {
      throw new BadRequestException({
        code: 'TAX_SPLIT_MISMATCH',
        message: `Header taxAmount (${Number(taxAmount).toFixed(2)}) does not match the computed line tax split (${sumTax.toFixed(2)}) for the resolved supply type`,
      });
    }

    const totalTax = dtoTaxProvided ? Number(taxAmount) : Number(sumTax.toFixed(2));
    // Explicit lines carry their own economics; legacy itemIds flow keeps the
    // historical total (Σ item.total_cost).
    const totalAmount = usingExplicitLines
      ? Number(lineItems.reduce((s, l) => s + l.lineTotal, 0).toFixed(2))
      : items.reduce((sum, item) => sum + Number(item.totalCost), 0);

    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber(dto.branchId);

    // Create purchase record
    const purchase = this.purchaseRepo.create({
      vendorName: dto.vendorName,
      vendorId: dto.vendorId ?? null,
      branchId: dto.branchId,
      notes: dto.notes ?? null,
      invoiceNumber,
      totalAmount,
      taxAmount: totalTax,
      supplyType,
      supplyTypeSource: source,
      vendorGstin: dto.vendorGstin?.toUpperCase() ?? null,
      vendorStateCode,
      placeOfSupply: placeOfSupply ?? null,
      isReverseCharge: dto.isReverseCharge ?? false,
      isItcEligible: dto.isItcEligible ?? true,
      cgstAmount: Number(sumCgst.toFixed(2)),
      sgstAmount: Number(sumSgst.toFixed(2)),
      igstAmount: Number(sumIgst.toFixed(2)),
      createdById: userId,
      status: dto.status ?? 'completed',
      purchaseDate: new Date(dto.purchaseDate),
    });

    const saved = await this.purchaseRepo.save(purchase);

    // Persist line items
    await this.purchaseItemRepo.save(
      lineItems.map((line) =>
        this.purchaseItemRepo.create({
          purchaseId: saved.id,
          itemId: line.itemId,
          description: line.description,
          hsnCode: null,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxableValue: line.taxableValue,
          cgstAmount: line.cgstAmount,
          sgstAmount: line.sgstAmount,
          igstAmount: line.igstAmount,
          taxAmount: line.taxAmount,
          lineTotal: line.lineTotal,
        }),
      ),
    );

    // Link items to this purchase
    if (itemIds.length > 0) {
      await this.itemRepo.update(itemIds, { purchaseId: saved.id } as any);
    }

    return saved;
  }

  // ─── 6.3 List purchases ──────────────────────────────────────────────────────

  async findAll(query: QueryPurchaseDto): Promise<{ data: Purchase[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, branchId, status, vendorName, search, fromDate, toDate } = query;

    const qb = this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.branch', 'branch')
      .orderBy('purchase.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (branchId) qb.andWhere('purchase.branchId = :branchId', { branchId });
    if (status) qb.andWhere('purchase.status = :status', { status });
    if (vendorName) qb.andWhere('purchase.vendorName ILIKE :vendorName', { vendorName: `%${vendorName}%` });
    if (search) {
      qb.andWhere(
        '(purchase.invoiceNumber ILIKE :search OR purchase.vendorName ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (fromDate) qb.andWhere('purchase.purchaseDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('purchase.purchaseDate <= :toDate', { toDate });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── 6.3 Get by ID ───────────────────────────────────────────────────────────

  async findById(id: string): Promise<Purchase & { items?: InventoryItem[] }> {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['branch', 'createdBy'],
    });
    if (!purchase) throw new NotFoundException(`Purchase ${id} not found`);

    // Load linked inventory items
    const items = await this.itemRepo.find({ where: { purchaseId: id } as any });

    return { ...purchase, items };
  }

  // ─── 6.4 Update purchase ─────────────────────────────────────────────────────

  async update(id: string, dto: UpdatePurchaseDto): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException(`Purchase ${id} not found`);

    if (dto.purchaseDate) {
      (dto as any).purchaseDate = new Date(dto.purchaseDate);
    }

    Object.assign(purchase, dto);
    return this.purchaseRepo.save(purchase);
  }

  // ─── 6.5 Generate invoice PDF ────────────────────────────────────────────────

  async generateInvoicePdf(id: string): Promise<Buffer> {
    const purchase = await this.findById(id);
    const items = (purchase as any).items as InventoryItem[];

    const itemRows = items
      .map(
        (item) =>
          `<tr><td>${item.imei}</td><td>${item.condition}</td><td>₹${Number(item.totalCost).toFixed(2)}</td></tr>`,
      )
      .join('');

    const html = `<html><body>
<h1>Purchase Invoice</h1>
<p>Invoice: ${purchase.invoiceNumber}</p>
<p>Date: ${purchase.purchaseDate}</p>
<p>Vendor: ${purchase.vendorName}</p>
<p>Branch: ${purchase.branchId}</p>
<p>Total: ₹${Number(purchase.totalAmount).toFixed(2)}</p>
<table>
  <tr><th>IMEI</th><th>Condition</th><th>Price</th></tr>
  ${itemRows}
</table>
</body></html>`;

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
      // Puppeteer not available — return placeholder buffer
      return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
    }
  }
}
