import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Brand, { eager: false, nullable: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'brand_id' })
  brandId: string;

  @Column({ nullable: true, type: 'varchar' })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  /** Product-master attribute: global SKU (unique when present). */
  @Column({ nullable: true, type: 'varchar', length: 50 })
  sku: string | null;

  /** Product-master attribute: category, e.g. smartphone / tablet / laptop. */
  @Column({ type: 'varchar', length: 50, default: 'smartphone' })
  category: string;

  @Column({ nullable: true, type: 'jsonb' })
  specs: object;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
