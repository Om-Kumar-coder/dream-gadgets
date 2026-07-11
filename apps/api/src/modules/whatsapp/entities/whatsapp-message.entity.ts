import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { WhatsappConversation } from './whatsapp-conversation.entity';

@Entity('whatsapp_messages')
export class WhatsappMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'varchar' })
  conversationId: string;

  @ManyToOne(() => WhatsappConversation, (conv) => conv.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: WhatsappConversation;

  @Column({ length: 10 })
  direction: string;

  @Column({ name: 'from_number', length: 20 })
  fromNumber: string;

  @Column({ name: 'to_number', length: 20 })
  toNumber: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'content_type', length: 30, default: 'text' })
  contentType: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl: string | null;

  @Column({ name: 'media_mime_type', type: 'varchar', length: 100, nullable: true })
  mediaMimeType: string | null;

  @Column({ name: 'media_filename', type: 'varchar', length: 500, nullable: true })
  mediaFilename: string | null;

  @Column({ length: 20, default: 'sent' })
  status: string;

  @Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })
  providerMessageId: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
