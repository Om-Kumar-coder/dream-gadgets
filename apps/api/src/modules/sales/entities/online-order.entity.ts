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
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { Client } from '../../client/entities/client.entity';
import { Branch, User } from '../../auth/entities/user.entity';
import { Payment } from './payment.entity';

@Entity('online_orders')
export class OnlineOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @ManyToOne(() => Client, { eager: false, nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client | null;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string | null;

  @ManyToOne(() => Branch, { eager: false, nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: OnlineOrderStatus.PENDING_PAYMENT,
  })
  status: OnlineOrderStatus;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @Column('decimal', { name: 'shipping_charge', precision: 12, scale: 2, default: 0 })
  shippingCharge: number;

  @Column('decimal', { name: 'discount_amount', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { name: 'total_amount', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @Column({ name: 'tracking_number', type: 'varchar', nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'courier', type: 'varchar', nullable: true })
  courier: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User | null;

  @Column({ name: 'assigned_to', nullable: true, type: 'varchar' })
  assignedToId: string | null;

  @Column({ name: 'ordered_at', type: 'timestamptz', default: () => 'NOW()' })
  orderedAt: Date;

  @Column({ name: 'shipped_at', nullable: true, type: 'timestamptz' })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', nullable: true, type: 'timestamptz' })
  deliveredAt: Date | null;

  @OneToMany(() => Payment, (p) => p.onlineOrder)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
