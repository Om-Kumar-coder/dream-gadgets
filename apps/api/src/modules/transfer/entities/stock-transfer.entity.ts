import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Branch, User } from '../../auth/entities/user.entity';
import { StockTransferItem } from './stock-transfer-item.entity';

@Entity('stock_transfers')
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_number', unique: true })
  transferNumber: string;

  @ManyToOne(() => Branch, { eager: false, nullable: false })
  @JoinColumn({ name: 'from_branch_id' })
  fromBranch: Branch;

  @Column({ name: 'from_branch_id' })
  fromBranchId: string;

  @ManyToOne(() => Branch, { eager: false, nullable: false })
  @JoinColumn({ name: 'to_branch_id' })
  toBranch: Branch;

  @Column({ name: 'to_branch_id' })
  toBranchId: string;

  @Column({ default: 'initiated' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'initiated_by_id' })
  initiatedBy: User;

  @Column({ name: 'initiated_by_id', nullable: true, type: 'varchar' })
  initiatedById: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'received_by_id' })
  receivedBy: User;

  @Column({ name: 'received_by_id', nullable: true, type: 'varchar' })
  receivedById: string | null;

  @Column({ name: 'initiated_at', type: 'timestamptz', default: () => 'NOW()' })
  initiatedAt: Date;

  @Column({ name: 'received_at', nullable: true, type: 'timestamptz' })
  receivedAt: Date | null;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason: string | null;

  @OneToMany(() => StockTransferItem, (i) => i.transfer, { cascade: true })
  items: StockTransferItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
