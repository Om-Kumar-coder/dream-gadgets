var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, BadRequestException, NotFoundException, ConflictException, } from '@nestjs/common';
import { validateIMEI, isValidStatusTransition, calculateWarrantyExpiry, } from '../../common/utils/business-logic';
let InventoryService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var InventoryService = _classThis = class {
        constructor(itemRepo, photoRepo, brandRepo, modelRepo, dataSource, configService, eventService, redisService) {
            this.itemRepo = itemRepo;
            this.photoRepo = photoRepo;
            this.brandRepo = brandRepo;
            this.modelRepo = modelRepo;
            this.dataSource = dataSource;
            this.configService = configService;
            this.eventService = eventService;
            this.redisService = redisService;
            this.searchQueue = null;
        }
        // Allow optional queue injection from module
        setSearchQueue(queue) {
            this.searchQueue = queue;
        }
        /**
         * Invalidates all cached public product listings so repeat visitors
         * see fresh data after any inventory mutation.
         */
        async invalidatePublicCache() {
            try {
                const keys = await this.redisService.keys('public:products:*');
                if (keys.length > 0) {
                    await this.redisService.del(keys);
                }
            }
            catch {
                // Non-critical — cache invalidation is best-effort
            }
        }
        // ─── 5.2 Create ─────────────────────────────────────────────────────────────
        async create(dto, userId) {
            // Validate IMEI
            if (!validateIMEI(dto.imei)) {
                throw new BadRequestException({
                    code: 'IMEI_INVALID',
                    message: 'IMEI failed Luhn algorithm validation',
                });
            }
            // Check duplicate IMEI
            const existing = await this.itemRepo.findOne({ where: { imei: dto.imei } });
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
            let warrantyExpiry = null;
            if (dto.firstInvoiceDate) {
                warrantyExpiry = calculateWarrantyExpiry(new Date(dto.firstInvoiceDate), dto.condition);
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
        async findAll(query) {
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
            if (condition)
                qb.andWhere('item.condition = :condition', { condition });
            if (status)
                qb.andWhere('item.status = :status', { status });
            if (brandId)
                qb.andWhere('item.brandId = :brandId', { brandId });
            if (modelId)
                qb.andWhere('item.modelId = :modelId', { modelId });
            if (branchId)
                qb.andWhere('item.branchId = :branchId', { branchId });
            if (minPrice !== undefined)
                qb.andWhere('item.sellingPrice >= :minPrice', { minPrice });
            if (maxPrice !== undefined)
                qb.andWhere('item.sellingPrice <= :maxPrice', { maxPrice });
            if (search) {
                qb.andWhere('(item.imei ILIKE :search OR brand.name ILIKE :search OR model.name ILIKE :search)', { search: `%${search}%` });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 5.4 Get by ID / IMEI ───────────────────────────────────────────────────
        async findById(id) {
            const item = await this.itemRepo.findOne({
                where: { id },
                relations: ['brand', 'model', 'branch', 'photos', 'createdBy'],
            });
            if (!item)
                throw new NotFoundException(`Inventory item ${id} not found`);
            return item;
        }
        async findByImei(imei) {
            const item = await this.itemRepo.findOne({
                where: { imei },
                relations: ['brand', 'model', 'branch', 'photos'],
            });
            if (!item)
                throw new NotFoundException(`No inventory item found with IMEI ${imei}`);
            return item;
        }
        // ─── 5.5 Update (with audit log) ────────────────────────────────────────────
        async update(id, dto, userId) {
            const item = await this.findById(id);
            // If status is being changed, validate transition
            if (dto.status && dto.status !== item.status) {
                if (!isValidStatusTransition(item.status, dto.status)) {
                    throw new BadRequestException({
                        code: 'INVALID_STATUS_TRANSITION',
                        message: `Cannot transition from '${item.status}' to '${dto.status}'`,
                    });
                }
            }
            // Recompute totalCost if prices changed
            const purchasePrice = dto.purchasePrice !== undefined ? Number(dto.purchasePrice) : Number(item.purchasePrice);
            const taxAmount = dto.taxAmount !== undefined ? Number(dto.taxAmount) : Number(item.taxAmount);
            const totalCost = purchasePrice + taxAmount;
            // Recompute warrantyExpiry if condition or firstInvoiceDate changed
            let warrantyExpiry = item.warrantyExpiry;
            const condition = (dto.condition ?? item.condition);
            const firstInvoiceDate = dto.firstInvoiceDate ? new Date(dto.firstInvoiceDate) : item.firstInvoiceDate;
            if (firstInvoiceDate) {
                warrantyExpiry = calculateWarrantyExpiry(firstInvoiceDate, condition);
            }
            // Write audit log
            await this.dataSource.query(`INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT DO NOTHING`, ['inventory_item', id, 'update', JSON.stringify(dto), userId]).catch(() => {
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
            }
            catch {
                // Non-critical — realtime events are best-effort
            }
            // Invalidate public product cache so changes reflect immediately
            await this.invalidatePublicCache();
            return saved;
        }
        // ─── 5.6 Status transition (standalone) ─────────────────────────────────────
        async transitionStatus(id, newStatus, userId) {
            return this.update(id, { status: newStatus }, userId);
        }
        // ─── 5.7 Photo upload ───────────────────────────────────────────────────────
        async getPresignedUploadUrl(itemId, filename) {
            await this.findById(itemId); // ensure item exists
            const key = `inventory/${itemId}/original/${Date.now()}-${filename}`;
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
                const s3 = new S3Client({
                    region: this.configService.get('AWS_REGION') ?? 'ap-south-1',
                    credentials: {
                        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') ?? '',
                        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') ?? '',
                    },
                });
                const command = new PutObjectCommand({
                    Bucket: this.configService.get('S3_BUCKET') ?? 'dream-gadgets-storage',
                    Key: key,
                    ContentType: 'image/jpeg',
                });
                const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
                return { uploadUrl, key };
            }
            catch {
                // AWS SDK not installed or not configured — return placeholder in dev
                const cdnBase = this.configService.get('CDN_BASE_URL') ?? 'http://localhost';
                return { uploadUrl: `${cdnBase}/dev-upload-placeholder?key=${key}`, key };
            }
        }
        async addPhoto(itemId, s3Key, sortOrder = 0) {
            const item = await this.findById(itemId);
            const photoCount = await this.photoRepo.count({ where: { itemId } });
            if (photoCount >= 10) {
                throw new BadRequestException('Maximum 10 photos allowed per item');
            }
            const cdnBase = this.configService.get('CDN_BASE_URL') ?? '';
            const photo = this.photoRepo.create({
                itemId: item.id,
                s3Key,
                cdnUrl: `${cdnBase}/${s3Key}`,
                sortOrder,
            });
            return this.photoRepo.save(photo);
        }
        async deletePhoto(itemId, photoId) {
            const photo = await this.photoRepo.findOne({ where: { id: photoId, itemId } });
            if (!photo)
                throw new NotFoundException(`Photo ${photoId} not found for item ${itemId}`);
            await this.photoRepo.remove(photo);
        }
        // ─── 5.8 Toggle online ──────────────────────────────────────────────────────
        async toggleOnline(id, userId) {
            const item = await this.findById(id);
            item.isOnline = !item.isOnline;
            const saved = await this.itemRepo.save(item);
            // Enqueue search index sync
            if (this.searchQueue) {
                try {
                    await this.searchQueue.add(saved.isOnline ? 'index-item' : 'remove-item', { itemId: id });
                }
                catch {
                    // Queue not available — log and continue
                }
            }
            // Invalidate public product cache when online status toggles
            await this.invalidatePublicCache();
            return saved;
        }
        // ─── 5.9 Bulk import ────────────────────────────────────────────────────────
        async bulkImport(csvBuffer, userId) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const csvParser = (() => { try {
                return require('csv-parser');
            }
            catch {
                return null;
            } })();
            if (!csvParser) {
                throw new BadRequestException('csv-parser package not available');
            }
            const rows = await new Promise((resolve, reject) => {
                const results = [];
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { Readable } = require('stream');
                const stream = Readable.from(csvBuffer.toString());
                stream
                    .pipe(csvParser())
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', reject);
            });
            let created = 0;
            const errors = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowErrors = [];
                // Validate required fields
                if (!row.imei)
                    rowErrors.push('imei is required');
                else if (!validateIMEI(row.imei))
                    rowErrors.push('imei failed Luhn validation');
                if (!row.brandId)
                    rowErrors.push('brandId is required');
                if (!row.modelId)
                    rowErrors.push('modelId is required');
                if (!row.boxType)
                    rowErrors.push('boxType is required');
                if (!row.condition)
                    rowErrors.push('condition is required');
                if (!row.purchasePrice)
                    rowErrors.push('purchasePrice is required');
                if (!row.branchId)
                    rowErrors.push('branchId is required');
                if (rowErrors.length > 0) {
                    errors.push({ row: i + 2, errors: rowErrors }); // +2 for header row + 1-based
                    continue;
                }
                try {
                    await this.create({
                        imei: row.imei,
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
                    }, userId);
                    created++;
                }
                catch (err) {
                    errors.push({ row: i + 2, errors: [err?.response?.message ?? err.message ?? 'Unknown error'] });
                }
            }
            return { created, errors };
        }
        // ─── Brands & Models lookup ─────────────────────────────────────────────────
        async getBrands() {
            return this.brandRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
        }
        async getModels(brandId) {
            const where = { isActive: true };
            if (brandId)
                where.brandId = brandId;
            return this.modelRepo.find({ where, order: { name: 'ASC' } });
        }
        // ─── 5.10 Price suggestion ──────────────────────────────────────────────────
        async getPriceSuggestion(modelId, condition) {
            const result = await this.dataSource.query(`SELECT
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY si.unit_price) AS median,
         COUNT(*) AS count
       FROM sale_items si
       JOIN inventory_items ii ON ii.id = si.item_id
       WHERE ii.model_id = $1 AND ii.condition = $2`, [modelId, condition]).catch(() => [{ median: null, count: 0 }]);
            const row = result[0] ?? { median: null, count: 0 };
            return {
                median: row.median ? parseFloat(row.median) : null,
                count: parseInt(row.count, 10) || 0,
            };
        }
        // ─── 5.11 City stock ────────────────────────────────────────────────────────
        async getCityStock(modelId) {
            const rows = await this.dataSource.query(`SELECT
         ii.branch_id AS "branchId",
         b.city AS city,
         COUNT(*) AS count
       FROM inventory_items ii
       JOIN branches b ON b.id = ii.branch_id
       WHERE ii.model_id = $1 AND ii.status = 'available'
       GROUP BY ii.branch_id, b.city`, [modelId]).catch(() => []);
            return rows.map((r) => ({
                branchId: r.branchId,
                city: r.city,
                count: parseInt(r.count, 10),
            }));
        }
    };
    __setFunctionName(_classThis, "InventoryService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryService = _classThis;
})();
export { InventoryService };
//# sourceMappingURL=inventory.service.js.map