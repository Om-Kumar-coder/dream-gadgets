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
let WhatsappTemplateService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WhatsappTemplateService = _classThis = class {
        constructor(templateRepo, campaignRepo, notificationService) {
            this.templateRepo = templateRepo;
            this.campaignRepo = campaignRepo;
            this.notificationService = notificationService;
            this.logger = new Logger(WhatsappTemplateService.name);
        }
        // ─── Templates ──────────────────────────────────────────────────────────────
        async createTemplate(dto) {
            const template = this.templateRepo.create(dto);
            return this.templateRepo.save(template);
        }
        async getTemplates(query) {
            const { page = 1, limit = 20, category, status, search } = query;
            const qb = this.templateRepo
                .createQueryBuilder('t')
                .orderBy('t.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (category)
                qb.andWhere('t.category = :category', { category });
            if (status)
                qb.andWhere('t.status = :status', { status });
            if (search)
                qb.andWhere('(t.name ILIKE :search OR t.body ILIKE :search)', { search: `%${search}%` });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        async getTemplateById(id) {
            const template = await this.templateRepo.findOne({ where: { id } });
            if (!template)
                throw new NotFoundException(`Template ${id} not found`);
            return template;
        }
        async updateTemplate(id, dto) {
            const template = await this.getTemplateById(id);
            Object.assign(template, dto);
            return this.templateRepo.save(template);
        }
        async deleteTemplate(id) {
            const template = await this.getTemplateById(id);
            await this.templateRepo.remove(template);
        }
        // ─── Campaigns ──────────────────────────────────────────────────────────────
        async createCampaign(dto) {
            const campaign = this.campaignRepo.create(dto);
            return this.campaignRepo.save(campaign);
        }
        async getCampaigns(query) {
            const { page = 1, limit = 20, status, type, search } = query;
            const qb = this.campaignRepo
                .createQueryBuilder('c')
                .orderBy('c.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (status)
                qb.andWhere('c.status = :status', { status });
            if (type)
                qb.andWhere('c.type = :type', { type });
            if (search)
                qb.andWhere('c.name ILIKE :search', { search: `%${search}%` });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        async getCampaignById(id) {
            const campaign = await this.campaignRepo.findOne({ where: { id } });
            if (!campaign)
                throw new NotFoundException(`Campaign ${id} not found`);
            return campaign;
        }
        async updateCampaign(id, dto) {
            const campaign = await this.getCampaignById(id);
            Object.assign(campaign, dto);
            return this.campaignRepo.save(campaign);
        }
        async deleteCampaign(id) {
            const campaign = await this.getCampaignById(id);
            await this.campaignRepo.remove(campaign);
        }
        async launchCampaign(id) {
            const campaign = await this.getCampaignById(id);
            campaign.status = 'sending';
            campaign.sentAt = new Date();
            return this.campaignRepo.save(campaign);
        }
        async getCampaignStats(id) {
            const campaign = await this.getCampaignById(id);
            const clickRate = campaign.sentCount > 0 ? (campaign.clickCount / campaign.sentCount) * 100 : 0;
            const conversionRate = campaign.sentCount > 0 ? (campaign.conversionCount / campaign.sentCount) * 100 : 0;
            return {
                total: campaign.totalRecipients,
                sent: campaign.sentCount,
                delivered: campaign.deliveredCount,
                read: campaign.readCount,
                failed: campaign.failedCount,
                clickRate: Math.round(clickRate * 100) / 100,
                conversionRate: Math.round(conversionRate * 100) / 100,
            };
        }
    };
    __setFunctionName(_classThis, "WhatsappTemplateService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappTemplateService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappTemplateService = _classThis;
})();
export { WhatsappTemplateService };
//# sourceMappingURL=whatsapp-template.service.js.map