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

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'alternate_phone', nullable: true, type: 'varchar' })
  alternatePhone: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  gender: string | null;

  @Column({ name: 'date_of_birth', nullable: true, type: 'date' })
  dateOfBirth: Date | null;

  @Column({ nullable: true, type: 'text' })
  address: string | null;

  @Column({ nullable: true, type: 'varchar' })
  city: string | null;

  @Column({ nullable: true, type: 'varchar' })
  district: string | null;

  @Column({ nullable: true, type: 'varchar' })
  state: string | null;

  @Column({ nullable: true, type: 'varchar' })
  pincode: string | null;

  @Column({ name: 'id_proof_type', nullable: true, type: 'varchar' })
  idProofType: string | null;

  @Column({ name: 'id_proof_number', nullable: true, type: 'varchar' })
  idProofNumber: string | null;

  @Column({ name: 'ekyc_status', default: 'pending' })
  ekycStatus: string;

  @Column({ name: 'ekyc_verified_at', nullable: true, type: 'timestamptz' })
  ekycVerifiedAt: Date | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'ekyc_verified_by_id' })
  ekycVerifiedBy: User;

  @Column({ name: 'ekyc_verified_by_id', nullable: true, type: 'varchar' })
  ekycVerifiedById: string | null;

  @Column({ name: 'ekyc_documents', nullable: true, type: 'jsonb' })
  ekycDocuments: object | null;

  @Column({ name: 'customer_type', default: 'walk-in' })
  customerType: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'birthday_offer', default: false })
  birthdayOffer: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true, type: 'varchar' })
  createdById: string;

  @ManyToOne(() => Branch, { eager: false, nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id', nullable: true, type: 'varchar' })
  branchId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
