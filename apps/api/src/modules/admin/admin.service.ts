import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Role, Branch } from '../auth/entities/user.entity';
import { Setting } from './entities/setting.entity';
import { Banner, ContentPage } from './entities/banner.entity';
import { NotificationService } from '../notification/notification.service';
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
  financialAccess?: boolean;
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
    @InjectDataSource()
    private dataSource: DataSource,
    private notificationService: NotificationService,
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

  async listUsers(branchId?: string, search?: string): Promise<Omit<User, 'passwordHash'>[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.branch', 'branch')
      .select([
        'user.id', 'user.email', 'user.phone', 'user.firstName', 'user.lastName',
        'user.roleId', 'user.branchId', 'user.isActive', 'user.avatarUrl',
        'user.emailEnabled', 'user.smsEnabled', 'user.whatsappEnabled',
        'user.lastLoginAt', 'user.createdAt', 'user.updatedAt',
        'user.financialAccess',
        'role.id', 'role.name', 'role.description',
        'branch.id', 'branch.name', 'branch.code',
      ])
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

  // ─── 16.1b Financial access audit logging ───────────────────────────────────

  /**
   * Log a financial access change to the audit_logs table.
   * Called before the updateUser mutation so we can capture the old value.
   */
  async logFinancialAccessChange(
    targetUserId: string,
    newValue: boolean,
    performedById?: string,
  ): Promise<void> {
    try {
      // Fetch current value for the audit record
      const targetUser = await this.userRepo.findOne({ where: { id: targetUserId }, select: ['id', 'financialAccess'] });
      const oldValue = targetUser?.financialAccess ?? false;

      // Resolve performer name for the audit record
      let performerName = 'unknown';
      if (performedById) {
        const performer = await this.userRepo.findOne({ where: { id: performedById }, select: ['firstName', 'lastName'] });
        if (performer) {
          performerName = `${performer.firstName} ${performer.lastName ?? ''}`.trim();
        }
      }

      await this.dataSource.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by_id, changes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        [
          'user',
          targetUserId,
          newValue ? 'financial_access_granted' : 'financial_access_revoked',
          performedById ?? null,
          JSON.stringify({
            field: 'financial_access',
            oldValue,
            newValue,
            targetUserId,
            targetUserFinancialAccess: newValue,
            performedBy: performerName,
          }),
        ],
      ).catch(() => {
        // audit_logs table may not exist in test env — ignore
      });

      // 2. Send email notification to the owner about financial access change
      this.sendOwnerFinancialAccessEmail(
        targetUserId, newValue, performerName,
      ).catch(() => {
        // Non-critical — email failure should never break the main flow
      });
    } catch {
      // Non-critical — audit logging should never break the main flow
    }
  }

  /**
   * Send an email notification to the owner when financial access is granted or revoked.
   */
  private async sendOwnerFinancialAccessEmail(
    targetUserId: string,
    newValue: boolean,
    performedBy: string,
  ): Promise<void> {
    try {
      const ownerRole = await this.roleRepo.findOne({ where: { name: 'shop_owner' } });
      if (!ownerRole) return;

      const owners = await this.userRepo.find({
        where: { roleId: ownerRole.id, isActive: true },
        select: ['id', 'email', 'firstName'],
      });
      if (!owners.length) return;

      // Resolve target user's name
      const targetUser = await this.userRepo.findOne({ where: { id: targetUserId }, select: ['firstName', 'lastName'] });
      const targetName = targetUser ? `${targetUser.firstName} ${targetUser.lastName ?? ''}`.trim() : 'Unknown';

      const action = newValue ? 'granted to' : 'revoked from';
      const icon = newValue ? '🔓' : '🔒';

      for (const owner of owners) {
        if (!owner.email) continue;
        try {
          await this.notificationService.sendEmail({
            userId: owner.id,
            to: owner.email,
            type: 'financial_access_change_owner',
            subject: `${icon} Financial Access ${newValue ? 'Granted' : 'Revoked'} — Dream Gadgets`,
            body: `<h2>${icon} Financial Access ${newValue ? 'Granted' : 'Revoked'}</h2><p>Hi ${owner.firstName},</p><p>Financial data access has been <strong>${action}</strong> <strong>${targetName}</strong> by <strong>${performedBy}</strong>.</p><table style="border-collapse:collapse;width:100%;margin:16px 0"><tr><td style="padding:8px;border-bottom:1px solid #eee">Target user</td><td style="padding:8px;border-bottom:1px solid #eee">${targetName}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee">Action</td><td style="padding:8px;border-bottom:1px solid #eee;color:${newValue ? '#16a34a' : '#dc2626'}">${newValue ? 'Access Granted' : 'Access Revoked'}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee">Performed by</td><td style="padding:8px;border-bottom:1px solid #eee">${performedBy}</td></tr></table><p style="margin-top:16px;color:#666;font-size:13px">If this change was not authorized, please review it immediately.</p><p>— Dream Gadgets</p>`,
          });
        } catch {
          // Non-critical
        }
      }
    } catch {
      // Non-critical
    }
  }

  /**
   * Fetch audit logs for a specific user, ordered by most recent first.
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 20,
  ): Promise<Array<{
    id: string;
    action: string;
    changes: any;
    performedById: string | null;
    performerName: string | null;
    createdAt: Date;
  }>> {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           al.id,
           al.action,
           al.changes,
           al.performed_by_id AS "performedById",
           al.created_at AS "createdAt",
           u.first_name || ' ' || COALESCE(u.last_name, '') AS "performerName"
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.performed_by_id
         WHERE al.entity_type = 'user' AND al.entity_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2`,
        [userId, limit],
      );

      return rows.map((r: any) => ({
        id: r.id,
        action: r.action,
        changes: typeof r.changes === 'string' ? JSON.parse(r.changes) : r.changes,
        performedById: r.performedById,
        performerName: r.performerName?.trim() || null,
        createdAt: new Date(r.createdAt),
      }));
    } catch {
      // audit_logs table may not exist in test env
      return [];
    }
  }

  // ─── 16.2 Role management ─────────────────────────────────────────────────────

  async listRoles(): Promise<Role[]> {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { id } });
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

  async updateRolePermissions(
    id: string,
    dto: UpdateRolePermissionsDto,
    performedById?: string,
  ): Promise<{ id: string; permissions: string[] }> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    // Fetch old permissions for audit record
    const oldSetting = await this.settingRepo.findOne({ where: { key: `role:${id}:permissions` } });
    const oldPerms = (oldSetting?.value as string[]) ?? [];
    const newPerms = dto.permissions;

    // Compute diff for the audit record
    const added = newPerms.filter((p) => !oldPerms.includes(p));
    const removed = oldPerms.filter((p) => !newPerms.includes(p));

    await this.upsertSetting(`role:${id}:permissions`, newPerms, `Permissions for role ${role.name}`);

    // Log the change to audit_logs
    await this.logRolePermissionChange(id, role.name, oldPerms, newPerms, added, removed, performedById);

    return { id, permissions: newPerms };
  }

  async getRolePermissions(id: string): Promise<string[]> {
    const setting = await this.settingRepo.findOne({ where: { key: `role:${id}:permissions` } });
    return (setting?.value as string[]) ?? [];
  }

  /**
   * Returns a map of roleId → user count for all roles.
   * Used by the PermissionMatrix to show how many users have each role.
   */
  async getRoleUserCounts(): Promise<Record<string, number>> {
    try {
      const rows = await this.dataSource.query(
        `SELECT role_id AS "roleId", COUNT(*)::int AS count
         FROM users
         WHERE is_active = true
         GROUP BY role_id`,
      );
      const result: Record<string, number> = {};
      for (const row of rows) {
        result[row.roleId] = row.count;
      }
      return result;
    } catch {
      return {};
    }
  }

  // ─── 16.2b Role permission audit logging ──────────────────────────────────

  /**
   * Log a role permission change to the audit_logs table.
   */
  private async logRolePermissionChange(
    roleId: string,
    roleName: string,
    oldPerms: string[],
    newPerms: string[],
    added: string[],
    removed: string[],
    performedById?: string,
  ): Promise<void> {
    try {
      let performerName = 'unknown';
      if (performedById) {
        const performer = await this.userRepo.findOne({ where: { id: performedById }, select: ['firstName', 'lastName'] });
        if (performer) {
          performerName = `${performer.firstName} ${performer.lastName ?? ''}`.trim();
        }
      }

      // 1. Write audit log
      await this.dataSource.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by_id, changes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        [
          'role',
          roleId,
          'permissions_updated',
          performedById ?? null,
          JSON.stringify({
            roleName,
            oldPermissionCount: oldPerms.length,
            newPermissionCount: newPerms.length,
            added,
            removed,
            addedCount: added.length,
            removedCount: removed.length,
            performedBy: performerName,
          }),
        ],
      ).catch(() => {
        // audit_logs table may not exist in test env — ignore
      });

      // 2. Send email notification to the owner
      this.sendOwnerPermissionChangeEmail(
        roleName, oldPerms.length, newPerms.length,
        added, removed, performerName,
      ).catch((err) => {
        // Non-critical — email failure should never break the main flow
        // Logger is not available here since this is a private method;
        // the NotificationService handles its own logging.
      });
    } catch {
      // Non-critical — audit logging should never break the main flow
    }
  }

  /**
   * Send an email notification to the owner when role permissions change.
   * Finds all users with the 'shop_owner' role and sends them the notification.
   */
  private async sendOwnerPermissionChangeEmail(
    roleName: string,
    oldCount: number,
    newCount: number,
    added: string[],
    removed: string[],
    performedBy: string,
  ): Promise<void> {
    // Find the owner role by name
    const ownerRole = await this.roleRepo.findOne({ where: { name: 'shop_owner' } });
    if (!ownerRole) return;

    // Find all active users with the owner role who have email addresses
    const owners = await this.userRepo.find({
      where: { roleId: ownerRole.id, isActive: true },
      select: ['id', 'email', 'firstName'],
    });

    if (!owners.length) return;

    // Build HTML lists for added/removed permissions
    const addedDetailsHtml = added.length > 0
      ? `<h3>Added Permissions</h3><ul>${added.map((p) => `<li style="color:#16a34a">+ ${p}</li>`).join('')}</ul>`
      : '';
    const removedDetailsHtml = removed.length > 0
      ? `<h3>Removed Permissions</h3><ul>${removed.map((p) => `<li style="color:#dc2626">- ${p}</li>`).join('')}</ul>`
      : '';

    // Send to each owner who has an email
    for (const owner of owners) {
      if (!owner.email) continue;
      try {
        await this.notificationService.sendEmail({
          userId: owner.id,
          to: owner.email,
          type: 'permission_change_owner',
          templateKey: 'permission_change_owner',
          templateVars: {
            ownerName: owner.firstName,
            roleName,
            performedBy,
            oldCount: String(oldCount),
            newCount: String(newCount),
            addedCount: String(added.length),
            removedCount: String(removed.length),
            addedDetailsHtml,
            removedDetailsHtml,
          },
        });
      } catch {
        // Non-critical — don't let email failure break permission update flow
      }
    }
  }

  /**
   * Fetch audit logs for a specific role, ordered by most recent first.
   */
  async getRoleAuditLogs(
    roleId: string,
    limit: number = 20,
  ): Promise<Array<{
    id: string;
    action: string;
    changes: any;
    performedById: string | null;
    performerName: string | null;
    createdAt: Date;
  }>> {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           al.id,
           al.action,
           al.changes,
           al.performed_by_id AS "performedById",
           al.created_at AS "createdAt",
           u.first_name || ' ' || COALESCE(u.last_name, '') AS "performerName"
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.performed_by_id
         WHERE al.entity_type = 'role' AND al.entity_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2`,
        [roleId, limit],
      );

      return rows.map((r: any) => ({
        id: r.id,
        action: r.action,
        changes: typeof r.changes === 'string' ? JSON.parse(r.changes) : r.changes,
        performedById: r.performedById,
        performerName: r.performerName?.trim() || null,
        createdAt: new Date(r.createdAt),
      }));
    } catch {
      return [];
    }
  }

  // ─── 16.2c Combined audit log for dashboard ────────────────────────────────

  /**
   * Fetch recent audit logs across both roles and users,
   * ordered by most recent first. Used by the dashboard widget.
   */
  async getRecentAuditLogs(limit: number = 10): Promise<Array<{
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    changes: any;
    performerName: string | null;
    createdAt: Date;
  }>> {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           al.id,
           al.entity_type AS "entityType",
           al.entity_id AS "entityId",
           al.action,
           al.changes,
           u.first_name || ' ' || COALESCE(u.last_name, '') AS "performerName"
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.performed_by_id
         WHERE al.entity_type IN ('role', 'user')
           AND al.action IN ('permissions_updated', 'financial_access_granted', 'financial_access_revoked')
         ORDER BY al.created_at DESC
         LIMIT $1`,
        [limit],
      );

      return rows.map((r: any) => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        action: r.action,
        changes: typeof r.changes === 'string' ? JSON.parse(r.changes) : r.changes,
        performerName: r.performerName?.trim() || null,
        createdAt: new Date(r.createdAt),
      }));
    } catch {
      return [];
    }
  }

  // ─── 16.3 Branch management ───────────────────────────────────────────────────

  async listBranches(): Promise<any[]> {
    const rows = await this.branchRepo.manager.query(`
      SELECT
        b.id, b.name, b.code, b.address, b.city, b.state, b.pincode,
        b.phone, b.whatsapp, b.email, b.instagram,
        b.working_hours AS "workingHours", b.map_url AS "mapUrl",
        b.sort_order AS "sortOrder", b.is_active AS "isActive",
        b.gstin, b.created_at AS "createdAt",
        (SELECT COUNT(*)::int FROM inventory_items ii WHERE ii.branch_id = b.id) AS "productCount"
      FROM branches b
      ORDER BY b.name ASC
    `);
    return rows.map((r: any) => ({ ...r, productCount: Number(r.productCount) || 0 }));
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
