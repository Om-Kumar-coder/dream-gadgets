import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('emi_providers')
export class EmiProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EmiPlan, (plan) => plan.provider)
  plans: EmiPlan[];
}

@Entity('emi_plans')
export class EmiPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @ManyToOne(() => EmiProvider, (provider) => provider.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: EmiProvider;

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ name: 'tenure_months', type: 'integer' })
  tenureMonths: number;

  @Column({ name: 'min_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ name: 'max_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  maxAmount: number | null;

  @Column({ name: 'annual_rate', type: 'numeric', precision: 5, scale: 2 })
  annualRate: number;

  @Column({ name: 'processing_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
