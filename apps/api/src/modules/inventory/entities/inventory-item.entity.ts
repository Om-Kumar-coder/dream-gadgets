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
import { Brand } from './brand.entity';
import { Model } from './model.entity';
import { Branch, User } from '../../auth/entities/user.entity';
import { ItemPhoto } from './item-photo.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 15 })
  imei: string;

  @Column({ nullable: true, type: 'varchar', length: 15 })
  imei2: string;

  @ManyToOne(() => Brand, { eager: false, nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'brand_id', nullable: true, type: 'varchar' })
  brandId: string;

  @ManyToOne(() => Model, { eager: false, nullable: true })
  @JoinColumn({ name: 'model_id' })
  model: Model;

  @Column({ name: 'model_id', nullable: true, type: 'varchar' })
  modelId: string;

  @Column({ nullable: true, type: 'varchar' })
  colour: string;

  @Column({ nullable: true, type: 'varchar' })
  storage: string;

  @Column({ nullable: true, type: 'varchar' })
  ram: string;

  @Column({ name: 'box_type' })
  boxType: string;

  @Column({ name: 'pku_code', nullable: true, type: 'varchar' })
  pkuCode: string;

  @Column({ name: 'battery_health', nullable: true, type: 'smallint' })
  batteryHealth: number;

  @Column({ name: 'country_of_origin', nullable: true, type: 'varchar' })
  countryOfOrigin: string;

  @Column({ name: 'hsn_code', nullable: true, type: 'varchar' })
  hsnCode: string;

  @Column()
  condition: string;

  @Column({ name: 'item_name', nullable: true, type: 'varchar' })
  itemName: string;

  @Column({ name: 'first_invoice_date', nullable: true, type: 'date' })
  firstInvoiceDate: Date;

  @Column('decimal', { name: 'purchase_price', precision: 12, scale: 2 })
  purchasePrice: number;

  @Column('decimal', { name: 'wholesale_price', precision: 12, scale: 2, nullable: true })
  wholesalePrice: number;

  @Column('decimal', { name: 'box_price', precision: 12, scale: 2, nullable: true })
  boxPrice: number;

  @Column('decimal', { name: 'tax_rate', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { name: 'total_cost', precision: 12, scale: 2 })
  totalCost: number;

  @Column('decimal', { name: 'selling_price', precision: 12, scale: 2, nullable: true })
  sellingPrice: number;

  @Column('decimal', { name: 'online_price', precision: 12, scale: 2, nullable: true })
  onlinePrice: number;

  @Column({ default: 'available' })
  status: string;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'birthday_offer', default: false })
  birthdayOffer: boolean;

  @ManyToOne(() => Branch, { eager: false, nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id', nullable: true, type: 'varchar' })
  branchId: string;

  @Column({ name: 'purchase_id', nullable: true, type: 'uuid' })
  purchaseId: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'jsonb' })
  accessories: object;

  @Column({ name: 'warranty_status', nullable: true, type: 'varchar' })
  warrantyStatus: string;

  @Column({ name: 'warranty_expiry', nullable: true, type: 'date' })
  warrantyExpiry: Date | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true, type: 'varchar' })
  createdById: string;

  @OneToMany(() => ItemPhoto, (p) => p.item)
  photos: ItemPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
