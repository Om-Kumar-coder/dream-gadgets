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
let AccessoryService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AccessoryService = _classThis = class {
        constructor(accessoryRepo) {
            this.accessoryRepo = accessoryRepo;
        }
        // ─── Create accessory ─────────────────────────────────────────────────────────
        async create(dto, userId) {
            // Check duplicate SKU
            const existing = await this.accessoryRepo.findOne({ where: { sku: dto.sku } });
            if (existing) {
                throw new ConflictException({
                    code: 'SKU_DUPLICATE',
                    message: `An accessory with SKU ${dto.sku} already exists`,
                });
            }
            const accessory = this.accessoryRepo.create({
                ...dto,
                createdById: userId,
                status: 'available',
            });
            return this.accessoryRepo.save(accessory);
        }
        // ─── List accessories (paginated + filtered) ────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, category, status, brandId, minPrice, maxPrice, search } = query;
            const qb = this.accessoryRepo
                .createQueryBuilder('acc')
                .leftJoinAndSelect('acc.brand', 'brand')
                .leftJoinAndSelect('acc.model', 'model')
                .leftJoinAndSelect('acc.branch', 'branch')
                .orderBy('acc.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (category)
                qb.andWhere('acc.category = :category', { category });
            if (status)
                qb.andWhere('acc.status = :status', { status });
            if (brandId)
                qb.andWhere('acc.brandId = :brandId', { brandId });
            if (minPrice !== undefined)
                qb.andWhere('acc.sellingPrice >= :minPrice', { minPrice });
            if (maxPrice !== undefined)
                qb.andWhere('acc.sellingPrice <= :maxPrice', { maxPrice });
            if (search) {
                qb.andWhere('(acc.sku ILIKE :search OR acc.name ILIKE :search OR brand.name ILIKE :search)', { search: `%${search}%` });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── Get by ID / SKU ────────────────────────────────────────────────────────
        async findById(id) {
            const accessory = await this.accessoryRepo.findOne({
                where: { id },
                relations: ['brand', 'model', 'branch'],
            });
            if (!accessory)
                throw new NotFoundException(`Accessory ${id} not found`);
            return accessory;
        }
        async findBySku(sku) {
            const accessory = await this.accessoryRepo.findOne({
                where: { sku },
                relations: ['brand', 'model', 'branch'],
            });
            if (!accessory)
                throw new NotFoundException(`No accessory found with SKU ${sku}`);
            return accessory;
        }
        // ─── Update accessory ───────────────────────────────────────────────────────
        async update(id, dto) {
            const accessory = await this.findById(id);
            // Check duplicate SKU if changing
            if (dto.sku && dto.sku !== accessory.sku) {
                const existing = await this.accessoryRepo.findOne({ where: { sku: dto.sku } });
                if (existing && existing.id !== id) {
                    throw new ConflictException({
                        code: 'SKU_DUPLICATE',
                        message: `An accessory with SKU ${dto.sku} already exists`,
                    });
                }
            }
            Object.assign(accessory, dto);
            return this.accessoryRepo.save(accessory);
        }
        // ─── Stock adjustment ───────────────────────────────────────────────────────
        async adjustStock(id, quantity, reason) {
            const accessory = await this.findById(id);
            accessory.stockQuantity += quantity;
            if (accessory.stockQuantity < 0) {
                throw new BadRequestException({
                    code: 'INSUFFICIENT_STOCK',
                    message: `Insufficient stock. Current: ${accessory.stockQuantity}, Requested: ${quantity}`,
                });
            }
            return this.accessoryRepo.save(accessory);
        }
        // ─── Toggle online ──────────────────────────────────────────────────────────
        async toggleOnline(id) {
            const accessory = await this.findById(id);
            accessory.isOnline = !accessory.isOnline;
            return this.accessoryRepo.save(accessory);
        }
        // ─── Low stock alert ────────────────────────────────────────────────────────
        async getLowStockAlerts() {
            return this.accessoryRepo.query(`
      SELECT a.* 
      FROM accessories a
      WHERE a.stock_quantity < a.reorder_level
    `);
        }
    };
    __setFunctionName(_classThis, "AccessoryService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AccessoryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AccessoryService = _classThis;
})();
export { AccessoryService };
//# sourceMappingURL=accessory.service.js.map