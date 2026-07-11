var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, Patch, Put, Delete, UseGuards, UseInterceptors, HttpCode, HttpStatus, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let AdminController = (() => {
    let _classDecorators = [Controller('admin'), UseGuards(AuthGuard('jwt'), PermissionGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _listUsers_decorators;
    let _createUser_decorators;
    let _updateUser_decorators;
    let _deleteUser_decorators;
    let _listRoles_decorators;
    let _createRole_decorators;
    let _updateRolePermissions_decorators;
    let _invalidatePermissionCache_decorators;
    let _listBranches_decorators;
    let _createBranch_decorators;
    let _updateBranch_decorators;
    let _listSettings_decorators;
    let _getSetting_decorators;
    let _upsertSetting_decorators;
    let _listBanners_decorators;
    let _createBanner_decorators;
    let _updateBanner_decorators;
    let _toggleBanner_decorators;
    let _updateBannerOrder_decorators;
    let _deleteBanner_decorators;
    let _uploadBannerImage_decorators;
    let _listBrandHeroes_decorators;
    let _getBrandHero_decorators;
    let _updateBrandHero_decorators;
    let _getBannerAnalytics_decorators;
    let _listContentPages_decorators;
    let _createContentPage_decorators;
    let _updateContentPage_decorators;
    let _deleteContentPage_decorators;
    var AdminController = _classThis = class {
        constructor(adminService, authService) {
            this.adminService = (__runInitializers(this, _instanceExtraInitializers), adminService);
            this.authService = authService;
        }
        // ─── Users ────────────────────────────────────────────────────────────────────
        async listUsers(branchId, search) {
            const users = await this.adminService.listUsers(branchId, search);
            return { status: 'success', data: users };
        }
        async createUser(dto) {
            const user = await this.adminService.createUser(dto);
            return { status: 'success', data: user };
        }
        async updateUser(id, dto) {
            const user = await this.adminService.updateUser(id, dto);
            return { status: 'success', data: user };
        }
        async deleteUser(id) {
            await this.adminService.deleteUser(id);
        }
        // ─── Roles ────────────────────────────────────────────────────────────────────
        async listRoles() {
            const roles = await this.adminService.listRoles();
            return { status: 'success', data: roles };
        }
        async createRole(dto) {
            const role = await this.adminService.createRole(dto);
            return { status: 'success', data: role };
        }
        async updateRolePermissions(id, dto) {
            const result = await this.adminService.updateRolePermissions(id, dto);
            // Invalidate Redis cache so changes propagate instantly
            await this.authService.invalidatePermissionCache(id);
            return { status: 'success', data: result };
        }
        async invalidatePermissionCache(id) {
            await this.authService.invalidatePermissionCache(id);
            return {
                status: 'success',
                message: `Permission cache invalidated for role ${id}`,
            };
        }
        // ─── Branches ─────────────────────────────────────────────────────────────────
        async listBranches() {
            const branches = await this.adminService.listBranches();
            return { status: 'success', data: branches };
        }
        async createBranch(dto) {
            const branch = await this.adminService.createBranch(dto);
            return { status: 'success', data: branch };
        }
        async updateBranch(id, dto) {
            const branch = await this.adminService.updateBranch(id, dto);
            return { status: 'success', data: branch };
        }
        // ─── Settings ─────────────────────────────────────────────────────────────────
        async listSettings() {
            const settings = await this.adminService.listSettings();
            return { status: 'success', data: settings };
        }
        async getSetting(key) {
            const setting = await this.adminService.getSetting(key);
            return { status: 'success', data: setting };
        }
        async upsertSetting(key, body, user) {
            const setting = await this.adminService.upsertSetting(key, body.value, body.description, user?.id);
            return { status: 'success', data: setting };
        }
        // ─── Banners ──────────────────────────────────────────────────────────────────
        async listBanners(pageType, position) {
            const banners = await this.adminService.listBanners(pageType, position);
            return { status: 'success', data: banners };
        }
        async createBanner(dto, user) {
            const banner = await this.adminService.createBanner(dto, user?.id);
            return { status: 'success', data: banner };
        }
        async updateBanner(id, dto) {
            const banner = await this.adminService.updateBanner(id, dto);
            return { status: 'success', data: banner };
        }
        async toggleBanner(id) {
            const banner = await this.adminService.toggleBanner(id);
            return { status: 'success', data: banner };
        }
        async updateBannerOrder(body) {
            await this.adminService.updateBannerOrder(body.banners);
            return { status: 'success' };
        }
        async deleteBanner(id) {
            await this.adminService.deleteBanner(id);
        }
        // ─── File Upload ──────────────────────────────────────────────────────────────
        async uploadBannerImage(file) {
            const url = `/uploads/banners/${file.filename}`;
            return { status: 'success', data: { url, filename: file.filename } };
        }
        // ─── Brand Heroes ──────────────────────────────────────────────────────────────
        async listBrandHeroes() {
            const heroes = await this.adminService.listBrandHeroes();
            return { status: 'success', data: heroes };
        }
        async getBrandHero(slug) {
            const hero = await this.adminService.getBrandHero(slug);
            return { status: 'success', data: hero };
        }
        async updateBrandHero(slug, body) {
            const hero = await this.adminService.upsertBrandHero(slug, body.imageUrl);
            return { status: 'success', data: hero };
        }
        // ─── Banner Analytics ─────────────────────────────────────────────────────────
        async getBannerAnalytics() {
            const analytics = await this.adminService.getBannerAnalytics();
            return { status: 'success', data: analytics };
        }
        // ─── Content pages ────────────────────────────────────────────────────────────
        async listContentPages() {
            const pages = await this.adminService.listContentPages();
            return { status: 'success', data: pages };
        }
        async createContentPage(dto, user) {
            const page = await this.adminService.createContentPage(dto, user?.id);
            return { status: 'success', data: page };
        }
        async updateContentPage(id, dto, user) {
            const page = await this.adminService.updateContentPage(id, dto, user?.id);
            return { status: 'success', data: page };
        }
        async deleteContentPage(id) {
            await this.adminService.deleteContentPage(id);
        }
    };
    __setFunctionName(_classThis, "AdminController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _listUsers_decorators = [Get('users'), RequirePermission('users.view')];
        _createUser_decorators = [Post('users'), RequirePermission('users.create')];
        _updateUser_decorators = [Patch('users/:id'), RequirePermission('users.edit')];
        _deleteUser_decorators = [Delete('users/:id'), RequirePermission('users.delete'), HttpCode(HttpStatus.NO_CONTENT)];
        _listRoles_decorators = [Get('roles'), RequirePermission('settings.view')];
        _createRole_decorators = [Post('roles'), RequirePermission('settings.create')];
        _updateRolePermissions_decorators = [Patch('roles/:id/permissions'), RequirePermission('settings.edit')];
        _invalidatePermissionCache_decorators = [Post('roles/:id/invalidate-permissions'), RequirePermission('settings.edit'), HttpCode(HttpStatus.OK)];
        _listBranches_decorators = [Get('branches'), RequirePermission('settings.view')];
        _createBranch_decorators = [Post('branches'), RequirePermission('settings.create')];
        _updateBranch_decorators = [Patch('branches/:id'), RequirePermission('settings.edit')];
        _listSettings_decorators = [Get('settings'), RequirePermission('settings.view')];
        _getSetting_decorators = [Get('settings/:key'), RequirePermission('settings.view')];
        _upsertSetting_decorators = [Patch('settings/:key'), RequirePermission('settings.edit')];
        _listBanners_decorators = [Get('banners')];
        _createBanner_decorators = [Post('banners'), RequirePermission('content.create')];
        _updateBanner_decorators = [Patch('banners/:id'), RequirePermission('content.edit')];
        _toggleBanner_decorators = [Patch('banners/:id/toggle'), RequirePermission('content.edit')];
        _updateBannerOrder_decorators = [Patch('banners-order'), RequirePermission('content.edit')];
        _deleteBanner_decorators = [Delete('banners/:id'), RequirePermission('content.delete'), HttpCode(HttpStatus.NO_CONTENT)];
        _uploadBannerImage_decorators = [Post('upload/banner'), RequirePermission('content.create'), UseInterceptors(FileInterceptor('file', {
                storage: diskStorage({
                    destination: (_req, _file, cb) => {
                        const uploadDir = join(__dirname, '..', '..', '..', '..', 'uploads', 'banners');
                        if (!existsSync(uploadDir))
                            mkdirSync(uploadDir, { recursive: true });
                        cb(null, uploadDir);
                    },
                    filename: (_req, file, cb) => {
                        const uniqueName = `${uuid()}${extname(file.originalname)}`;
                        cb(null, uniqueName);
                    },
                }),
                limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
                fileFilter: (_req, file, cb) => {
                    const allowed = /jpeg|jpg|png|webp|gif/;
                    const extOk = allowed.test(extname(file.originalname).toLowerCase());
                    const mimeOk = allowed.test(file.mimetype);
                    if (extOk && mimeOk)
                        cb(null, true);
                    else
                        cb(new Error('Only image files (jpg, png, webp, gif) are allowed'), false);
                },
            }))];
        _listBrandHeroes_decorators = [Get('brand-heroes'), RequirePermission('settings.view')];
        _getBrandHero_decorators = [Get('brand-heroes/:slug'), RequirePermission('settings.view')];
        _updateBrandHero_decorators = [Put('brand-heroes/:slug'), RequirePermission('settings.edit')];
        _getBannerAnalytics_decorators = [Get('banners/analytics'), RequirePermission('content.view')];
        _listContentPages_decorators = [Get('pages')];
        _createContentPage_decorators = [Post('pages'), RequirePermission('content.create')];
        _updateContentPage_decorators = [Patch('pages/:id'), RequirePermission('content.edit')];
        _deleteContentPage_decorators = [Delete('pages/:id'), RequirePermission('content.delete'), HttpCode(HttpStatus.NO_CONTENT)];
        __esDecorate(_classThis, null, _listUsers_decorators, { kind: "method", name: "listUsers", static: false, private: false, access: { has: obj => "listUsers" in obj, get: obj => obj.listUsers }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createUser_decorators, { kind: "method", name: "createUser", static: false, private: false, access: { has: obj => "createUser" in obj, get: obj => obj.createUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateUser_decorators, { kind: "method", name: "updateUser", static: false, private: false, access: { has: obj => "updateUser" in obj, get: obj => obj.updateUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteUser_decorators, { kind: "method", name: "deleteUser", static: false, private: false, access: { has: obj => "deleteUser" in obj, get: obj => obj.deleteUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listRoles_decorators, { kind: "method", name: "listRoles", static: false, private: false, access: { has: obj => "listRoles" in obj, get: obj => obj.listRoles }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRole_decorators, { kind: "method", name: "createRole", static: false, private: false, access: { has: obj => "createRole" in obj, get: obj => obj.createRole }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateRolePermissions_decorators, { kind: "method", name: "updateRolePermissions", static: false, private: false, access: { has: obj => "updateRolePermissions" in obj, get: obj => obj.updateRolePermissions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _invalidatePermissionCache_decorators, { kind: "method", name: "invalidatePermissionCache", static: false, private: false, access: { has: obj => "invalidatePermissionCache" in obj, get: obj => obj.invalidatePermissionCache }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listBranches_decorators, { kind: "method", name: "listBranches", static: false, private: false, access: { has: obj => "listBranches" in obj, get: obj => obj.listBranches }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createBranch_decorators, { kind: "method", name: "createBranch", static: false, private: false, access: { has: obj => "createBranch" in obj, get: obj => obj.createBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBranch_decorators, { kind: "method", name: "updateBranch", static: false, private: false, access: { has: obj => "updateBranch" in obj, get: obj => obj.updateBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listSettings_decorators, { kind: "method", name: "listSettings", static: false, private: false, access: { has: obj => "listSettings" in obj, get: obj => obj.listSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSetting_decorators, { kind: "method", name: "getSetting", static: false, private: false, access: { has: obj => "getSetting" in obj, get: obj => obj.getSetting }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upsertSetting_decorators, { kind: "method", name: "upsertSetting", static: false, private: false, access: { has: obj => "upsertSetting" in obj, get: obj => obj.upsertSetting }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listBanners_decorators, { kind: "method", name: "listBanners", static: false, private: false, access: { has: obj => "listBanners" in obj, get: obj => obj.listBanners }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createBanner_decorators, { kind: "method", name: "createBanner", static: false, private: false, access: { has: obj => "createBanner" in obj, get: obj => obj.createBanner }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBanner_decorators, { kind: "method", name: "updateBanner", static: false, private: false, access: { has: obj => "updateBanner" in obj, get: obj => obj.updateBanner }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleBanner_decorators, { kind: "method", name: "toggleBanner", static: false, private: false, access: { has: obj => "toggleBanner" in obj, get: obj => obj.toggleBanner }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBannerOrder_decorators, { kind: "method", name: "updateBannerOrder", static: false, private: false, access: { has: obj => "updateBannerOrder" in obj, get: obj => obj.updateBannerOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteBanner_decorators, { kind: "method", name: "deleteBanner", static: false, private: false, access: { has: obj => "deleteBanner" in obj, get: obj => obj.deleteBanner }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadBannerImage_decorators, { kind: "method", name: "uploadBannerImage", static: false, private: false, access: { has: obj => "uploadBannerImage" in obj, get: obj => obj.uploadBannerImage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listBrandHeroes_decorators, { kind: "method", name: "listBrandHeroes", static: false, private: false, access: { has: obj => "listBrandHeroes" in obj, get: obj => obj.listBrandHeroes }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBrandHero_decorators, { kind: "method", name: "getBrandHero", static: false, private: false, access: { has: obj => "getBrandHero" in obj, get: obj => obj.getBrandHero }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBrandHero_decorators, { kind: "method", name: "updateBrandHero", static: false, private: false, access: { has: obj => "updateBrandHero" in obj, get: obj => obj.updateBrandHero }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBannerAnalytics_decorators, { kind: "method", name: "getBannerAnalytics", static: false, private: false, access: { has: obj => "getBannerAnalytics" in obj, get: obj => obj.getBannerAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listContentPages_decorators, { kind: "method", name: "listContentPages", static: false, private: false, access: { has: obj => "listContentPages" in obj, get: obj => obj.listContentPages }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createContentPage_decorators, { kind: "method", name: "createContentPage", static: false, private: false, access: { has: obj => "createContentPage" in obj, get: obj => obj.createContentPage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateContentPage_decorators, { kind: "method", name: "updateContentPage", static: false, private: false, access: { has: obj => "updateContentPage" in obj, get: obj => obj.updateContentPage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteContentPage_decorators, { kind: "method", name: "deleteContentPage", static: false, private: false, access: { has: obj => "deleteContentPage" in obj, get: obj => obj.deleteContentPage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminController = _classThis;
})();
export { AdminController };
//# sourceMappingURL=admin.controller.js.map