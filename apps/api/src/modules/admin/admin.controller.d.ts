import { AuthService } from '../auth/auth.service';
import { AdminService, CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRolePermissionsDto, CreateBranchDto, UpdateBranchDto, CreateBannerDto, CreateContentPageDto } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    private readonly authService;
    constructor(adminService: AdminService, authService: AuthService);
    listUsers(branchId?: string, search?: string): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").User[];
    }>;
    createUser(dto: CreateUserDto): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").User;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").User;
    }>;
    deleteUser(id: string): Promise<void>;
    listRoles(): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").Role[];
    }>;
    createRole(dto: CreateRoleDto): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").Role & {
            permissions: string[];
        };
    }>;
    updateRolePermissions(id: string, dto: UpdateRolePermissionsDto): Promise<{
        status: string;
        data: {
            id: string;
            permissions: string[];
        };
    }>;
    invalidatePermissionCache(id: string): Promise<{
        status: string;
        message: string;
    }>;
    listBranches(): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").Branch[];
    }>;
    createBranch(dto: CreateBranchDto): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").Branch;
    }>;
    updateBranch(id: string, dto: UpdateBranchDto): Promise<{
        status: string;
        data: import("../auth/entities/user.entity").Branch;
    }>;
    listSettings(): Promise<{
        status: string;
        data: import("./entities/setting.entity").Setting[];
    }>;
    getSetting(key: string): Promise<{
        status: string;
        data: import("./entities/setting.entity").Setting;
    }>;
    upsertSetting(key: string, body: {
        value: any;
        description?: string;
    }, user: any): Promise<{
        status: string;
        data: import("./entities/setting.entity").Setting;
    }>;
    listBanners(pageType?: string, position?: string): Promise<{
        status: string;
        data: import("./entities/banner.entity").Banner[];
    }>;
    createBanner(dto: CreateBannerDto, user: any): Promise<{
        status: string;
        data: import("./entities/banner.entity").Banner;
    }>;
    updateBanner(id: string, dto: Partial<CreateBannerDto>): Promise<{
        status: string;
        data: import("./entities/banner.entity").Banner;
    }>;
    toggleBanner(id: string): Promise<{
        status: string;
        data: import("./entities/banner.entity").Banner;
    }>;
    updateBannerOrder(body: {
        banners: {
            id: string;
            sortOrder: number;
        }[];
    }): Promise<{
        status: string;
    }>;
    deleteBanner(id: string): Promise<void>;
    uploadBannerImage(file: {
        filename: string;
    }): Promise<{
        status: string;
        data: {
            url: string;
            filename: string;
        };
    }>;
    listBrandHeroes(): Promise<{
        status: string;
        data: {
            slug: string;
            name: string;
            imageUrl: string | null;
        }[];
    }>;
    getBrandHero(slug: string): Promise<{
        status: string;
        data: {
            imageUrl: string | null;
        };
    }>;
    updateBrandHero(slug: string, body: {
        imageUrl: string;
    }): Promise<{
        status: string;
        data: {
            imageUrl: string;
        };
    }>;
    getBannerAnalytics(): Promise<{
        status: string;
        data: {
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
        };
    }>;
    listContentPages(): Promise<{
        status: string;
        data: import("./entities/banner.entity").ContentPage[];
    }>;
    createContentPage(dto: CreateContentPageDto, user: any): Promise<{
        status: string;
        data: import("./entities/banner.entity").ContentPage;
    }>;
    updateContentPage(id: string, dto: Partial<CreateContentPageDto>, user: any): Promise<{
        status: string;
        data: import("./entities/banner.entity").ContentPage;
    }>;
    deleteContentPage(id: string): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map