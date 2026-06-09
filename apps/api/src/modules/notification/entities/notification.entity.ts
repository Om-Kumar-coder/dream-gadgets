import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true, type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 20 })
  channel: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  subject: string | null;

  @Column({ nullable: true, type: 'text' })
  body: string | null;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'sent_at', nullable: true, type: 'timestamptz' })
  sentAt: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: object | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true, type: 'timestamptz' })
  readAt: Date | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ name: 'provider_message_id', nullable: true, type: 'varchar', length: 255 })
  providerMessageId: string | null;

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ name: 'target', nullable: true, type: 'varchar', length: 255 })
  target: string | null;

  @Column({ name: 'last_attempt_at', nullable: true, type: 'timestamptz' })
  lastAttemptAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
