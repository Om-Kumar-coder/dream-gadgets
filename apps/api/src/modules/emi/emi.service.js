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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
let EmiService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EmiService = _classThis = class {
        constructor(providerRepo, planRepo) {
            this.providerRepo = providerRepo;
            this.planRepo = planRepo;
            this.logger = new Logger(EmiService.name);
        }
        /**
         * Calculate monthly EMI amount using standard formula.
         * EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
         * where P = principal, r = monthly interest rate, n = number of months
         */
        static calculateEMI(principal, annualRate, tenureMonths, processingFee = 0) {
            const effectivePrincipal = principal + processingFee;
            const monthlyRate = annualRate / 12 / 100;
            let emiAmount;
            if (monthlyRate === 0) {
                // No-cost EMI
                emiAmount = Math.round(effectivePrincipal / tenureMonths);
            }
            else {
                const factor = Math.pow(1 + monthlyRate, tenureMonths);
                emiAmount = Math.round((effectivePrincipal * monthlyRate * factor) / (factor - 1));
            }
            const totalPayment = emiAmount * tenureMonths;
            const totalInterest = totalPayment - effectivePrincipal;
            return {
                emiAmount,
                totalInterest: Math.max(0, Math.round(totalInterest)),
                totalPayment: Math.round(totalPayment),
                effectivePrincipal: Math.round(effectivePrincipal),
            };
        }
        // ─── Public endpoints ─────────────────────────────────────────────────
        /**
         * Get all eligible EMI plans for a given amount.
         * Filters by min_amount/max_amount and sorts by sort_order.
         */
        async getEligiblePlans(amount, providerSlug) {
            const qb = this.planRepo
                .createQueryBuilder('plan')
                .innerJoinAndSelect('plan.provider', 'provider')
                .where('plan.is_active = true')
                .andWhere('provider.is_active = true')
                .orderBy('provider.sort_order', 'ASC')
                .addOrderBy('plan.sort_order', 'ASC');
            if (amount !== undefined && amount > 0) {
                qb.andWhere('plan.min_amount <= :amount', { amount });
                qb.andWhere('(plan.max_amount IS NULL OR plan.max_amount >= :amount)', { amount });
            }
            if (providerSlug) {
                qb.andWhere('provider.slug = :providerSlug', { providerSlug });
            }
            const plans = await qb.getMany();
            // Enrich with calculated EMI
            return plans.map((plan) => {
                const calculation = EmiService.calculateEMI(amount ?? plan.minAmount || 1, Number(plan.annualRate), plan.tenureMonths, Number(plan.processingFee));
                return {
                    id: plan.id,
                    providerId: plan.providerId,
                    providerName: plan.provider?.name,
                    providerSlug: plan.provider?.slug,
                    label: plan.label,
                    tenureMonths: plan.tenureMonths,
                    annualRate: Number(plan.annualRate),
                    processingFee: Number(plan.processingFee),
                    minAmount: Number(plan.minAmount),
                    ...calculation,
                };
            });
        }
        /**
         * Calculate EMI for a specific principal, tenure, and rate.
         */
        async calculate(dto) {
            const { principal, tenureMonths, annualRate, processingFee = 0 } = dto;
            if (principal <= 0) {
                throw new BadRequestException({ code: 'INVALID_PRINCIPAL', message: 'Principal amount must be greater than 0' });
            }
            return EmiService.calculateEMI(principal, annualRate, tenureMonths, processingFee);
        }
        // ─── Providers CRUD ───────────────────────────────────────────────────
        async getProviders() {
            return this.providerRepo.find({
                order: { sortOrder: 'ASC', name: 'ASC' },
                relations: ['plans'],
            });
        }
        async getProviderById(id) {
            const provider = await this.providerRepo.findOne({ where: { id }, relations: ['plans'] });
            if (!provider)
                throw new NotFoundException(`EMI provider ${id} not found`);
            return provider;
        }
        async createProvider(dto) {
            const provider = this.providerRepo.create({
                name: dto.name,
                slug: dto.slug,
                description: dto.description ?? null,
                logoUrl: dto.logoUrl ?? null,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            });
            // Check for duplicate slug
            const existing = await this.providerRepo.findOne({ where: { slug: dto.slug } });
            if (existing) {
                throw new BadRequestException({ code: 'DUPLICATE_SLUG', message: `EMI provider with slug "${dto.slug}" already exists` });
            }
            return this.providerRepo.save(provider);
        }
        async updateProvider(id, dto) {
            const provider = await this.providerRepo.findOne({ where: { id } });
            if (!provider)
                throw new NotFoundException(`EMI provider ${id} not found`);
            Object.assign(provider, dto);
            return this.providerRepo.save(provider);
        }
        async deleteProvider(id) {
            const result = await this.providerRepo.delete(id);
            if (result.affected === 0)
                throw new NotFoundException(`EMI provider ${id} not found`);
        }
        // ─── Plans CRUD ───────────────────────────────────────────────────────
        async getPlans(providerId, activeOnly = false) {
            const where = {};
            if (providerId)
                where.providerId = providerId;
            if (activeOnly)
                where.isActive = true;
            return this.planRepo.find({
                where,
                relations: ['provider'],
                order: { sortOrder: 'ASC', tenureMonths: 'ASC' },
            });
        }
        async getPlanById(id) {
            const plan = await this.planRepo.findOne({ where: { id }, relations: ['provider'] });
            if (!plan)
                throw new NotFoundException(`EMI plan ${id} not found`);
            return plan;
        }
        async createPlan(dto) {
            // Verify provider exists
            const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
            if (!provider)
                throw new NotFoundException(`EMI provider ${dto.providerId} not found`);
            const plan = this.planRepo.create({
                providerId: dto.providerId,
                label: dto.label,
                tenureMonths: dto.tenureMonths,
                minAmount: dto.minAmount ?? 0,
                maxAmount: dto.maxAmount ?? null,
                annualRate: dto.annualRate,
                processingFee: dto.processingFee ?? 0,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            });
            return this.planRepo.save(plan);
        }
        async updatePlan(id, dto) {
            const plan = await this.planRepo.findOne({ where: { id } });
            if (!plan)
                throw new NotFoundException(`EMI plan ${id} not found`);
            Object.assign(plan, dto);
            return this.planRepo.save(plan);
        }
        async deletePlan(id) {
            const result = await this.planRepo.delete(id);
            if (result.affected === 0)
                throw new NotFoundException(`EMI plan ${id} not found`);
        }
    };
    __setFunctionName(_classThis, "EmiService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmiService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmiService = _classThis;
})();
export { EmiService };
//# sourceMappingURL=emi.service.js.map