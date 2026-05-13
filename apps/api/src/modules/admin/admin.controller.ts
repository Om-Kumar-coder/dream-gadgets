import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AdminService,
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRolePermissionsDto,
  CreateBranchDto,
  UpdateBranchDto,
  CreateBannerDto,
  CreateContentPageDto,
} from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  @RequirePermission('users.view')
  async listUsers(@Query('branchId') branchId?: string) {
    const users = await this.adminService.listUsers(branchId);
    return { status: 'success', data: users };
  }

  @Post('users')
  @RequirePermission('users.create')
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.adminService.createUser(dto);
    return { status: 'success', data: user };
  }

  @Patch('users/:id')
  @RequirePermission('users.edit')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.adminService.updateUser(id, dto);
    return { status: 'success', data: user };
  }

  @Delete('users/:id')
  @RequirePermission('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
  }

  // ─── Roles ────────────────────────────────────────────────────────────────────

  @Get('roles')
  @RequirePermission('settings.view')
  async listRoles() {
    const roles = await this.adminService.listRoles();
    return { status: 'success', data: roles };
  }

  @Post('roles')
  @RequirePermission('settings.create')
  async createRole(@Body() dto: CreateRoleDto) {
    const role = await this.adminService.createRole(dto);
    return { status: 'success', data: role };
  }

  @Patch('roles/:id/permissions')
  @RequirePermission('settings.edit')
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    const result = await this.adminService.updateRolePermissions(id, dto);
    return { status: 'success', data: result };
  }

  // ─── Branches ─────────────────────────────────────────────────────────────────

  @Get('branches')
  @RequirePermission('settings.view')
  async listBranches() {
    const branches = await this.adminService.listBranches();
    return { status: 'success', data: branches };
  }

  @Post('branches')
  @RequirePermission('settings.create')
  async createBranch(@Body() dto: CreateBranchDto) {
    const branch = await this.adminService.createBranch(dto);
    return { status: 'success', data: branch };
  }

  @Patch('branches/:id')
  @RequirePermission('settings.edit')
  async updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    const branch = await this.adminService.updateBranch(id, dto);
    return { status: 'success', data: branch };
  }

  // ─── Settings ─────────────────────────────────────────────────────────────────

  @Get('settings')
  @RequirePermission('settings.view')
  async listSettings() {
    const settings = await this.adminService.listSettings();
    return { status: 'success', data: settings };
  }

  @Get('settings/:key')
  @RequirePermission('settings.view')
  async getSetting(@Param('key') key: string) {
    const setting = await this.adminService.getSetting(key);
    return { status: 'success', data: setting };
  }

  @Patch('settings/:key')
  @RequirePermission('settings.edit')
  async upsertSetting(
    @Param('key') key: string,
    @Body() body: { value: any; description?: string },
    @CurrentUser() user: any,
  ) {
    const setting = await this.adminService.upsertSetting(key, body.value, body.description, user?.id);
    return { status: 'success', data: setting };
  }

  // ─── Banners ──────────────────────────────────────────────────────────────────

  @Get('banners')
  async listBanners() {
    const banners = await this.adminService.listBanners();
    return { status: 'success', data: banners };
  }

  @Post('banners')
  @RequirePermission('content.create')
  async createBanner(@Body() dto: CreateBannerDto, @CurrentUser() user: any) {
    const banner = await this.adminService.createBanner(dto, user?.id);
    return { status: 'success', data: banner };
  }

  @Patch('banners/:id')
  @RequirePermission('content.edit')
  async updateBanner(@Param('id') id: string, @Body() dto: Partial<CreateBannerDto>) {
    const banner = await this.adminService.updateBanner(id, dto);
    return { status: 'success', data: banner };
  }

  @Delete('banners/:id')
  @RequirePermission('content.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBanner(@Param('id') id: string) {
    await this.adminService.deleteBanner(id);
  }

  // ─── Content pages ────────────────────────────────────────────────────────────

  @Get('pages')
  async listContentPages() {
    const pages = await this.adminService.listContentPages();
    return { status: 'success', data: pages };
  }

  @Post('pages')
  @RequirePermission('content.create')
  async createContentPage(@Body() dto: CreateContentPageDto, @CurrentUser() user: any) {
    const page = await this.adminService.createContentPage(dto, user?.id);
    return { status: 'success', data: page };
  }

  @Patch('pages/:id')
  @RequirePermission('content.edit')
  async updateContentPage(
    @Param('id') id: string,
    @Body() dto: Partial<CreateContentPageDto>,
    @CurrentUser() user: any,
  ) {
    const page = await this.adminService.updateContentPage(id, dto, user?.id);
    return { status: 'success', data: page };
  }

  @Delete('pages/:id')
  @RequirePermission('content.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContentPage(@Param('id') id: string) {
    await this.adminService.deleteContentPage(id);
  }
}
