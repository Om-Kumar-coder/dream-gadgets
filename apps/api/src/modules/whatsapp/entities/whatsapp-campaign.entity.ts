import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_campaigns')
export class WhatsappCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 30, default: 'draft' })
  status: string;

  @Column({ length: 50, default: 'broadcast' })
  type: string;

  @Column({ name: 'template_id', nullable: true, type: 'varchar' })
  templateId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  segmentFilter: object | null;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'total_recipients', default: 0 })
  totalRecipients: number;

  @Column({ name: 'sent_count', default: 0 })
  sentCount: number;

  @Column({ name: 'delivered_count', default: 0 })
  deliveredCount: number;

  @Column({ name: 'read_count', default: 0 })
  readCount: number;

  @Column({ name: 'failed_count', default: 0 })
  failedCount: number;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'conversion_count', default: 0 })
  conversionCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
