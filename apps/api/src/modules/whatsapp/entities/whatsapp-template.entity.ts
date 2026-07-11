import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_templates')
export class WhatsappTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, default: 'transactional' })
  category: string;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ name: 'template_id', length: 100, nullable: true })
  templateId: string | null;

  @Column({ length: 30, default: 'pending' })
  status: string;

  @Column({ name: 'header_type', length: 30, nullable: true })
  headerType: string | null;

  @Column({ name: 'header_value', type: 'text', nullable: true })
  headerValue: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  footer: string | null;

  @Column({ type: 'jsonb', nullable: true })
  buttons: object | null;

  @Column({ type: 'jsonb', nullable: true })
  variables: object | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
