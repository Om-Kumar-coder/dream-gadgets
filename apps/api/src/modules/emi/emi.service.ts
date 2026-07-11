import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmiProvider, EmiPlan } from './emi.entity';

@Injectable()
export class EmiService {
  private readonly logger = new Logger(EmiService.name);

  constructor(
    @InjectRepository(EmiProvider)
    private providerRepo: Repository<EmiProvider>,
    @InjectRepository(EmiPlan)
    private planRepo: Repository<EmiPlan>,
  ) {}

  /**
   * Calculate monthly EMI amount using standard formula.
   * EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
   * where P = principal, r = monthly interest rate, n = number of months
   */
  static calculateEMI(principal: number, annualRate: number, tenureMonths: number, processingFee = 0): {
    emiAmount: number;
    totalInterest: number;
    totalPayment: number;
    effectivePrincipal: number;
  } {
    const effectivePrincipal = principal + processingFee;
    const monthlyRate = annualRate / 12 / 100;

    let emiAmount: number;
    if (monthlyRate === 0) {
      // No-cost EMI
      emiAmount = Math.round(effectivePrincipal / tenureMonths);
    } else {
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
  async getEligiblePlans(amount?: number, providerSlug?: string) {
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
      const effectiveAmount = amount ?? (plan.minAmount || 1);
      const calculation = EmiService.calculateEMI(
        effectiveAmount,
        Number(plan.annualRate),
        plan.tenureMonths,
        Number(plan.processingFee),
      );

      return {
        id: plan.id,
        providerId: plan.providerId,
        providerName: (plan as any).provider?.name,
        providerSlug: (plan as any).provider?.slug,
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
  async calculate(dto: { principal: number; tenureMonths: number; annualRate: number; processingFee?: number }) {
    const { principal, tenureMonths, annualRate, processingFee = 0 } = dto;

    if (principal <= 0) {
      throw new BadRequestException({ code: 'INVALID_PRINCIPAL', message: 'Principal amount must be greater than 0' });
    }

    return EmiService.calculateEMI(principal, annualRate, tenureMonths, processingFee);
  }

  // ─── Providers CRUD ───────────────────────────────────────────────────

  async getProviders(): Promise<EmiProvider[]> {
    return this.providerRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: ['plans'],
    });
  }

  async getProviderById(id: string): Promise<EmiProvider> {
    const provider = await this.providerRepo.findOne({ where: { id }, relations: ['plans'] });
    if (!provider) throw new NotFoundException(`EMI provider ${id} not found`);
    return provider;
  }

  async createProvider(dto: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<EmiProvider> {
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

  async updateProvider(id: string, dto: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<EmiProvider> {
    const provider = await this.providerRepo.findOne({ where: { id } });
    if (!provider) throw new NotFoundException(`EMI provider ${id} not found`);

    Object.assign(provider, dto);
    return this.providerRepo.save(provider);
  }

  async deleteProvider(id: string): Promise<void> {
    const result = await this.providerRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`EMI provider ${id} not found`);
  }

  // ─── Plans CRUD ───────────────────────────────────────────────────────

  async getPlans(providerId?: string, activeOnly = false): Promise<EmiPlan[]> {
    const where: any = {};
    if (providerId) where.providerId = providerId;
    if (activeOnly) where.isActive = true;

    return this.planRepo.find({
      where,
      relations: ['provider'],
      order: { sortOrder: 'ASC', tenureMonths: 'ASC' },
    });
  }

  async getPlanById(id: string): Promise<EmiPlan> {
    const plan = await this.planRepo.findOne({ where: { id }, relations: ['provider'] });
    if (!plan) throw new NotFoundException(`EMI plan ${id} not found`);
    return plan;
  }

  async createPlan(dto: {
    providerId: string;
    label: string;
    tenureMonths: number;
    minAmount?: number;
    maxAmount?: number;
    annualRate: number;
    processingFee?: number;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<EmiPlan> {
    // Verify provider exists
    const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
    if (!provider) throw new NotFoundException(`EMI provider ${dto.providerId} not found`);

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

  async updatePlan(id: string, dto: Partial<{
    label: string;
    tenureMonths: number;
    minAmount: number;
    maxAmount: number;
    annualRate: number;
    processingFee: number;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<EmiPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`EMI plan ${id} not found`);

    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const result = await this.planRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`EMI plan ${id} not found`);
  }
}
