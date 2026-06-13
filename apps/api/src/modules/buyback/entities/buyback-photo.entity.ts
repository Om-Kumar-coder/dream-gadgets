import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BuybackLead } from './buyback-lead.entity';

@Entity('buyback_photos')
export class BuybackPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @ManyToOne(() => BuybackLead, (lead) => lead.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: BuybackLead;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
