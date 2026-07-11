import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_appointments')
export class WhatsappAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', nullable: true, type: 'varchar' })
  clientId: string | null;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 200, nullable: true })
  name: string | null;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 30, default: 'scheduled' })
  status: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'reminder_24h_sent', default: false })
  reminder24hSent: boolean;

  @Column({ name: 'reminder_2h_sent', default: false })
  reminder2hSent: boolean;

  @Column({ name: 'staff_id', nullable: true, type: 'varchar' })
  staffId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object | null;

  @Column({ name: 'feedback_rating', type: 'smallint', nullable: true })
  feedbackRating: number | null;

  @Column({ name: 'feedback_comment', type: 'text', nullable: true })
  feedbackComment: string | null;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
