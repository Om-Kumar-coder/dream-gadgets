import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { User, Role, Branch } from '../auth/entities/user.entity';
import { Setting } from './entities/setting.entity';
import { Banner, ContentPage } from './entities/banner.entity';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    email: 'test@example.com',
    phone: '+919876543210',
    passwordHash: '$2b$10$hash',
    firstName: 'John',
    lastName: 'Doe',
    roleId: 'role-uuid-1',
    branchId: 'branch-uuid-1',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: null,
    branch: null,
    ...overrides,
  } as User;
}

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-uuid-1',
    name: 'Shop Sales',
    description: 'Sales staff role',
    isSystem: false,
    createdAt: new Date(),
    ...overrides,
  } as Role;
}

function makeBranch(overrides: Partial<Branch> = {}): Branch {
  return {
    id: 'branch-uuid-1',
    name: 'Main Branch',
    code: 'MUM',
    isActive: true,
    ...overrides,
  } as Branch;
}

function makeSetting(overrides: Partial<Setting> = {}): Setting {
  return {
    id: 'setting-uuid-1',
    key: 'return_window_days',
    value: 7,
    description: 'Return window in days',
    updatedById: null,
    updatedAt: new Date(),
    updatedBy: null,
    ...overrides,
  } as Setting;
}

function makeBanner(overrides: Partial<Banner> = {}): Banner {
  return {
    id: 'banner-uuid-1',
    title: 'Summer Sale',
    imageUrl: 'https://cdn.example.com/banner.jpg',
    linkUrl: '/offers',
    sortOrder: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
    ...overrides,
  } as Banner;
}

function makeContentPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    id: 'page-uuid-1',
    slug: 'about-us',
    title: 'About Us',
    content: '<p>About Dream Gadgets</p>',
    metaTitle: 'About Us | Dream Gadgets',
    metaDesc: 'Learn about Dream Gadgets',
    isActive: true,
    updatedById: null,
    updatedAt: new Date(),
    updatedBy: null,
    ...overrides,
  } as ContentPage;
}

function makeRepo(entity?: any): any {
  return {
    find: jest.fn(async () => []) as any,
    findOne: jest.fn(async () => null) as any,
    create: jest.fn((data: any) => ({ ...data, id: `${entity ?? 'entity'}-uuid-new` })) as any,
    save: jest.fn(async (entity: any) => entity) as any,
    update: jest.fn(async () => ({ affected: 1 })) as any,
    remove: jest.fn(async () => ({})) as any,
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(() => Promise.resolve([])),
    })) as any,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('AdminService', () => {
  let service: AdminService;
  let userRepo: any;
  let roleRepo: any;
  let branchRepo: any;
  let settingRepo: any;
  let bannerRepo: any;
  let contentPageRepo: any;

  beforeEach(async () => {
    userRepo = makeRepo('user');
    roleRepo = makeRepo('role');
    branchRepo = makeRepo('branch');
    settingRepo = makeRepo('setting');
    bannerRepo = makeRepo('banner');
    contentPageRepo = makeRepo('page');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(Branch), useValue: branchRepo },
        { provide: getRepositoryToken(Setting), useValue: settingRepo },
        { provide: getRepositoryToken(Banner), useValue: bannerRepo },
        { provide: getRepositoryToken(ContentPage), useValue: contentPageRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  // ─── 16.1 User management ─────────────────────────────────────────────────────

  describe('createUser()', () => {
    it('should create a user with hashed password', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const user = makeUser();
      userRepo.save.mockResolvedValue(user);

      const result = await service.createUser({
        phone: '+919876543210',
        password: 'password123',
        firstName: 'John',
      });

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+919876543210',
          firstName: 'John',
          isActive: true,
        }),
      );
      // Password should be hashed
      const createCall = userRepo.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('password123');
      expect(createCall.passwordHash).toMatch(/^\$2b\$/);
    });

    it('should throw ConflictException for duplicate phone', async () => {
      userRepo.findOne.mockResolvedValue(makeUser());

      await expect(
        service.createUser({ phone: '+919876543210', password: 'pass', firstName: 'John' }),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.createUser({ phone: '+919876543210', password: 'pass', firstName: 'John' }),
      ).rejects.toMatchObject({ response: { code: 'PHONE_DUPLICATE' } });
    });
  });

  describe('updateUser()', () => {
    it('should update user fields', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, firstName: 'Jane' });

      const result = await service.updateUser('user-uuid-1', { firstName: 'Jane' });

      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.updateUser('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser()', () => {
    it('should deactivate user (soft delete)', async () => {
      const user = makeUser({ isActive: true });
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, isActive: false });

      await service.deleteUser('user-uuid-1');

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listUsers()', () => {
    it('should return all users', async () => {
      const users = [makeUser(), makeUser({ id: 'user-uuid-2', phone: '+919876543211' })];
      userRepo.find.mockResolvedValue(users);

      const result = await service.listUsers();

      expect(result).toHaveLength(2);
    });

    it('should filter by branchId when provided', async () => {
      userRepo.find.mockResolvedValue([makeUser()]);

      await service.listUsers('branch-uuid-1');

      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId: 'branch-uuid-1' } }),
      );
    });
  });

  // ─── 16.2 Role management ─────────────────────────────────────────────────────

  describe('listRoles()', () => {
    it('should return all roles', async () => {
      const roles = [makeRole(), makeRole({ id: 'role-uuid-2', name: 'Manager' })];
      roleRepo.find.mockResolvedValue(roles);

      const result = await service.listRoles();

      expect(result).toHaveLength(2);
    });
  });

  describe('createRole()', () => {
    it('should create a role with permissions', async () => {
      roleRepo.findOne.mockResolvedValue(null);
      const role = makeRole();
      roleRepo.save.mockResolvedValue(role);
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockReturnValue({ key: 'role:role-uuid-1:permissions', value: [] });
      settingRepo.save.mockResolvedValue({});

      const result = await service.createRole({
        name: 'Shop Sales',
        permissions: ['inventory.view', 'sales.create'],
      });

      expect(result.permissions).toEqual(['inventory.view', 'sales.create']);
    });

    it('should throw ConflictException for duplicate role name', async () => {
      roleRepo.findOne.mockResolvedValue(makeRole());

      await expect(
        service.createRole({ name: 'Shop Sales' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRolePermissions()', () => {
    it('should update role permissions', async () => {
      roleRepo.findOne.mockResolvedValue(makeRole());
      settingRepo.findOne.mockResolvedValue(makeSetting({ key: 'role:role-uuid-1:permissions', value: [] }));
      settingRepo.save.mockResolvedValue({});

      const result = await service.updateRolePermissions('role-uuid-1', {
        permissions: ['inventory.view', 'sales.create', 'sales.approve'],
      });

      expect(result.permissions).toEqual(['inventory.view', 'sales.create', 'sales.approve']);
    });

    it('should throw NotFoundException for non-existent role', async () => {
      roleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateRolePermissions('non-existent', { permissions: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 16.3 Branch management ───────────────────────────────────────────────────

  describe('createBranch()', () => {
    it('should create a branch', async () => {
      branchRepo.findOne.mockResolvedValue(null);
      const branch = makeBranch();
      branchRepo.save.mockResolvedValue(branch);

      const result = await service.createBranch({ name: 'Main Branch', code: 'MUM' });

      expect(branchRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Main Branch', code: 'MUM' }),
      );
    });

    it('should throw ConflictException for duplicate branch code', async () => {
      branchRepo.findOne.mockResolvedValue(makeBranch());

      await expect(
        service.createBranch({ name: 'Another Branch', code: 'MUM' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBranch()', () => {
    it('should update branch fields', async () => {
      const branch = makeBranch();
      branchRepo.findOne.mockResolvedValue(branch);
      branchRepo.save.mockResolvedValue({ ...branch, name: 'Updated Branch' });

      await service.updateBranch('branch-uuid-1', { name: 'Updated Branch' });

      expect(branchRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent branch', async () => {
      branchRepo.findOne.mockResolvedValue(null);

      await expect(service.updateBranch('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 16.4 Settings management ─────────────────────────────────────────────────

  describe('getSetting()', () => {
    it('should return setting by key', async () => {
      const setting = makeSetting();
      settingRepo.findOne.mockResolvedValue(setting);

      const result = await service.getSetting('return_window_days');

      expect(result.key).toBe('return_window_days');
      expect(result.value).toBe(7);
    });

    it('should throw NotFoundException for non-existent key', async () => {
      settingRepo.findOne.mockResolvedValue(null);

      await expect(service.getSetting('non_existent_key')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertSetting()', () => {
    it('should create new setting when key does not exist', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      const setting = makeSetting();
      settingRepo.create.mockReturnValue(setting);
      settingRepo.save.mockResolvedValue(setting);

      const result = await service.upsertSetting('new_key', 'new_value');

      expect(settingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'new_key', value: 'new_value' }),
      );
    });

    it('should update existing setting', async () => {
      const existing = makeSetting();
      settingRepo.findOne.mockResolvedValue(existing);
      settingRepo.save.mockResolvedValue({ ...existing, value: 14 });

      const result = await service.upsertSetting('return_window_days', 14);

      expect(settingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ value: 14 }),
      );
    });
  });

  // ─── 16.5 Content management ──────────────────────────────────────────────────

  describe('createBanner()', () => {
    it('should create a banner', async () => {
      const banner = makeBanner();
      bannerRepo.create.mockReturnValue(banner);
      bannerRepo.save.mockResolvedValue(banner);

      const result = await service.createBanner({
        title: 'Summer Sale',
        imageUrl: 'https://cdn.example.com/banner.jpg',
      });

      expect(bannerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Summer Sale' }),
      );
    });
  });

  describe('deleteBanner()', () => {
    it('should delete a banner', async () => {
      const banner = makeBanner();
      bannerRepo.findOne.mockResolvedValue(banner);
      bannerRepo.remove.mockResolvedValue({});

      await service.deleteBanner('banner-uuid-1');

      expect(bannerRepo.remove).toHaveBeenCalledWith(banner);
    });

    it('should throw NotFoundException for non-existent banner', async () => {
      bannerRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteBanner('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createContentPage()', () => {
    it('should create a content page', async () => {
      contentPageRepo.findOne.mockResolvedValue(null);
      const page = makeContentPage();
      contentPageRepo.create.mockReturnValue(page);
      contentPageRepo.save.mockResolvedValue(page);

      const result = await service.createContentPage({ slug: 'about-us', title: 'About Us' });

      expect(contentPageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'about-us', title: 'About Us' }),
      );
    });

    it('should throw ConflictException for duplicate slug', async () => {
      contentPageRepo.findOne.mockResolvedValue(makeContentPage());

      await expect(
        service.createContentPage({ slug: 'about-us', title: 'About Us' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
