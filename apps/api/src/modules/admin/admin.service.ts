import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role, Branch } from '../auth/entities/user.entity';
import { Setting } from './entities/setting.entity';
import { Banner, ContentPage } from './entities/banner.entity';
import * as bcrypt from 'bcrypt';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  email?: string;
  phone: string;
  password: string;
  firstName: string;
  lastName?: string;
  roleId?: string;
  branchId?: string;
}

export interface UpdateUserDto {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  branchId?: string;
  isActive?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRolePermissionsDto {
  permissions: string[];
}

export interface CreateBranchDto {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  workingHours?: string;
  mapUrl?: string;
  sortOrder?: number;
  gstin?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  workingHours?: string;
  mapUrl?: string;
  sortOrder?: number;
  gstin?: string;
  isActive?: boolean;
}

export interface CreateBannerDto {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

export interface CreateContentPageDto {
  slug: string;
  title: string;
  content?: string;
  metaTitle?: string;
  metaDesc?: string;
  isActive?: boolean;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
    @InjectRepository(ContentPage)
    private contentPageRepo: Repository<ContentPage>,
  ) {}

  // ─── 16.1 User management ─────────────────────────────────────────────────────

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException({ code: 'PHONE_DUPLICATE', message: 'Phone number already in use' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: dto.roleId,
      branchId: dto.branchId,
      isActive: true,
    });

    return this.userRepo.save(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    // Soft delete — deactivate instead of hard delete
    user.isActive = false;
    await this.userRepo.save(user);
  }

  async listUsers(branchId?: string, search?: string): Promise<User[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.branch', 'branch')
      .orderBy('user.createdAt', 'DESC');

    if (branchId) qb.andWhere('user.branchId = :branchId', { branchId });
    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role', 'branch'] });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  // ─── 16.2 Role management ─────────────────────────────────────────────────────

  async listRoles(): Promise<Role[]> {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async createRole(dto: CreateRoleDto): Promise<Role & { permissions: string[] }> {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException({ code: 'ROLE_DUPLICATE', message: 'Role name already exists' });
    }

    const role = this.roleRepo.create({ name: dto.name, description: dto.description });
    const saved = await this.roleRepo.save(role);

    // Store permissions in settings table as role:{id}:permissions
    if (dto.permissions?.length) {
      await this.upsertSetting(`role:${saved.id}:permissions`, dto.permissions, `Permissions for role ${dto.name}`);
    }

    return { ...saved, permissions: dto.permissions ?? [] };
  }

  async updateRolePermissions(id: string, dto: UpdateRolePermissionsDto): Promise<{ id: string; permissions: string[] }> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    await this.upsertSetting(`role:${id}:permissions`, dto.permissions, `Permissions for role ${role.name}`);

    return { id, permissions: dto.permissions };
  }

  async getRolePermissions(id: string): Promise<string[]> {
    const setting = await this.settingRepo.findOne({ where: { key: `role:${id}:permissions` } });
    return (setting?.value as string[]) ?? [];
  }

  // ─── 16.3 Branch management ───────────────────────────────────────────────────

  async listBranches(): Promise<Branch[]> {
    return this.branchRepo.find({ order: { name: 'ASC' } });
  }

  async createBranch(dto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException({ code: 'BRANCH_CODE_DUPLICATE', message: 'Branch code already exists' });
    }

    const branch = this.branchRepo.create({
      name: dto.name,
      code: dto.code,
      isActive: dto.isActive ?? true,
    });

    return this.branchRepo.save(branch);
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);

    Object.assign(branch, dto);
    return this.branchRepo.save(branch);
  }

  // ─── 16.4 Settings management ─────────────────────────────────────────────────

  async getSetting(key: string): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async upsertSetting(key: string, value: any, description?: string, updatedById?: string): Promise<Setting> {
    let setting = await this.settingRepo.findOne({ where: { key } });

    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      if (updatedById) setting.updatedById = updatedById;
    } else {
      setting = this.settingRepo.create({ key, value, description, updatedById });
    }

    return this.settingRepo.save(setting);
  }

  async listSettings(): Promise<Setting[]> {
    return this.settingRepo.find({ order: { key: 'ASC' } });
  }

  // ─── 16.5 Content management ──────────────────────────────────────────────────

  // Banners
  async listBanners(): Promise<Banner[]> {
    return this.bannerRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async createBanner(dto: CreateBannerDto, createdById?: string): Promise<Banner> {
    const banner = this.bannerRepo.create({ ...dto, createdById });
    return this.bannerRepo.save(banner);
  }

  async updateBanner(id: string, dto: Partial<CreateBannerDto>): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    await this.bannerRepo.remove(banner);
  }

  // Content pages
  async listContentPages(): Promise<ContentPage[]> {
    return this.contentPageRepo.find({ order: { slug: 'ASC' } });
  }

  async createContentPage(dto: CreateContentPageDto, updatedById?: string): Promise<ContentPage> {
    const existing = await this.contentPageRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException({ code: 'SLUG_DUPLICATE', message: 'Page slug already exists' });
    }
    const page = this.contentPageRepo.create({ ...dto, updatedById });
    return this.contentPageRepo.save(page);
  }

  async updateContentPage(id: string, dto: Partial<CreateContentPageDto>, updatedById?: string): Promise<ContentPage> {
    const page = await this.contentPageRepo.findOne({ where: { id } });
    if (!page) throw new NotFoundException(`Content page ${id} not found`);
    Object.assign(page, dto);
    if (updatedById) page.updatedById = updatedById;
    return this.contentPageRepo.save(page);
  }

  async deleteContentPage(id: string): Promise<void> {
    const page = await this.contentPageRepo.findOne({ where: { id } });
    if (!page) throw new NotFoundException(`Content page ${id} not found`);
    await this.contentPageRepo.remove(page);
  }
}
