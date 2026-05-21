import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransferDto } from './dto/query-transfer.dto';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(StockTransfer)
    private transferRepo: Repository<StockTransfer>,
    @InjectRepository(StockTransferItem)
    private transferItemRepo: Repository<StockTransferItem>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    private dataSource: DataSource,
  ) {}

  // ─── Transfer number generation ──────────────────────────────────────────────
  // Format: TRF-{BRANCH_CODE}-{YEAR}-{TS}

  private async generateTransferNumber(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    const branchCode = branch?.code ?? branchId.slice(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    const ts = Date.now().toString().slice(-6);
    return `TRF-${branchCode}-${year}-${ts}`;
  }

  // ─── 9.2 Create transfer ─────────────────────────────────────────────────────

  async create(dto: CreateTransferDto, userId: string): Promise<StockTransfer> {
    const { fromBranchId, toBranchId, itemIds, notes } = dto;

    if (fromBranchId === toBranchId) {
      throw new BadRequestException({
        code: 'SAME_BRANCH',
        message: 'Source and destination branches must be different',
      });
    }

    // Load and validate all items
    const items = await this.itemRepo.find({ where: { id: In(itemIds) } });

    if (items.length !== itemIds.length) {
      const foundIds = items.map((i) => i.id);
      const missing = itemIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
    }

    // Validate all items belong to fromBranch and are available
    for (const item of items) {
      if (item.branchId !== fromBranchId) {
        throw new BadRequestException({
          code: 'ITEM_WRONG_BRANCH',
          message: `Item ${item.imei} does not belong to source branch`,
        });
      }
      if (item.status !== 'available') {
        throw new BadRequestException({
          code: 'ITEM_NOT_AVAILABLE',
          message: `Item ${item.imei} is not available (status: ${item.status})`,
        });
      }
    }

    const transferNumber = await this.generateTransferNumber(fromBranchId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create transfer record
      const transfer = queryRunner.manager.create(StockTransfer, {
        transferNumber,
        fromBranchId,
        toBranchId,
        status: 'initiated',
        notes: notes ?? null,
        initiatedById: userId,
        initiatedAt: new Date(),
      });
      const savedTransfer = await queryRunner.manager.save(StockTransfer, transfer);

      // Create transfer items and update inventory status
      for (const item of items) {
        const transferItem = queryRunner.manager.create(StockTransferItem, {
          transferId: savedTransfer.id,
          itemId: item.id,
          imei: item.imei,
          status: 'pending',
        });
        await queryRunner.manager.save(StockTransferItem, transferItem);
        await queryRunner.manager.update(InventoryItem, item.id, { status: 'transferred' });
      }

      await queryRunner.commitTransaction();
      return this.findById(savedTransfer.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── 9.3 List transfers ──────────────────────────────────────────────────────

  async findAll(query: QueryTransferDto): Promise<{ data: StockTransfer[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, fromBranchId, toBranchId, status, search } = query;

    const qb = this.transferRepo
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromBranch', 'fromBranch')
      .leftJoinAndSelect('transfer.toBranch', 'toBranch')
      .leftJoinAndSelect('transfer.initiatedBy', 'initiatedBy')
      .orderBy('transfer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (fromBranchId) qb.andWhere('transfer.fromBranchId = :fromBranchId', { fromBranchId });
    if (toBranchId) qb.andWhere('transfer.toBranchId = :toBranchId', { toBranchId });
    if (status) qb.andWhere('transfer.status = :status', { status });
    if (search) qb.andWhere('transfer.transferNumber ILIKE :search', { search: `%${search}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── 9.3 Get transfer by ID ──────────────────────────────────────────────────

  async findById(id: string): Promise<StockTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['fromBranch', 'toBranch', 'initiatedBy', 'receivedBy', 'items'],
    });
    if (!transfer) throw new NotFoundException(`Transfer ${id} not found`);
    return transfer;
  }

  // ─── 9.4 Receive transfer (item-by-item, partial receipt) ────────────────────

  async receive(
    id: string,
    confirmedItemIds: string[],
    userId: string,
  ): Promise<StockTransfer> {
    const transfer = await this.findById(id);

    if (!['initiated', 'in_transit'].includes(transfer.status)) {
      throw new BadRequestException({
        code: 'INVALID_STATUS',
        message: `Transfer cannot be received in status: ${transfer.status}`,
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update confirmed items
      for (const itemId of confirmedItemIds) {
        const transferItem = transfer.items?.find((i) => i.itemId === itemId);
        if (!transferItem) continue;

        await queryRunner.manager.update(StockTransferItem, transferItem.id, { status: 'received' });
        await queryRunner.manager.update(InventoryItem, itemId, {
          branchId: transfer.toBranchId,
          status: 'available',
        });
      }

      // Update transfer status
      await queryRunner.manager.update(StockTransfer, id, {
        status: 'received',
        receivedById: userId,
        receivedAt: new Date(),
      });

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── 9.5 Reject transfer ─────────────────────────────────────────────────────

  async reject(id: string, rejectionReason: string): Promise<StockTransfer> {
    const transfer = await this.findById(id);

    if (!['initiated', 'in_transit'].includes(transfer.status)) {
      throw new BadRequestException({
        code: 'INVALID_STATUS',
        message: `Transfer cannot be rejected in status: ${transfer.status}`,
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Restore all items to available at fromBranch
      for (const transferItem of transfer.items ?? []) {
        await queryRunner.manager.update(InventoryItem, transferItem.itemId, {
          branchId: transfer.fromBranchId,
          status: 'available',
        });
        await queryRunner.manager.update(StockTransferItem, transferItem.id, { status: 'rejected' });
      }

      // Update transfer status
      await queryRunner.manager.update(StockTransfer, id, {
        status: 'rejected',
        rejectionReason,
      });

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── 9.6 Generate manifest PDF ───────────────────────────────────────────────

  async generateManifestPdf(id: string): Promise<Buffer> {
    const transfer = await this.findById(id);
    const items = transfer.items ?? [];

    const itemRows = items
      .map(
        (i) =>
          `<tr><td>${i.imei}</td><td>${i.itemId}</td><td>${i.status}</td></tr>`,
      )
      .join('');

    const html = `<html><body>
<h1>Transfer Manifest</h1>
<p>Transfer #: ${transfer.transferNumber}</p>
<p>From: ${(transfer.fromBranch as any)?.name ?? transfer.fromBranchId}</p>
<p>To: ${(transfer.toBranch as any)?.name ?? transfer.toBranchId}</p>
<p>Status: ${transfer.status}</p>
<p>Date: ${new Date(transfer.initiatedAt).toLocaleDateString('en-IN')}</p>
<table>
  <tr><th>IMEI</th><th>Item ID</th><th>Status</th></tr>
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
      return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
    }
  }
}
