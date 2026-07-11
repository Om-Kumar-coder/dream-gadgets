import { Repository } from 'typeorm';
import { User, Role, Branch } from '../auth/entities/user.entity';
import { Setting } from './entities/setting.entity';
import { Banner, ContentPage } from './entities/banner.entity';
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
export declare class AdminService {
    private userRepo;
    private roleRepo;
    private branchRepo;
    private settingRepo;
    private bannerRepo;
    private contentPageRepo;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>, branchRepo: Repository<Branch>, settingRepo: Repository<Setting>, bannerRepo: Repository<Banner>, contentPageRepo: Repository<ContentPage>);
    createUser(dto: CreateUserDto): Promise<User>;
    updateUser(id: string, dto: UpdateUserDto): Promise<User>;
    deleteUser(id: string): Promise<void>;
    listUsers(branchId?: string, search?: string): Promise<User[]>;
    findUserById(id: string): Promise<User>;
    listRoles(): Promise<Role[]>;
    createRole(dto: CreateRoleDto): Promise<Role & {
        permissions: string[];
    }>;
    updateRolePermissions(id: string, dto: UpdateRolePermissionsDto): Promise<{
        id: string;
        permissions: string[];
    }>;
    getRolePermissions(id: string): Promise<string[]>;
    listBranches(): Promise<Branch[]>;
    createBranch(dto: CreateBranchDto): Promise<Branch>;
    updateBranch(id: string, dto: UpdateBranchDto): Promise<Branch>;
    getSetting(key: string): Promise<Setting>;
    upsertSetting(key: string, value: any, description?: string, updatedById?: string): Promise<Setting>;
    listSettings(): Promise<Setting[]>;
    listBanners(pageType?: string, position?: string): Promise<Banner[]>;
    getActiveBanners(pageType: string, position: string, deviceType?: string): Promise<Banner[]>;
    createBanner(dto: CreateBannerDto, createdById?: string): Promise<Banner>;
    updateBanner(id: string, dto: Partial<CreateBannerDto>): Promise<Banner>;
    updateBannerOrder(banners: {
        id: string;
        sortOrder: number;
    }[]): Promise<void>;
    toggleBanner(id: string): Promise<Banner>;
    incrementBannerClicks(id: string): Promise<void>;
    deleteBanner(id: string): Promise<void>;
    getBrandHero(slug: string): Promise<{
        imageUrl: string | null;
    }>;
    upsertBrandHero(slug: string, imageUrl: string): Promise<{
        imageUrl: string;
    }>;
    listBrandHeroes(): Promise<{
        slug: string;
        name: string;
        imageUrl: string | null;
    }[]>;
    getBannerAnalytics(): Promise<{
        totalBanners: number;
        totalClicks: number;
        activeBanners: number;
        inactiveBanners: number;
        byPageType: {
            pageType: string;
            count: number;
            clicks: number;
        }[];
        byPosition: {
            position: string;
            count: number;
            clicks: number;
        }[];
        topBanners: {
            id: string;
            title: string;
            pageType: string;
            position: string;
            clicks: number;
            imageUrl: string;
            isActive: boolean;
        }[];
    }>;
    listContentPages(): Promise<ContentPage[]>;
    createContentPage(dto: CreateContentPageDto, updatedById?: string): Promise<ContentPage>;
    updateContentPage(id: string, dto: Partial<CreateContentPageDto>, updatedById?: string): Promise<ContentPage>;
    deleteContentPage(id: string): Promise<void>;
}
//# sourceMappingURL=admin.service.d.ts.map