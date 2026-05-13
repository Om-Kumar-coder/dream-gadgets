import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('exchange_devices')
export class ExchangeDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string | null;

  @Column({ name: 'sale_id', nullable: true, type: 'varchar' })
  saleId: string | null;

  @Column({ name: 'brand_id', nullable: true, type: 'varchar' })
  brandId: string | null;

  @Column({ name: 'model_id', nullable: true, type: 'varchar' })
  modelId: string | null;

  @Column({ nullable: true, type: 'varchar', length: 15 })
  imei: string | null;

  @Column({ nullable: true, type: 'varchar' })
  colour: string | null;

  @Column({ nullable: true, type: 'varchar' })
  storage: string | null;

  @Column({ nullable: true, type: 'varchar' })
  condition: string | null;

  @Column({ name: 'battery_health', nullable: true, type: 'smallint' })
  batteryHealth: number | null;

  @Column({ name: 'condition_notes', nullable: true, type: 'jsonb' })
  conditionNotes: object | null;

  @Column('decimal', { name: 'exchange_price', precision: 12, scale: 2 })
  exchangePrice: number;

  @Column({ nullable: true, type: 'jsonb' })
  photos: object | null;

  @Column({ name: 'kyc_verified', default: false })
  kycVerified: boolean;

  @Column({ name: 'added_to_inventory', default: false })
  addedToInventory: boolean;

  @Column({ name: 'inventory_item_id', nullable: true, type: 'varchar' })
  inventoryItemId: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true, type: 'varchar' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
