import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WhatsappMessage } from './whatsapp-message.entity';

@Entity('whatsapp_conversations')
export class WhatsappConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_phone', length: 20 })
  customerPhone: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 200, nullable: true })
  customerName: string | null;

  @Column({ length: 50, default: 'general' })
  type: string;

  @Column({ length: 30, default: 'active' })
  status: string;

  @Column({ name: 'assigned_staff_id', nullable: true, type: 'varchar' })
  assignedStaffId: string | null;

  @Column({ length: 10, default: 'normal' })
  priority: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: object | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @Column({ name: 'last_message_preview', type: 'text', nullable: true })
  lastMessagePreview: string | null;

  @Column({ name: 'unread_count', default: 0 })
  unreadCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WhatsappMessage, (msg) => msg.conversation)
  messages: WhatsappMessage[];
}
