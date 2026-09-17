import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch, User } from '../../auth/entities/user.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'vendor_id', nullable: true, type: 'varchar' })
  vendorId: string | null;

  @Column({ name: 'vendor_name', nullable: true, type: 'varchar' })
  vendorName: string;

  @ManyToOne(() => Branch, { eager: false, nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column('decimal', { name: 'total_amount', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  // ─── GST split (intra vs inter-state) — snapshot at purchase time ──────────

  /** 'intra' = CGST+SGST (same state), 'inter' = IGST (different states). */
  @Column({ name: 'supply_type', type: 'varchar', length: 10, default: 'intra' })
  supplyType: 'intra' | 'inter';

  /** Whether supplyType was derived automatically or manually overridden. */
  @Column({ name: 'supply_type_source', type: 'varchar', length: 10, default: 'derived' })
  supplyTypeSource: 'derived' | 'manual';

  /** Vendor GSTIN snapshot at purchase time. */
  @Column({ name: 'vendor_gstin', type: 'varchar', length: 15, nullable: true })
  vendorGstin: string | null;

  /** 2-digit GST state code of the vendor. */
  @Column({ name: 'vendor_state_code', type: 'varchar', length: 2, nullable: true })
  vendorStateCode: string | null;

  /** 2-digit GST state code of the place of supply (defaults to vendor state). */
  @Column({ name: 'place_of_supply', type: 'varchar', length: 2, nullable: true })
  placeOfSupply: string | null;

  /** Reverse-charge purchases are excluded from regular ITC. */
  @Column({ name: 'is_reverse_charge', type: 'boolean', default: false })
  isReverseCharge: boolean;

  /** Ineligible credits (blocked ITC categories) set this to false. */
  @Column({ name: 'is_itc_eligible', type: 'boolean', default: true })
  isItcEligible: boolean;

  /** Persisted CGST portion (intra-state only; 0 for inter-state). */
  @Column({ name: 'cgst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  cgstAmount: number;

  /** Persisted SGST/UTGST portion (intra-state only; 0 for inter-state). */
  @Column({ name: 'sgst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  sgstAmount: number;

  /** Persisted IGST portion (inter-state only; 0 for intra-state). */
  @Column({ name: 'igst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  igstAmount: number;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ default: 'completed' })
  status: string;

  // DB column is 'created_by' not 'created_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdById: string;

  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
