var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, NotFoundException, ConflictException, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let AdminService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = _classThis = class {
        constructor(userRepo, roleRepo, branchRepo, settingRepo, bannerRepo, contentPageRepo) {
            this.userRepo = userRepo;
            this.roleRepo = roleRepo;
            this.branchRepo = branchRepo;
            this.settingRepo = settingRepo;
            this.bannerRepo = bannerRepo;
            this.contentPageRepo = contentPageRepo;
        }
        // ─── 16.1 User management ─────────────────────────────────────────────────────
        async createUser(dto) {
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
        async updateUser(id, dto) {
            const user = await this.userRepo.findOne({ where: { id } });
            if (!user)
                throw new NotFoundException(`User ${id} not found`);
            Object.assign(user, dto);
            return this.userRepo.save(user);
        }
        async deleteUser(id) {
            const user = await this.userRepo.findOne({ where: { id } });
            if (!user)
                throw new NotFoundException(`User ${id} not found`);
            // Soft delete — deactivate instead of hard delete
            user.isActive = false;
            await this.userRepo.save(user);
        }
        async listUsers(branchId, search) {
            const qb = this.userRepo
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .leftJoinAndSelect('user.branch', 'branch')
                .orderBy('user.createdAt', 'DESC');
            if (branchId)
                qb.andWhere('user.branchId = :branchId', { branchId });
            if (search) {
                qb.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
            }
            return qb.getMany();
        }
        async findUserById(id) {
            const user = await this.userRepo.findOne({ where: { id }, relations: ['role', 'branch'] });
            if (!user)
                throw new NotFoundException(`User ${id} not found`);
            return user;
        }
        // ─── 16.2 Role management ─────────────────────────────────────────────────────
        async listRoles() {
            return this.roleRepo.find({ order: { name: 'ASC' } });
        }
        async createRole(dto) {
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
        async updateRolePermissions(id, dto) {
            const role = await this.roleRepo.findOne({ where: { id } });
            if (!role)
                throw new NotFoundException(`Role ${id} not found`);
            await this.upsertSetting(`role:${id}:permissions`, dto.permissions, `Permissions for role ${role.name}`);
            return { id, permissions: dto.permissions };
        }
        async getRolePermissions(id) {
            const setting = await this.settingRepo.findOne({ where: { key: `role:${id}:permissions` } });
            return setting?.value ?? [];
        }
        // ─── 16.3 Branch management ───────────────────────────────────────────────────
        async listBranches() {
            return this.branchRepo.find({ order: { name: 'ASC' } });
        }
        async createBranch(dto) {
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
        async updateBranch(id, dto) {
            const branch = await this.branchRepo.findOne({ where: { id } });
            if (!branch)
                throw new NotFoundException(`Branch ${id} not found`);
            Object.assign(branch, dto);
            return this.branchRepo.save(branch);
        }
        // ─── 16.4 Settings management ─────────────────────────────────────────────────
        async getSetting(key) {
            const setting = await this.settingRepo.findOne({ where: { key } });
            if (!setting)
                throw new NotFoundException(`Setting '${key}' not found`);
            return setting;
        }
        async upsertSetting(key, value, description, updatedById) {
            let setting = await this.settingRepo.findOne({ where: { key } });
            if (setting) {
                setting.value = value;
                if (description)
                    setting.description = description;
                if (updatedById)
                    setting.updatedById = updatedById;
            }
            else {
                setting = this.settingRepo.create({ key, value, description, updatedById });
            }
            return this.settingRepo.save(setting);
        }
        async listSettings() {
            return this.settingRepo.find({ order: { key: 'ASC' } });
        }
        // ─── 16.5 Content management ──────────────────────────────────────────────────
        // Banners
        async listBanners(pageType, position) {
            const where = {};
            if (pageType)
                where.pageType = pageType;
            if (position)
                where.position = position;
            return this.bannerRepo.find({ where, order: { sortOrder: 'ASC' } });
        }
        async getActiveBanners(pageType, position, deviceType) {
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
        async createBanner(dto, createdById) {
            const banner = this.bannerRepo.create({ ...dto, createdById });
            return this.bannerRepo.save(banner);
        }
        async updateBanner(id, dto) {
            const banner = await this.bannerRepo.findOne({ where: { id } });
            if (!banner)
                throw new NotFoundException(`Banner ${id} not found`);
            Object.assign(banner, dto);
            return this.bannerRepo.save(banner);
        }
        async updateBannerOrder(banners) {
            for (const item of banners) {
                await this.bannerRepo.update(item.id, { sortOrder: item.sortOrder });
            }
        }
        async toggleBanner(id) {
            const banner = await this.bannerRepo.findOne({ where: { id } });
            if (!banner)
                throw new NotFoundException(`Banner ${id} not found`);
            banner.isActive = !banner.isActive;
            return this.bannerRepo.save(banner);
        }
        async incrementBannerClicks(id) {
            await this.bannerRepo.increment({ id }, 'clickCount', 1);
        }
        async deleteBanner(id) {
            const banner = await this.bannerRepo.findOne({ where: { id } });
            if (!banner)
                throw new NotFoundException(`Banner ${id} not found`);
            await this.bannerRepo.remove(banner);
        }
        // ─── Brand Heroes ────────────────────────────────────────────────────────────
        async getBrandHero(slug) {
            const key = `brand_hero:${slug.toLowerCase()}`;
            const setting = await this.settingRepo.findOne({ where: { key } });
            return { imageUrl: setting?.value?.imageUrl ?? null };
        }
        async upsertBrandHero(slug, imageUrl) {
            const key = `brand_hero:${slug.toLowerCase()}`;
            await this.upsertSetting(key, { imageUrl }, `Brand hero image for ${slug}`);
            return { imageUrl };
        }
        async listBrandHeroes() {
            // Known brands list
            const brands = [
                'Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Xiaomi',
                'Motorola', 'Google', 'Nothing', 'Asus', 'Honor', 'Infinix', 'iQOO', 'Nokia', 'POCO', 'Tecno',
            ].map(name => ({ slug: name.toLowerCase(), name }));
            // Single query to fetch all brand hero settings at once
            const settings = await this.settingRepo.find({
                where: brands.map(b => ({ key: `brand_hero:${b.slug}` })),
            });
            const heroMap = new Map();
            for (const s of settings) {
                const slug = s.key.replace('brand_hero:', '');
                heroMap.set(slug, s.value?.imageUrl ?? null);
            }
            return brands.map(b => ({
                slug: b.slug,
                name: b.name,
                imageUrl: heroMap.get(b.slug) ?? null,
            }));
        }
        // ─── Banner Analytics ────────────────────────────────────────────────────────
        async getBannerAnalytics() {
            const banners = await this.bannerRepo.find();
            const totalClicks = banners.reduce((sum, b) => sum + (b.clickCount || 0), 0);
            const activeBanners = banners.filter(b => b.isActive).length;
            // Group by page type
            const pageTypeMap = new Map();
            for (const b of banners) {
                const pt = b.pageType || 'home';
                const entry = pageTypeMap.get(pt) || { count: 0, clicks: 0 };
                entry.count++;
                entry.clicks += b.clickCount || 0;
                pageTypeMap.set(pt, entry);
            }
            // Group by position
            const positionMap = new Map();
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
        async listContentPages() {
            return this.contentPageRepo.find({ order: { slug: 'ASC' } });
        }
        async createContentPage(dto, updatedById) {
            const existing = await this.contentPageRepo.findOne({ where: { slug: dto.slug } });
            if (existing) {
                throw new ConflictException({ code: 'SLUG_DUPLICATE', message: 'Page slug already exists' });
            }
            const page = this.contentPageRepo.create({ ...dto, updatedById });
            return this.contentPageRepo.save(page);
        }
        async updateContentPage(id, dto, updatedById) {
            const page = await this.contentPageRepo.findOne({ where: { id } });
            if (!page)
                throw new NotFoundException(`Content page ${id} not found`);
            Object.assign(page, dto);
            if (updatedById)
                page.updatedById = updatedById;
            return this.contentPageRepo.save(page);
        }
        async deleteContentPage(id) {
            const page = await this.contentPageRepo.findOne({ where: { id } });
            if (!page)
                throw new NotFoundException(`Content page ${id} not found`);
            await this.contentPageRepo.remove(page);
        }
    };
    __setFunctionName(_classThis, "AdminService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminService = _classThis;
})();
export { AdminService };
//# sourceMappingURL=admin.service.js.map