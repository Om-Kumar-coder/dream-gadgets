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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
let BuybackService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BuybackService = _classThis = class {
        constructor(leadRepo, photoRepo, notificationService, configService) {
            this.leadRepo = leadRepo;
            this.photoRepo = photoRepo;
            this.notificationService = notificationService;
            this.configService = configService;
            this.logger = new Logger(BuybackService.name);
            this.notifyEmail = this.configService.get('NOTIFICATION_EMAIL') ?? 'owner@dreamgadgets.in';
            this.notifyPhone = this.configService.get('NOTIFICATION_PHONE') ?? '';
            const webUrl = this.configService.get('ADMIN_URL') ?? 'http://localhost:3002';
            this.adminUrl = `${webUrl}/buyback`;
        }
        async create(dto) {
            const lead = this.leadRepo.create({
                brand: dto.brand,
                modelName: dto.modelName,
                phone: dto.phone,
                deviceType: dto.deviceType ?? 'mobile',
                screenCondition: dto.screenCondition ?? null,
                bodyCondition: dto.bodyCondition ?? null,
                batteryHealth: dto.batteryHealth ?? null,
                functionalIssues: dto.functionalIssues ?? null,
            });
            const saved = await this.leadRepo.save(lead);
            this.logger.log(`New buyback lead created: ${saved.id} — ${dto.brand} ${dto.modelName} (${dto.phone})`);
            // ── Notify shop owner(s) ──────────────────────────────────────────────
            this.sendNotifications(saved).catch((err) => this.logger.warn(`Failed to send buyback notification: ${err?.message}`));
            return saved;
        }
        async sendNotifications(lead) {
            const vars = {
                brand: lead.brand,
                model: lead.modelName,
                phone: lead.phone,
                date: lead.createdAt?.toLocaleString('en-IN') ?? new Date().toLocaleString('en-IN'),
                adminUrl: this.adminUrl,
            };
            // Email notification
            if (this.notifyEmail) {
                await this.notificationService.sendEmail({
                    to: this.notifyEmail,
                    type: 'buyback_lead',
                    templateKey: 'buyback_lead',
                    templateVars: vars,
                    metadata: { leadId: lead.id, brand: lead.brand, model: lead.modelName, phone: lead.phone },
                });
            }
            // SMS notification (if phone is configured)
            if (this.notifyPhone) {
                await this.notificationService.sendSms({
                    to: this.notifyPhone,
                    type: 'buyback_lead',
                    body: `New Buyback: ${lead.brand} ${lead.modelName} — ${lead.phone}`,
                    metadata: { leadId: lead.id, brand: lead.brand, model: lead.modelName, phone: lead.phone },
                });
            }
        }
        async findAll(query) {
            const { page = 1, limit = 20, status, search } = query;
            const offset = (page - 1) * limit;
            const qb = this.leadRepo
                .createQueryBuilder('lead')
                .orderBy('lead.createdAt', 'DESC')
                .skip(offset)
                .take(limit);
            if (status)
                qb.andWhere('lead.status = :status', { status });
            if (search) {
                qb.andWhere('(lead.brand ILIKE :search OR lead.modelName ILIKE :search OR lead.phone ILIKE :search)', { search: `%${search}%` });
            }
            const [items, total] = await qb.getManyAndCount();
            return { data: items, total, page, limit };
        }
        async getStats() {
            const total = await this.leadRepo.count();
            const byStatus = await this.leadRepo
                .createQueryBuilder('lead')
                .select('lead.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('lead.status')
                .orderBy('COUNT(*)', 'DESC')
                .getRawMany();
            const byScreenCondition = await this.leadRepo
                .createQueryBuilder('lead')
                .select('lead.screenCondition', 'value')
                .addSelect('COUNT(*)', 'count')
                .where('lead.screenCondition IS NOT NULL')
                .groupBy('lead.screenCondition')
                .orderBy('COUNT(*)', 'DESC')
                .getRawMany();
            const byBodyCondition = await this.leadRepo
                .createQueryBuilder('lead')
                .select('lead.bodyCondition', 'value')
                .addSelect('COUNT(*)', 'count')
                .where('lead.bodyCondition IS NOT NULL')
                .groupBy('lead.bodyCondition')
                .orderBy('COUNT(*)', 'DESC')
                .getRawMany();
            const byBatteryHealth = await this.leadRepo
                .createQueryBuilder('lead')
                .select('lead.batteryHealth', 'value')
                .addSelect('COUNT(*)', 'count')
                .where('lead.batteryHealth IS NOT NULL')
                .groupBy('lead.batteryHealth')
                .orderBy('COUNT(*)', 'DESC')
                .getRawMany();
            const weeklyTrend = await this.leadRepo
                .createQueryBuilder('lead')
                .select("TO_CHAR(lead.createdAt, 'Dy')", 'date')
                .addSelect('COUNT(*)', 'count')
                .where('lead.createdAt >= NOW() - INTERVAL \'7 days\'')
                .groupBy('date')
                .addGroupBy("DATE_TRUNC('day', lead.createdAt)")
                .orderBy("DATE_TRUNC('day', lead.createdAt)")
                .getRawMany();
            return { total, byStatus, byScreenCondition, byBodyCondition, byBatteryHealth, weeklyTrend };
        }
        // ─── Photo upload ───────────────────────────────────────────────────────────
        async addPhoto(leadId, url, sortOrder = 0) {
            const lead = await this.leadRepo.findOne({ where: { id: leadId } });
            if (!lead)
                throw new NotFoundException(`Buyback lead ${leadId} not found`);
            const photo = this.photoRepo.create({ leadId, url, sortOrder });
            return this.photoRepo.save(photo);
        }
        async getPhotos(leadId) {
            return this.photoRepo.find({
                where: { leadId },
                order: { sortOrder: 'ASC', createdAt: 'ASC' },
            });
        }
        async findById(id) {
            return this.leadRepo.findOne({ where: { id }, relations: ['photos'] });
        }
        async updateStatus(id, status, notes) {
            await this.leadRepo.update(id, { status, ...(notes !== undefined ? { notes } : {}) });
            return this.findById(id);
        }
    };
    __setFunctionName(_classThis, "BuybackService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BuybackService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BuybackService = _classThis;
})();
export { BuybackService };
//# sourceMappingURL=buyback.service.js.map