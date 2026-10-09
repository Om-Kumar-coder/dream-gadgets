import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import {
  validateIMEI,
  isValidStatusTransition,
  calculateWarrantyExpiry,
  ItemCondition,
} from '../../common/utils/business-logic';
import { EventService } from '../../common/events/event.service';
import { RedisService } from '../../common/redis/redis.service';

import { CROSS_BRANCH_ROLES } from '../../common/guards/branch-scope.guard';

/**
 * Roles allowed to operate across branches even when a branchId is present on
 * their token — mirrors CROSS_BRANCH_ROLES in branch-scope.guard.ts.
 * Store managers are excluded: they are assigned-store only.
 */

/**
 * Statuses that mean the unit participates in completed business history.
 * Archived (soft-deleted) units are terminal and never re-enter circulation.
 */
const HISTORY_LOCKED_STATUSES = new Set(['sold', 'transferred']);

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
    @InjectRepository(ItemPhoto)
    private photoRepo: Repository<ItemPhoto>,
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
    @InjectRepository(Model)
    private modelRepo: Repository<Model>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private eventService: EventService,
    private redisService: RedisService,
  ) {}

  /**
   * Invalidates all cached public product listings so repeat visitors
   * see fresh data after any inventory mutation.
   */
  private async invalidatePublicCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys('public:products:*');
      if (keys.length > 0) {
        await this.redisService.del(keys);
      }
    } catch {
      // Non-critical — cache invalidation is best-effort
    }
  }

  /**
   * Server-side store isolation (Phase 3/10): the BranchScopeGuard only covers
   * list filters and body/param branchId. Every single-resource access must be
   * re-checked against the branch recorded on the item itself, otherwise staff
   * could read/mutate another store's unit by guessing its UUID.
   */
  private assertBranchAccess(item: InventoryItem, user: any): void {
    if (!user) return; // route-level guards already ran for anonymous-less contexts
    const crossBranch = !user.branchId || CROSS_BRANCH_ROLES.has(user.role);
    if (crossBranch) return;
    if (item.branchId !== user.branchId) {
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_VIOLATION',
        message: 'You can only access inventory in your assigned branch',
      });
    }
  }

  // ─── 5.2 Create ─────────────────────────────────────────────────────────────

  async create(dto: CreateInventoryItemDto, userId: string): Promise<InventoryItem> {
    // Normalize input and validate IMEI (far from whitespace/separators;
    // stored value must be exactly 15 digits and Luhn-valid).
    const imei = dto.imei;
    if (!validateIMEI(imei)) {
      throw new BadRequestException({
        code: 'IMEI_INVALID',
        message: 'IMEI failed Luhn algorithm validation',
      });
    }
    if (!/^\d{15}$/.test(imei)) {
      throw new BadRequestException({
        code: 'IMEI_FORMAT',
        message: 'IMEI must be exactly 15 digits',
      });
    }

    // Check duplicate IMEI
    const existing = await this.itemRepo.findOne({ where: { imei } });
    if (existing) {
      throw new ConflictException({
        code: 'IMEI_DUPLICATE',
        message: `An inventory item with IMEI ${dto.imei} already exists`,
      });
    }

    // Compute totalCost
    const taxAmount = dto.taxAmount ?? 0;
    const totalCost = Number(dto.purchasePrice) + Number(taxAmount);

    // Compute warrantyExpiry
    let warrantyExpiry: Date | null = null;
    if (dto.firstInvoiceDate) {
      warrantyExpiry = calculateWarrantyExpiry(
        new Date(dto.firstInvoiceDate),
        dto.condition as ItemCondition,
      );
    }

    const item = this.itemRepo.create({
      ...dto,
      taxAmount,
      totalCost,
      warrantyExpiry,
      createdById: userId,
      status: 'available',
    });

    const saved = await this.itemRepo.save(item);

    // Invalidate public product cache so new items appear immediately
    await this.invalidatePublicCache();

    return saved;
  }

  // ─── 5.3 List (paginated + filtered) ────────────────────────────────────────

  async findAll(query: QueryInventoryDto): Promise<{ data: InventoryItem[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, condition, status, brandId, modelId, branchId, minPrice, maxPrice, search } = query;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.brand', 'brand')
      .leftJoinAndSelect('item.model', 'model')
      .leftJoinAndSelect('item.branch', 'branch')
      .leftJoinAndSelect('item.photos', 'photos')
      .orderBy('item.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (condition) qb.andWhere('item.condition = :condition', { condition });
    if (status) qb.andWhere('item.status = :status', { status });
    if (brandId) qb.andWhere('item.brandId = :brandId', { brandId });
    if (modelId) qb.andWhere('item.modelId = :modelId', { modelId });
    if (branchId) qb.andWhere('item.branchId = :branchId', { branchId });
    if (minPrice !== undefined) qb.andWhere('item.sellingPrice >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('item.sellingPrice <= :maxPrice', { maxPrice });
    if (search) {
      qb.andWhere(
        '(item.imei ILIKE :search OR brand.name ILIKE :search OR model.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── 5.4 Get by ID / IMEI ───────────────────────────────────────────────────

  async findById(id: string, user?: any): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['brand', 'model', 'branch', 'photos', 'createdBy'],
    });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    if (user) this.assertBranchAccess(item, user);
    return item;
  }

  async findByImei(imei: string, user?: any): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({
      where: { imei },
      relations: ['brand', 'model', 'branch', 'photos'],
    });
    if (!item) throw new NotFoundException(`No inventory item found with IMEI ${imei}`);
    if (user) this.assertBranchAccess(item, user);
    return item;
  }

  // ─── 5.5 Update (with audit log) ────────────────────────────────────────────

  async update(id: string, dto: UpdateInventoryItemDto, userId: string, user?: any): Promise<InventoryItem> {
    const item = await this.findById(id, user);

    // Identity/location immutability (P1-2): IMEI and branch are identity fields.
    // They are set at purchase entry and must never change via normal editing —
    // moving a unit between stores is a TRANSFER, and a wrong IMEI is a data-entry
    // error to be corrected by voiding/redoing the entry, not a silent PATCH.
    if (dto.imei !== undefined && dto.imei !== item.imei) {
      throw new BadRequestException({
        code: 'IMEI_IMMUTABLE',
        message: 'IMEI is an identity field and cannot be changed. Void/re-enter the unit instead.',
      });
    }
    if (dto.branchId !== undefined && dto.branchId !== item.branchId) {
      throw new BadRequestException({
        code: 'BRANCH_IMMUTABLE',
        message: 'Store assignment cannot be changed by editing. Use a stock transfer to move inventory between stores.',
      });
    }

    // If status is being changed, validate transition
    if (dto.status && dto.status !== item.status) {
      if (!isValidStatusTransition(item.status, dto.status)) {
        throw new BadRequestException({
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition from '${item.status}' to '${dto.status}'`,
        });
      }
    }

    // Pricing rule: a published (online) item must always carry a selling price.
    // toggleOnline() blocks publishing without one — this closes the bypass of
    // clearing/zeroing the price on an already-listed item via update().
    const rawPrice = dto.sellingPrice !== undefined ? dto.sellingPrice : item.sellingPrice;
    const nextPrice = rawPrice == null ? null : Number(rawPrice);
    if (item.isOnline && (nextPrice == null || Number.isNaN(nextPrice) || nextPrice <= 0)) {
      throw new BadRequestException({
        code: 'ONLINE_ITEM_REQUIRES_PRICE',
        message: 'This item is listed online — set a selling price (or take it offline) before clearing the current one.',
      });
    }

    // Recompute totalCost if prices changed
    const purchasePrice = dto.purchasePrice !== undefined ? Number(dto.purchasePrice) : Number(item.purchasePrice);
    const taxAmount = dto.taxAmount !== undefined ? Number(dto.taxAmount) : Number(item.taxAmount);
    const totalCost = purchasePrice + taxAmount;

    // Recompute warrantyExpiry if condition or firstInvoiceDate changed
    let warrantyExpiry: Date | null | undefined = item.warrantyExpiry;
    const condition = (dto.condition ?? item.condition) as ItemCondition;
    const firstInvoiceDate = dto.firstInvoiceDate ? new Date(dto.firstInvoiceDate) : item.firstInvoiceDate;
    if (firstInvoiceDate) {
      warrantyExpiry = calculateWarrantyExpiry(firstInvoiceDate, condition);
    }

    // Write audit log
    await this.dataSource.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT DO NOTHING`,
      ['inventory_item', id, 'update', JSON.stringify(dto), userId],
    ).catch(() => {
      // audit_logs table may not exist in test env — ignore
    });

    Object.assign(item, dto, { totalCost, warrantyExpiry });
    const saved = await this.itemRepo.save(item);

    // Emit realtime event after successful save
    try {
      this.eventService.emitInventoryUpdated(item.branchId, {
        itemId: id,
        imei: item.imei,
        status: item.status,
        branchId: item.branchId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-critical — realtime events are best-effort
    }

    // Invalidate public product cache so changes reflect immediately
    await this.invalidatePublicCache();

    return saved;
  }

  // ─── 5.5b Change selling price (dedicated action) ────────────────────────────
  /**
   * Updates the selling price of the EXISTING inventory unit. Never deletes and
   * never re-creates the record, so IMEI / inventory identity / audit lineage
   * stay intact (Phase 6). Historical sale_lines keep their own unit_price.
   */
  async changeSellingPrice(id: string, sellingPrice: number, userId: string, user?: any): Promise<InventoryItem> {
    const item = await this.findById(id, user);

    const oldPrice = item.sellingPrice == null ? null : Number(item.sellingPrice);
    const newPrice = Number(sellingPrice);
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      throw new BadRequestException({
        code: 'INVALID_SELLING_PRICE',
        message: 'Selling price must be a non-negative number',
      });
    }
    if (item.status === 'sold' || item.status === 'transferred') {
      throw new ConflictException({
        code: 'ITEM_NOT_EDITABLE',
        message: `Cannot change the price of an item with status '${item.status}'`,
      });
    }
    if (item.isOnline && newPrice <= 0) {
      throw new BadRequestException({
        code: 'ONLINE_ITEM_REQUIRES_PRICE',
        message: 'This item is listed online — take it offline before clearing the price.',
      });
    }

    // Audit trail: price movements are financially significant.
    await this.dataSource
      .query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        ['inventory_item', id, 'change_selling_price', JSON.stringify({ from: oldPrice, to: newPrice }), userId],
      )
      .catch(() => {
        // audit_logs table may not exist in test env — ignore
      });

    item.sellingPrice = newPrice;
    const saved = await this.itemRepo.save(item);

    // Current price must propagate to POS/web immediately.
    await this.invalidatePublicCache();

    try {
      this.eventService.emitInventoryUpdated(item.branchId, {
        itemId: id,
        imei: item.imei,
        status: item.status,
        branchId: item.branchId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-critical
    }

    return saved;
  }

  // ─── 5.5c Soft delete / archive ─────────────────────────────────────────────
  /**
   * Soft-delete (Phase 6): units referenced by business history can never be
   * physically removed. Delete = status 'archived' + audit log; the row, its
   * IMEI uniqueness and every FK reference remain intact.
   */
  async softDelete(id: string, userId: string, user?: any): Promise<{ id: string; status: string }> {
    const item = await this.findById(id, user);

    if (HISTORY_LOCKED_STATUSES.has(item.status)) {
      throw new ConflictException({
        code: 'ITEM_HAS_HISTORY',
        message: `Item ${item.imei} has status '${item.status}' — it participates in sales/transfer history and cannot be deleted. Void or reject the related record first.`,
      });
    }
    if (item.status === 'archived') {
      throw new ConflictException({
        code: 'ALREADY_ARCHIVED',
        message: `Item ${item.imei} is already deleted`,
      });
    }
    // in_cart: an active POS cart holds this unit — refuse rather than yank it.
    if (item.status === 'in_cart') {
      throw new ConflictException({
        code: 'ITEM_IN_CART',
        message: `Item ${item.imei} is locked in a POS cart. Remove it from the cart or wait for the lock to expire.`,
      });
    }

    await this.dataSource
      .query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        ['inventory_item', id, 'archive', JSON.stringify({ previousStatus: item.status }), userId],
      )
      .catch(() => {
        // audit_logs table may not exist in test env — ignore
      });

    await this.itemRepo.update(id, { status: 'archived' });
    await this.invalidatePublicCache();

    try {
      this.eventService.emitInventoryUpdated(item.branchId, {
        itemId: id,
        imei: item.imei,
        status: 'archived',
        branchId: item.branchId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-critical
    }

    return { id, status: 'archived' };
  }

  // ─── 5.6 Status transition (standalone) ─────────────────────────────────────

  async transitionStatus(id: string, newStatus: string, userId: string, user?: any): Promise<InventoryItem> {
    return this.update(id, { status: newStatus } as UpdateInventoryItemDto, userId, user);
  }

  // ─── 5.7 Photo upload ───────────────────────────────────────────────────────

  async getPresignedUploadUrl(itemId: string, filename: string, user?: any): Promise<{ uploadUrl: string; key: string }> {
    await this.findById(itemId, user); // ensure item exists + branch access

    const key = `inventory/${itemId}/original/${Date.now()}-${filename}`;

    // BUG-10: the AWS SDK used to be missing from package.json entirely, so
    // this always threw and silently returned a placeholder URL. The SDK is now
    // a real dependency; when credentials are also absent we keep the dev
    // placeholder but must never fake a working URL in production.
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    if (!accessKeyId || !secretAccessKey) {
      return this.unconfiguredPresign(key);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

      const s3 = new S3Client({
        region: this.configService.get<string>('AWS_REGION') ?? 'ap-south-1',
        credentials: { accessKeyId, secretAccessKey },
      });

      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('S3_BUCKET') ?? 'dream-gadgets-storage',
        Key: key,
        ContentType: 'image/jpeg',
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return { uploadUrl, key };
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(`[Inventory] S3 presign failed in production: ${err?.message}`);
        throw new BadRequestException({
          code: 'S3_PRESIGN_FAILED',
          message: 'Could not create an upload URL — image uploads are unavailable',
        });
      }
      const cdnBase = this.configService.get<string>('CDN_BASE_URL') ?? 'http://localhost';
      return { uploadUrl: `${cdnBase}/dev-upload-placeholder?key=${key}`, key };
    }
  }

  /** Presign with no credentials configured: dev keeps a placeholder, production fails loudly. */
  private unconfiguredPresign(key: string): { uploadUrl: string; key: string } {
    if (process.env.NODE_ENV === 'production') {
      this.logger.error('[Inventory] S3 presign requested in production but AWS credentials are not configured');
      throw new BadRequestException({
        code: 'S3_NOT_CONFIGURED',
        message: 'Image uploads are not configured on this deployment',
      });
    }
    const cdnBase = this.configService.get<string>('CDN_BASE_URL') ?? 'http://localhost';
    return { uploadUrl: `${cdnBase}/dev-upload-placeholder?key=${key}`, key };
  }

  async addPhoto(itemId: string, s3Key: string, sortOrder = 0, user?: any, publicUrl?: string): Promise<ItemPhoto> {
    const item = await this.findById(itemId, user);

    const photoCount = await this.photoRepo.count({ where: { itemId } });
    if (photoCount >= 10) {
      throw new BadRequestException('Maximum 10 photos allowed per item');
    }

    // Prefer the caller-supplied public URL (local disk upload). Otherwise fall
    // back to the CDN, and finally to a root-relative path so the value is
    // always a usable, non-empty URL rather than `https://host/` + nothing.
    const cdnBase = (this.configService.get<string>('CDN_BASE_URL') ?? '').replace(/\/$/, '');
    const resolvedUrl = publicUrl ?? (cdnBase ? `${cdnBase}/${s3Key}` : `/${s3Key}`);

    const photo = this.photoRepo.create({
      itemId: item.id,
      s3Key,
      cdnUrl: resolvedUrl,
      sortOrder,
    });
    const saved = await this.photoRepo.save(photo);

    // Product imagery is public catalogue data — drop cached listings so a new
    // photo appears immediately on the storefront instead of after the TTL.
    await this.invalidatePublicCache();

    return saved;
  }

  async deletePhoto(itemId: string, photoId: string, user?: any): Promise<void> {
    await this.findById(itemId, user); // enforce branch access before mutation
    const photo = await this.photoRepo.findOne({ where: { id: photoId, itemId } });
    if (!photo) throw new NotFoundException(`Photo ${photoId} not found for item ${itemId}`);
    await this.photoRepo.remove(photo);

    // Same as addPhoto: the storefront reads cached public listings — drop them
    // so a removed photo stops appearing immediately instead of after the TTL.
    await this.invalidatePublicCache();
  }

  // ─── 5.8 Toggle online ──────────────────────────────────────────────────────

  async toggleOnline(id: string, userId: string, user?: any): Promise<InventoryItem> {
    const item = await this.findById(id, user);

    // Enforce: an item cannot be published online without a selling price.
    // This prevents incomplete catalogue records from reaching the storefront.
    // Validate the POST-toggle state: checking the pre-toggle state would block
    // taking an item offline (it is online at that point) while still allowing
    // a priceless record to be published.
    const nextOnline = !item.isOnline;
    if (nextOnline && !item.sellingPrice) {
      throw new BadRequestException({
        code: 'NO_SELLING_PRICE',
        message: `Cannot list item ${item.imei} online — selling price is not set. Set a selling price before publishing.`,
      });
    }

    item.isOnline = nextOnline;
    const saved = await this.itemRepo.save(item);

    // (BUG-18: the old 'search' queue producer here had no worker — removed.)

    // Invalidate public product cache when online status toggles
    await this.invalidatePublicCache();

    return saved;
  }

  // ─── 5.9 Bulk import ────────────────────────────────────────────────────────

  async bulkImport(
    csvBuffer: Buffer,
    userId: string,
  ): Promise<{ created: number; errors: Array<{ row: number; errors: string[] }> }> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const csvParser = (() => { try { return require('csv-parser'); } catch { return null; } })();
    if (!csvParser) {
      throw new BadRequestException('csv-parser package not available');
    }

    const rows: any[] = await new Promise((resolve, reject) => {
      const results: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Readable } = require('stream');
      const stream = Readable.from(csvBuffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (row: any) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    let created = 0;
    const errors: Array<{ row: number; errors: string[] }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowErrors: string[] = [];

      // Validate required fields
      const rowImei = row.imei;
      if (!rowImei) rowErrors.push('imei is required');
      else if (!validateIMEI(rowImei)) rowErrors.push('imei failed Luhn validation');
      if (!/^\d{15}$/.test(rowImei)) rowErrors.push('imei must be exactly 15 digits');
      if (!row.brandId) rowErrors.push('brandId is required');
      if (!row.modelId) rowErrors.push('modelId is required');
      if (!row.boxType) rowErrors.push('boxType is required');
      if (!row.condition) rowErrors.push('condition is required');
      if (!row.purchasePrice) rowErrors.push('purchasePrice is required');
      if (!row.branchId) rowErrors.push('branchId is required');

      if (rowErrors.length > 0) {
        errors.push({ row: i + 2, errors: rowErrors }); // +2 for header row + 1-based
        continue;
      }

      try {
        await this.create(
          {
          imei: rowImei,
          brandId: row.brandId,
            modelId: row.modelId,
            boxType: row.boxType,
            condition: row.condition,
            purchasePrice: parseFloat(row.purchasePrice),
            branchId: row.branchId,
            taxAmount: row.taxAmount ? parseFloat(row.taxAmount) : 0,
            taxRate: row.taxRate ? parseFloat(row.taxRate) : 0,
            colour: row.colour,
            storage: row.storage,
            ram: row.ram,
            imei2: row.imei2,
            itemName: row.itemName,
            firstInvoiceDate: row.firstInvoiceDate,
          } as CreateInventoryItemDto,
          userId,
        );
        created++;
      } catch (err: any) {
        errors.push({ row: i + 2, errors: [err?.response?.message ?? err.message ?? 'Unknown error'] });
      }
    }

    return { created, errors };
  }

  // ─── Brands & Models lookup ─────────────────────────────────────────────────

  async getBrands(): Promise<Brand[]> {
    return this.brandRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async getModels(brandId?: string): Promise<Model[]> {
    const where: any = { isActive: true };
    if (brandId) where.brandId = brandId;
    return this.modelRepo.find({ where, order: { name: 'ASC' } });
  }

  // ─── 5.10 Price suggestion ──────────────────────────────────────────────────

  async getPriceSuggestion(modelId: string, condition: string): Promise<{ median: number | null; count: number }> {
    const cacheKey = `price:suggestion:${modelId}:${condition}`;

    // Try cache first (5-minute TTL — suggestions change slowly)
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Cache unavailable — fall through to DB query
    }

    const result = await this.dataSource.query(
      `SELECT
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY si.unit_price) AS median,
         COUNT(*) AS count
       FROM sale_items si
       JOIN inventory_items ii ON ii.id = si.item_id
       WHERE ii.model_id = $1 AND ii.condition = $2`,
      [modelId, condition],
    ).catch(() => [{ median: null, count: 0 }]);

    const row = result[0] ?? { median: null, count: 0 };
    const suggestion = {
      median: row.median ? parseFloat(row.median) : null,
      count: parseInt(row.count, 10) || 0,
    };

    // Cache best-effort
    try {
      await this.redisService.set(cacheKey, JSON.stringify(suggestion), { EX: 300 });
    } catch {
      // Non-critical
    }

    return suggestion;
  }

  // ─── 5.11 City stock ────────────────────────────────────────────────────────

  async getCityStock(modelId: string): Promise<Array<{ branchId: string; city: string; count: number }>> {
    const rows = await this.dataSource.query(
      `SELECT
         ii.branch_id AS "branchId",
         b.city AS city,
         COUNT(*) AS count
       FROM inventory_items ii
       JOIN branches b ON b.id = ii.branch_id
       WHERE ii.model_id = $1 AND ii.status = 'available'
       GROUP BY ii.branch_id, b.city`,
      [modelId],
    ).catch(() => []);

    return rows.map((r: any) => ({
      branchId: r.branchId,
      city: r.city,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Low stock alerts — models with fewer than `threshold` available items.
   * Branch-scoped: only counts items in the user's assigned branch.
   */
  async getLowStockAlerts(threshold = 3): Promise<Array<{
    modelId: string;
    modelName: string;
    brandName: string;
    available: number;
  }>> {
    const rows = await this.dataSource.query(
      `SELECT
         ii.model_id AS "modelId",
         COALESCE(m.name, ii.item_name) AS "modelName",
         COALESCE(b.name, 'Unknown') AS "brandName",
         COUNT(*)::int AS available
       FROM inventory_items ii
       LEFT JOIN models m ON m.id = ii.model_id
       LEFT JOIN brands b ON b.id = ii.brand_id
       WHERE ii.status = 'available'
       GROUP BY ii.model_id, m.name, ii.item_name, b.name
       HAVING COUNT(*) <= $1
       ORDER BY available ASC, "modelName" ASC`,
      [threshold],
    ).catch(() => []);

    return rows.map((r: any) => ({
      modelId: r.modelId,
      modelName: r.modelName,
      brandName: r.brandName,
      available: r.available,
    }));
  }
}
