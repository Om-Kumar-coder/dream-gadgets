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

  @Column({ nullable: true, type: 'text' })
  error: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: object | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
