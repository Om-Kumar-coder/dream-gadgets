import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Purchase, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @Column({ name: 'purchase_id', type: 'uuid' })
  purchaseId: string;

  /** Linked inventory item — null for non-stock lines (expenses, services). */
  @ManyToOne(() => InventoryItem, { eager: false, nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem | null;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId: string | null;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ name: 'hsn_code', type: 'varchar', length: 10, nullable: true })
  hsnCode: string | null;

  @Column('decimal', { precision: 12, scale: 3, default: 1 })
  quantity: number;

  /** Taxable value per unit. */
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice: number;

  /** GST rate in percent (e.g. 18). */
  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  /** quantity * unit_price. */
  @Column({ name: 'taxable_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxableValue: number;

  @Column({ name: 'cgst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  cgstAmount: number;

  @Column({ name: 'sgst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  sgstAmount: number;

  @Column({ name: 'igst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  igstAmount: number;

  /** Line total tax = cgst + sgst + igst. */
  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  /** taxable_value + tax_amount. */
  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
