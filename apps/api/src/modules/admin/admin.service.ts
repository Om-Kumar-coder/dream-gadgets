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
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  ctaText?: string;
  pageType?: string;
  position?: string;
  deviceType?: string;
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
  async listBanners(pageType?: string, position?: string): Promise<Banner[]> {
    const where: any = {};
    if (pageType) where.pageType = pageType;
    if (position) where.position = position;
    return this.bannerRepo.find({ where, order: { sortOrder: 'ASC' } });
  }

  async getActiveBanners(pageType: string, position: string, deviceType?: string): Promise<Banner[]> {
    const now = new Date();
    const qb = this.bannerRepo.createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true })
      .andWhere('banner.pageType = :pageType', { pageType })
      .andWhere('banner.position = :position', { position })
      .andWhere('(banner.startsAt IS NULL OR banner.startsAt <= :now)', { now })
      .andWhere('(banner.endsAt IS NULL OR banner.endsAt >= :now)', { now })
      .orderBy('banner.sortOrder', 'ASC');

    if (deviceType && deviceType !== 'all') {
      qb.andWhere('(banner.deviceType = :deviceType OR banner.deviceType = :all)', {
        deviceType,
        all: 'all',
      });
    }

    return qb.getMany();
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

  async updateBannerOrder(banners: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of banners) {
      await this.bannerRepo.update(item.id, { sortOrder: item.sortOrder });
    }
  }

  async toggleBanner(id: string): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    banner.isActive = !banner.isActive;
    return this.bannerRepo.save(banner);
  }

  async incrementBannerClicks(id: string): Promise<void> {
    await this.bannerRepo.increment({ id }, 'clickCount', 1);
  }

  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    await this.bannerRepo.remove(banner);
  }

  // ─── Brand Heroes ────────────────────────────────────────────────────────────

  async getBrandHero(slug: string): Promise<{ imageUrl: string | null }> {
    const key = `brand_hero:${slug.toLowerCase()}`;
    const setting = await this.settingRepo.findOne({ where: { key } });
    return { imageUrl: (setting?.value as any)?.imageUrl ?? null };
  }

  async upsertBrandHero(slug: string, imageUrl: string): Promise<{ imageUrl: string }> {
    const key = `brand_hero:${slug.toLowerCase()}`;
    await this.upsertSetting(key, { imageUrl }, `Brand hero image for ${slug}`);
    return { imageUrl };
  }

  async listBrandHeroes(): Promise<{ slug: string; name: string; imageUrl: string | null }[]> {
    // Known brands list
    const brands: { slug: string; name: string }[] = [
      'Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Xiaomi',
      'Motorola', 'Google', 'Nothing', 'Asus', 'Honor', 'Infinix', 'iQOO', 'Nokia', 'POCO', 'Tecno',
    ].map(name => ({ slug: name.toLowerCase(), name }));

    // Single query to fetch all brand hero settings at once
    const settings = await this.settingRepo.find({
      where: brands.map(b => ({ key: `brand_hero:${b.slug}` })),
    });

    const heroMap = new Map<string, string | null>();
    for (const s of settings) {
      const slug = s.key.replace('brand_hero:', '');
      heroMap.set(slug, (s.value as any)?.imageUrl ?? null);
    }

    return brands.map(b => ({
      slug: b.slug,
      name: b.name,
      imageUrl: heroMap.get(b.slug) ?? null,
    }));
  }

  // ─── Banner Analytics ────────────────────────────────────────────────────────

  async getBannerAnalytics(): Promise<{
    totalBanners: number;
    totalClicks: number;
    activeBanners: number;
    inactiveBanners: number;
    byPageType: { pageType: string; count: number; clicks: number }[];
    byPosition: { position: string; count: number; clicks: number }[];
    topBanners: { id: string; title: string; pageType: string; position: string; clicks: number; imageUrl: string; isActive: boolean }[];
  }> {
    const banners = await this.bannerRepo.find();

    const totalClicks = banners.reduce((sum, b) => sum + (b.clickCount || 0), 0);
    const activeBanners = banners.filter(b => b.isActive).length;

    // Group by page type
    const pageTypeMap = new Map<string, { count: number; clicks: number }>();
    for (const b of banners) {
      const pt = b.pageType || 'home';
      const entry = pageTypeMap.get(pt) || { count: 0, clicks: 0 };
      entry.count++;
      entry.clicks += b.clickCount || 0;
      pageTypeMap.set(pt, entry);
    }

    // Group by position
    const positionMap = new Map<string, { count: number; clicks: number }>();
    for (const b of banners) {
      const pos = b.position || 'slider';
      const entry = positionMap.get(pos) || { count: 0, clicks: 0 };
      entry.count++;
      entry.clicks += b.clickCount || 0;
      positionMap.set(pos, entry);
    }

    // Top 10 banners by clicks
    const topBanners = banners
      .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        title: b.title,
        pageType: b.pageType,
        position: b.position,
        clicks: b.clickCount || 0,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
      }));

    return {
      totalBanners: banners.length,
      totalClicks,
      activeBanners,
      inactiveBanners: banners.length - activeBanners,
      byPageType: Array.from(pageTypeMap.entries()).map(([pageType, data]) => ({
        pageType,
        count: data.count,
        clicks: data.clicks,
      })),
      byPosition: Array.from(positionMap.entries()).map(([position, data]) => ({
        position,
        count: data.count,
        clicks: data.clicks,
      })),
      topBanners,
    };
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
