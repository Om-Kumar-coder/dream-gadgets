import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnlineOrder } from './online-order.entity';

@Entity('online_order_items')
export class OnlineOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnlineOrder, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OnlineOrder;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'item_id', nullable: true, type: 'uuid' })
  itemId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  imei: string | null;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  description: string | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'hsn_code', nullable: true, type: 'varchar', length: 20 })
  hsnCode: string | null;
}
