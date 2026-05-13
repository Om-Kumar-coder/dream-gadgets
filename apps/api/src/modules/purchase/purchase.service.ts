import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
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

  async create(dto: CreatePurchaseDto, userId: string): Promise<Purchase> {
    const { itemIds, taxAmount = 0, ...rest } = dto;

    // Validate at least one item
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestException({
        code: 'NO_ITEMS',
        message: 'At least one inventory item must be provided',
      });
    }

    // Load and validate all items exist
    const items = await this.itemRepo.findByIds(itemIds);
    if (items.length !== itemIds.length) {
      const foundIds = items.map((i) => i.id);
      const missing = itemIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
    }

    // Compute totalAmount as sum of item.totalCost
    const totalAmount = items.reduce((sum, item) => sum + Number(item.totalCost), 0);

    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber(dto.branchId);

    // Create purchase record
    const purchase = this.purchaseRepo.create({
      ...rest,
      invoiceNumber,
      totalAmount,
      taxAmount,
      createdById: userId,
      status: dto.status ?? 'completed',
      purchaseDate: new Date(dto.purchaseDate),
    });

    const saved = await this.purchaseRepo.save(purchase);

    // Link items to this purchase
    await this.itemRepo.update(itemIds, { purchaseId: saved.id } as any);

    return saved;
  }

  // ─── 6.3 List purchases ──────────────────────────────────────────────────────

  async findAll(query: QueryPurchaseDto): Promise<{ data: Purchase[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, branchId, status, vendorName, fromDate, toDate } = query;

    const qb = this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.branch', 'branch')
      .orderBy('purchase.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (branchId) qb.andWhere('purchase.branchId = :branchId', { branchId });
    if (status) qb.andWhere('purchase.status = :status', { status });
    if (vendorName) qb.andWhere('purchase.vendorName ILIKE :vendorName', { vendorName: `%${vendorName}%` });
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
