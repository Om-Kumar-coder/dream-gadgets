import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_number', unique: true })
  returnNumber: string;

  @Column({ name: 'return_type', length: 20 })
  returnType: 'sale' | 'purchase';

  @Column({ name: 'original_id' })
  originalId: string;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string | null;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'refund_method', length: 50, nullable: true, type: 'varchar' })
  refundMethod: string | null;

  @Column('decimal', { name: 'refund_amount', precision: 12, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'refund_status', default: 'pending' })
  refundStatus: string;

  // DB column is 'approved_by' not 'approved_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ name: 'approved_by', nullable: true, type: 'varchar' })
  approvedById: string | null;

  // DB column is 'created_by' not 'created_by_id'
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
