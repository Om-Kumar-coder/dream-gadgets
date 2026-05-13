import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Model } from './model.entity';
import { Branch } from './branch.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('accessories')
export class Accessory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  sku: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @ManyToOne(() => Brand, { eager: false, nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'brand_id', nullable: true, type: 'uuid' })
  brandId: string;

  @ManyToOne(() => Model, { eager: false, nullable: true })
  @JoinColumn({ name: 'model_id' })
  model: Model;

  @Column({ name: 'model_id', nullable: true, type: 'uuid' })
  modelId: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // charger, case, screen_guard, earphones, cable, power_bank, etc.

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  wholesalePrice: number;

  @Column({ type: 'smallint', default: 0 })
  stockQuantity: number;

  @Column({ type: 'smallint', default: 10 })
  reorderLevel: number;

  @Column({ type: 'varchar', length: 20, default: 'available' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hsnCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Branch, { eager: false, nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id', nullable: true, type: 'uuid' })
  branchId: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: object;

  @Column({ type: 'jsonb', nullable: true })
  photos: object;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true, type: 'uuid' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}