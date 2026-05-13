import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

// ─── Redis mock ──────────────────────────────────────────────────────────────
const redisMock: Record<string, { value: string; ttl?: number }> = {};

const redisClientMock = {
  get: jest.fn(async (key: string) => redisMock[key]?.value ?? null),
  set: jest.fn(async (key: string, value: string, opts?: { EX?: number }) => {
    redisMock[key] = { value, ttl: opts?.EX };
  }),
  del: jest.fn(async (...keys: string[]) => {
    const flat = keys.flat();
    flat.forEach((k) => delete redisMock[k]);
  }),
  incr: jest.fn(async (key: string) => {
    const cur = parseInt(redisMock[key]?.value ?? '0', 10);
    const next = cur + 1;
    redisMock[key] = { value: String(next) };
    return next;
  }),
  expire: jest.fn(async () => {}),
  keys: jest.fn(async (pattern: string) => {
    const prefix = pattern.replace('*', '');
    return Object.keys(redisMock).filter((k) => k.startsWith(prefix));
  }),
  connect: jest.fn(async () => {}),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  const u = new User();
  u.id = 'user-uuid-1';
  u.email = 'test@example.com';
  u.phone = '+919876543210';
  u.passwordHash = bcrypt.hashSync('password123', 1);
  u.firstName = 'Test';
  u.lastName = 'User';
  u.roleId = 'role-uuid-1';
  u.branchId = 'branch-uuid-1';
  u.isActive = true;
  u.role = { id: 'role-uuid-1', name: 'store_manager', description: '', isSystem: true, createdAt: new Date() };
  Object.assign(u, overrides);
  return u;
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: JwtService;
  let dataSource: any;

  beforeEach(async () => {
    // Clear redis mock state
    Object.keys(redisMock).forEach((k) => delete redisMock[k]);
    jest.clearAllMocks();

    userRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    };

    dataSource = {
      query: (jest.fn() as any).mockResolvedValue([{ module: 'inventory', action: 'view' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload: any, opts: any) => {
              // Return a deterministic fake token for testing
              return `fake.jwt.${JSON.stringify(payload)}`;
            }),
            verify: jest.fn((token: string, opts: any) => {
              const parts = token.split('fake.jwt.');
              if (parts.length < 2) throw new Error('invalid');
              return JSON.parse(parts[1]);
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                'app.jwtSecret': 'test-secret',
                'app.jwtExpiry': '15m',
                'app.refreshTokenSecret': 'test-refresh-secret',
                'app.refreshTokenExpiry': '7d',
                'redis.url': 'redis://localhost:6379',
                'app.env': 'test',
              };
              return map[key];
            }),
          },
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    // Inject redis mock
    (service as any).redisClient = redisClientMock;
  });

  // ─── Login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return access and refresh tokens for valid credentials', async () => {
      const user = makeUser();
      userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
      userRepo.update.mockResolvedValue({});
      dataSource.query.mockResolvedValue([{ module: 'inventory', action: 'view' }]);

      const result = await service.login({ identifier: 'test@example.com', password: 'password123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = makeUser();
      userRepo.createQueryBuilder().getOne.mockResolvedValue(user);

      await expect(
        service.login({ identifier: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepo.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when account is locked', async () => {
      // Pre-set lockout key
      redisMock['login:lockout:test@example.com'] = { value: '1' };

      await expect(
        service.login({ identifier: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const user = makeUser({ isActive: false });
      userRepo.createQueryBuilder().getOne.mockResolvedValue(user);

      await expect(
        service.login({ identifier: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Account lockout ──────────────────────────────────────────────────────

  describe('account lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      userRepo.createQueryBuilder().getOne.mockResolvedValue(null);

      for (let i = 0; i < 5; i++) {
        await service.login({ identifier: 'bad@example.com', password: 'wrong' }).catch(() => {});
      }

      // After 5 failures, lockout key should be set
      const locked = await service.isLockedOut('bad@example.com');
      expect(locked).toBe(true);
    });

    it('should clear failed attempts on successful login', async () => {
      const user = makeUser();
      userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
      userRepo.update.mockResolvedValue({});
      dataSource.query.mockResolvedValue([]);

      // Set some failed attempts
      redisMock['login:attempts:test@example.com'] = { value: '3' };

      await service.login({ identifier: 'test@example.com', password: 'password123' });

      expect(redisMock['login:attempts:test@example.com']).toBeUndefined();
    });
  });

  // ─── Refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should issue new tokens for valid refresh token', async () => {
      const user = makeUser();
      const family = 'test-family-uuid';
      const refreshToken = `fake.jwt.${JSON.stringify({ sub: user.id, family })}`;

      redisMock[`refresh:${user.id}:${family}`] = { value: refreshToken };
      userRepo.findOne.mockResolvedValue(user);
      dataSource.query.mockResolvedValue([]);

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      // Old token should be deleted
      expect(redisMock[`refresh:${user.id}:${family}`]).toBeUndefined();
    });

    it('should invalidate all sessions when already-used token is submitted', async () => {
      const userId = 'user-uuid-1';
      const family = 'used-family';
      const refreshToken = `fake.jwt.${JSON.stringify({ sub: userId, family })}`;

      // Token NOT in Redis (already used)
      // But another family exists
      redisMock[`refresh:${userId}:other-family`] = { value: 'some-token' };

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);

      // All sessions should be invalidated
      const remaining = Object.keys(redisMock).filter((k) => k.startsWith(`refresh:${userId}:`));
      expect(remaining).toHaveLength(0);
    });

    it('should throw for invalid refresh token', async () => {
      await expect(service.refresh('invalid.token.here')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      const userId = 'user-uuid-1';
      const family = 'logout-family';
      const refreshToken = `fake.jwt.${JSON.stringify({ sub: userId, family })}`;

      redisMock[`refresh:${userId}:${family}`] = { value: refreshToken };

      await service.logout(refreshToken);

      expect(redisMock[`refresh:${userId}:${family}`]).toBeUndefined();
    });

    it('should not throw for already-invalid token', async () => {
      await expect(service.logout('invalid.token')).resolves.not.toThrow();
    });
  });

  // ─── Register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create customer and return tokens when OTP is valid', async () => {
      const phone = '+919876543210';
      redisMock[`otp:${phone}`] = { value: '123456' };
      userRepo.findOne.mockResolvedValueOnce(null); // no existing user
      userRepo.create.mockReturnValue(makeUser());
      userRepo.save.mockResolvedValue(makeUser());
      userRepo.findOne.mockResolvedValueOnce(makeUser()); // reload after save
      dataSource.query
        .mockResolvedValueOnce([{ id: 'customer-role-id' }]) // customer role lookup
        .mockResolvedValueOnce([]); // permissions

      const result = await service.register({
        phone,
        firstName: 'John',
        otp: '123456',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      redisMock['otp:+919876543210'] = { value: '999999' };

      await expect(
        service.register({
          phone: '+919876543210',
          firstName: 'John',
          otp: '123456',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Forgot / Reset password ──────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should store reset token in Redis for existing user', async () => {
      const user = makeUser();
      userRepo.createQueryBuilder().getOne.mockResolvedValue(user);

      await service.forgotPassword('test@example.com');

      const resetKeys = Object.keys(redisMock).filter((k) => k.startsWith('reset:'));
      expect(resetKeys.length).toBeGreaterThan(0);
    });

    it('should not throw for non-existent user (security)', async () => {
      userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
      await expect(service.forgotPassword('nobody@example.com')).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should update password and invalidate sessions', async () => {
      const userId = 'user-uuid-1';
      const token = 'valid-reset-token';
      redisMock[`reset:${token}`] = { value: userId };
      redisMock[`refresh:${userId}:family1`] = { value: 'some-token' };
      userRepo.update.mockResolvedValue({});

      await service.resetPassword(token, 'newPassword123');

      expect(userRepo.update).toHaveBeenCalledWith(userId, expect.objectContaining({ passwordHash: expect.any(String) }));
      expect(redisMock[`reset:${token}`]).toBeUndefined();
      expect(redisMock[`refresh:${userId}:family1`]).toBeUndefined();
    });

    it('should throw BadRequestException for invalid token', async () => {
      await expect(service.resetPassword('bad-token', 'newPassword123')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Property-based test: JWT payload always contains required fields ──────

  /**
   * Property: For any valid user, the issued JWT access token payload
   * always contains sub, email, role, permissions, and branchId.
   *
   * Validates: Requirements 1.7
   */
  describe('JWT payload structure (property-based)', () => {
    it('should always contain sub, role, permissions, branchId in JWT payload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress(),
            roleName: fc.constantFrom('shop_owner', 'store_manager', 'shop_sales', 'customer'),
            branchId: fc.oneof(fc.uuid(), fc.constant(null)),
            permCount: fc.integer({ min: 0, max: 5 }),
          }),
          async ({ id, email, roleName, branchId, permCount }: {
            id: string;
            email: string;
            roleName: string;
            branchId: string | null;
            permCount: number;
          }) => {
            const user = makeUser({
              id,
              email,
              branchId: branchId ?? undefined,
              role: { id: 'role-id', name: roleName, description: '', isSystem: true, createdAt: new Date() },
              roleId: 'role-id',
            });

            // Mock permissions
            const perms = Array.from({ length: permCount }, (_, i) => ({
              module: 'inventory',
              action: `action${i}`,
            }));
            dataSource.query.mockResolvedValue(perms);
            userRepo.update.mockResolvedValue({});
            userRepo.createQueryBuilder().getOne.mockResolvedValue(user);

            // Capture what jwtService.sign is called with
            const signCalls: any[] = [];
            (jwtService.sign as ReturnType<typeof jest.fn>).mockImplementation((payload: any) => {
              signCalls.push(payload);
              return `fake.jwt.${JSON.stringify(payload)}`;
            });

            await service.login({ identifier: email, password: 'password123' });

            // The first sign call is for the access token
            const accessPayload = signCalls[0];
            expect(accessPayload).toHaveProperty('sub');
            expect(accessPayload).toHaveProperty('email');
            expect(accessPayload).toHaveProperty('role');
            expect(accessPayload).toHaveProperty('permissions');
            expect(accessPayload).toHaveProperty('branchId');
            expect(Array.isArray(accessPayload.permissions)).toBe(true);
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});
