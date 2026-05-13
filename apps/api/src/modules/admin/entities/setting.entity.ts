import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar' })
  updatedById: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
