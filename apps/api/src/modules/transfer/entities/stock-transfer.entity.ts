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

  // DB column is 'initiated_by' not 'initiated_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'initiated_by' })
  initiatedBy: User;

  @Column({ name: 'initiated_by', nullable: true, type: 'varchar' })
  initiatedById: string;

  // DB column is 'received_by' not 'received_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'received_by' })
  receivedBy: User;

  @Column({ name: 'received_by', nullable: true, type: 'varchar' })
  receivedById: string | null;

  @Column({ name: 'initiated_at', type: 'timestamptz', default: () => 'NOW()' })
  initiatedAt: Date;

  @Column({ name: 'received_at', nullable: true, type: 'timestamptz' })
  receivedAt: Date | null;

  // rejection_reason not in DB — virtual only
  rejectionReason: string | null;

  @OneToMany(() => StockTransferItem, (i) => i.transfer, { cascade: true })
  items: StockTransferItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
