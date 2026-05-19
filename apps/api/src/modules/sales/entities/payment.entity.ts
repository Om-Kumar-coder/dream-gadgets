import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { OnlineOrder } from './online-order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (s) => s.payments, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'sale_id', nullable: true, type: 'varchar' })
  saleId: string | null;

  @ManyToOne(() => OnlineOrder, (o) => o.payments, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'online_order_id' })
  onlineOrder: OnlineOrder;

  @Column({ name: 'online_order_id', nullable: true, type: 'varchar' })
  onlineOrderId: string | null;

  @Column({ length: 50 })
  method: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  reference: string | null;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @Column({ name: 'razorpay_order_id', nullable: true, type: 'varchar' })
  razorpayOrderId: string | null;

  @Column({ name: 'razorpay_payment_id', nullable: true, type: 'varchar' })
  razorpayPaymentId: string | null;

  @Column({ name: 'razorpay_signature', nullable: true, type: 'varchar' })
  razorpaySignature: string | null;

  @Column({ default: 'completed' })
  status: string;

  @Column({ name: 'emi_plan', nullable: true, type: 'jsonb' })
  emiPlan: object | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
