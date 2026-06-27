import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'sale_id' })
  saleId: string;

  @Column({ name: 'item_id', nullable: true, type: 'varchar' })
  itemId: string;

  @Column({ name: 'accessory_id', nullable: true, type: 'varchar' })
  accessoryId: string | null;

  @Column({ type: 'int', nullable: true, default: 1 })
  quantity: number;

  @Column({ length: 15 })
  imei: string;

  @Column({ length: 500, nullable: true, type: 'varchar' })
  description: string;

  @Column('decimal', { name: 'unit_price', precision: 12, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { name: 'tax_rate', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'hsn_code', type: 'varchar', length: 20, nullable: true })
  hsnCode: string | null;
}
