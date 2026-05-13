import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'varchar' })
  city: string;

  @Column({ nullable: true, type: 'varchar' })
  state: string;

  @Column({ nullable: true, type: 'varchar' })
  gstin: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, type: 'varchar' })
  lastName: string;

  @ManyToOne(() => Role, { eager: false, nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id', nullable: true, type: 'varchar' })
  roleId: string;

  @ManyToOne(() => Branch, { eager: false, nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id', nullable: true, type: 'varchar' })
  branchId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamptz' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
