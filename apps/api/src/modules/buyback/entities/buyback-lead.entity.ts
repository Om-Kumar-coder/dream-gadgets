import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { BuybackPhoto } from './buyback-photo.entity';

@Entity('buyback_leads')
export class BuybackLead {
  @OneToMany(() => BuybackPhoto, (photo) => photo.lead, { cascade: true })
  photos: BuybackPhoto[];
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ name: 'model_name', length: 200 })
  modelName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'device_type', length: 50, default: 'mobile' })
  deviceType: string;

  @Column({ length: 30, default: 'pending' })
  status: string;

  @Column({ name: 'screen_condition', nullable: true, type: 'varchar', length: 50 })
  screenCondition: string | null;

  @Column({ name: 'body_condition', nullable: true, type: 'varchar', length: 50 })
  bodyCondition: string | null;

  @Column({ name: 'battery_health', nullable: true, type: 'varchar', length: 20 })
  batteryHealth: string | null;

  @Column({ name: 'functional_issues', nullable: true, type: 'text' })
  functionalIssues: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
