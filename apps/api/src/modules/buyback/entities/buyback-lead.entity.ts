import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('buyback_leads')
export class BuybackLead {
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

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
