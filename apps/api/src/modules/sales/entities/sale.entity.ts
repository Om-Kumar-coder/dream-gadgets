import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch, User } from '../../auth/entities/user.entity';
import { SaleItem } from './sale-item.entity';
import { Payment } from './payment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string | null;

  @ManyToOne(() => Branch, { eager: false, nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @Column('decimal', { name: 'discount_amount', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { name: 'total_amount', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'payment_status', default: 'paid' })
  paymentStatus: string;

  @Column({ name: 'sale_type', default: 'in-store' })
  saleType: string;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  // DB column is 'created_by' not 'created_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdById: string;

  @Column({ name: 'sale_date', type: 'timestamptz', default: () => 'NOW()' })
  saleDate: Date;

  // is_voided, voided_by, voided_at don't exist in DB yet — make them virtual/ignored
  isVoided: boolean = false;
  voidedById: string | null = null;
  voidedAt: Date | null = null;

  @OneToMany(() => SaleItem, (i) => i.sale)
  items: SaleItem[];

  @OneToMany(() => Payment, (p) => p.sale)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
