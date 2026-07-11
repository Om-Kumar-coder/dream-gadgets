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
import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { calculateExchangePrice } from '../../common/utils/business-logic';
let ExchangeService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ExchangeService = _classThis = class {
        constructor(exchangeRepo, itemRepo) {
            this.exchangeRepo = exchangeRepo;
            this.itemRepo = itemRepo;
        }
        // ─── 10.2 Create exchange ────────────────────────────────────────────────────
        async create(dto, userId) {
            const exchange = this.exchangeRepo.create({
                ...dto,
                createdById: userId,
                addedToInventory: false,
                kycVerified: dto.kycVerified ?? false,
            });
            return this.exchangeRepo.save(exchange);
        }
        // ─── 10.5 List exchanges ─────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, clientId, modelId, condition, search, addedToInventory } = query;
            const qb = this.exchangeRepo
                .createQueryBuilder('exchange')
                .orderBy('exchange.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (clientId)
                qb.andWhere('exchange.clientId = :clientId', { clientId });
            if (modelId)
                qb.andWhere('exchange.modelId = :modelId', { modelId });
            if (condition)
                qb.andWhere('exchange.condition = :condition', { condition });
            if (search) {
                qb.andWhere('exchange.imei ILIKE :search', { search: `%${search}%` });
            }
            if (addedToInventory !== undefined) {
                qb.andWhere('exchange.addedToInventory = :addedToInventory', { addedToInventory });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 10.5 Get exchange by ID ─────────────────────────────────────────────────
        async findById(id) {
            const exchange = await this.exchangeRepo.findOne({
                where: { id },
                relations: ['createdBy'],
            });
            if (!exchange)
                throw new NotFoundException(`Exchange ${id} not found`);
            return exchange;
        }
        // ─── 10.5 Update exchange ────────────────────────────────────────────────────
        async update(id, dto) {
            const exchange = await this.exchangeRepo.findOne({ where: { id } });
            if (!exchange)
                throw new NotFoundException(`Exchange ${id} not found`);
            Object.assign(exchange, dto);
            return this.exchangeRepo.save(exchange);
        }
        // ─── 10.3 Price suggestion ───────────────────────────────────────────────────
        async suggestPrice(params) {
            const { basePrice, batteryHealth, monthsSinceFirstInvoice } = params;
            const suggestedPrice = calculateExchangePrice(basePrice, batteryHealth, monthsSinceFirstInvoice);
            return { suggestedPrice, batteryHealth, monthsSinceFirstInvoice, basePrice };
        }
        // ─── 10.4 Add exchanged device to inventory ──────────────────────────────────
        async addToInventory(id, inventoryData) {
            const exchange = await this.exchangeRepo.findOne({ where: { id } });
            if (!exchange)
                throw new NotFoundException(`Exchange ${id} not found`);
            if (exchange.addedToInventory) {
                throw new BadRequestException({
                    code: 'ALREADY_IN_INVENTORY',
                    message: 'This exchange device has already been added to inventory',
                });
            }
            const purchasePrice = inventoryData.purchasePrice ?? Number(exchange.exchangePrice);
            const taxRate = inventoryData.taxRate ?? 0;
            const taxAmount = (purchasePrice * taxRate) / 100;
            const totalCost = purchasePrice + taxAmount;
            // Create inventory item from exchange device data
            const newItem = this.itemRepo.create({
                imei: exchange.imei ?? `EX-${Date.now()}`,
                brandId: exchange.brandId ?? undefined,
                modelId: exchange.modelId ?? undefined,
                colour: exchange.colour ?? undefined,
                storage: exchange.storage ?? undefined,
                condition: exchange.condition ?? 'good',
                batteryHealth: exchange.batteryHealth ?? undefined,
                boxType: inventoryData.boxType ?? 'without_box',
                purchasePrice,
                taxRate,
                taxAmount,
                totalCost,
                status: 'available',
                branchId: inventoryData.branchId,
                createdById: inventoryData.createdById ?? exchange.createdById,
                notes: `Added from exchange ${id}`,
            });
            const savedItem = await this.itemRepo.save(newItem);
            // Update exchange record
            exchange.addedToInventory = true;
            exchange.inventoryItemId = savedItem.id;
            await this.exchangeRepo.save(exchange);
            return this.findById(id);
        }
        // ─── 10.6 Price guide ────────────────────────────────────────────────────────
        async getPriceGuide(modelId) {
            try {
                // Query exchange_price_guide table if it exists
                const qb = this.exchangeRepo.manager
                    .createQueryBuilder()
                    .select(['epg.model_id AS "modelId"', 'epg.condition AS condition', 'epg.base_price AS "basePrice"'])
                    .from('exchange_price_guide', 'epg');
                if (modelId) {
                    qb.where('epg.model_id = :modelId', { modelId });
                }
                return await qb.getRawMany();
            }
            catch {
                // Table doesn't exist — return empty array gracefully
                return [];
            }
        }
    };
    __setFunctionName(_classThis, "ExchangeService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExchangeService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExchangeService = _classThis;
})();
export { ExchangeService };
//# sourceMappingURL=exchange.service.js.map