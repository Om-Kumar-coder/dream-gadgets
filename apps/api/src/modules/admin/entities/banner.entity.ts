import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('content_banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'varchar' })
  subtitle: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'mobile_image_url', nullable: true, type: 'varchar' })
  mobileImageUrl: string;

  @Column({ name: 'link_url', nullable: true, type: 'varchar' })
  linkUrl: string;

  @Column({ name: 'cta_text', nullable: true, type: 'varchar' })
  ctaText: string;

  @Column({ name: 'page_type', default: 'home', type: 'varchar' })
  pageType: string;

  @Column({ name: 'position', default: 'slider', type: 'varchar' })
  position: string;

  @Column({ name: 'device_type', default: 'all', type: 'varchar' })
  deviceType: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'starts_at', nullable: true, type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', nullable: true, type: 'timestamptz' })
  endsAt: Date;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdById: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('content_pages')
export class ContentPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ name: 'meta_title', nullable: true, type: 'varchar' })
  metaTitle: string;

  @Column({ name: 'meta_desc', nullable: true, type: 'varchar' })
  metaDesc: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar' })
  updatedById: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
