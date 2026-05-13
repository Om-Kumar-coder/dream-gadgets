import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity('item_photos')
export class ItemPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryItem, (item) => item.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ name: 'cdn_url', nullable: true, type: 'varchar' })
  cdnUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
