import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';

@Entity('stock_transfer_items')
export class StockTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockTransfer, (t) => t.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: StockTransfer;

  @Column({ name: 'transfer_id' })
  transferId: string;

  @ManyToOne(() => InventoryItem, { eager: false, nullable: false })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({ length: 15 })
  imei: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;
}
