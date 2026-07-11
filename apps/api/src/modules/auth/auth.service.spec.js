import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ForbiddenException, UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RedisService } from '../../common/redis/redis.service';
import { TwilioVerifyService } from './services/twilio-verify.service';
import { NotificationService } from '../notification/notification.service';
// ─── Redis mock (in-memory store) ────────────────────────────────────────────
const redisMock = {};
function makeRedisServiceMock() {
    const get = jest.fn(async (key) => redisMock[key] ?? null);
    const set = jest.fn(async (key, value, opts) => {
        redisMock[key] = value;
    });
    const del = jest.fn(async (key) => {
        const keys = Array.isArray(key) ? key : [key];
        keys.forEach((k) => delete redisMock[k]);
    });
    const incr = jest.fn(async (key) => {
        const cur = parseInt(redisMock[key] ?? '0', 10);
        const next = cur + 1;
        redisMock[key] = String(next);
        return next;
    });
    const exists = jest.fn(async (key) => key in redisMock);
    const expire = jest.fn(async (_key, _seconds) => { });
    const keys = jest.fn(async (pattern) => {
        const prefix = pattern.replace('*', '');
        return Object.keys(redisMock).filter((k) => k.startsWith(prefix));
    });
    return {
        get,
        set,
        del,
        incr,
        exists,
        expire,
        keys,
        setRefreshToken: jest.fn(async (userId, family, token, ttlSeconds) => {
            await set(`refresh:${userId}:${family}`, token, { EX: ttlSeconds });
        }),
        getRefreshToken: jest.fn(async (userId, family) => get(`refresh:${userId}:${family}`)),
        delRefreshToken: jest.fn(async (userId, family) => del(`refresh:${userId}:${family}`)),
        invalidateAllRefreshTokens: jest.fn(async (userId) => {
            const pattern = `refresh:${userId}:*`;
            const found = await keys(pattern);
            if (found.length > 0)
                await del(found);
        }),
        isLockedOut: jest.fn(async (identifier) => exists(`login:lockout:${identifier}`)),
        incrementLoginAttempts: jest.fn(async (identifier, lockoutTtlSeconds) => {
            const attKey = `login:attempts:${identifier}`;
            const attempts = await incr(attKey);
            if (attempts === 1)
                await expire(attKey, lockoutTtlSeconds);
            return attempts;
        }),
        setLockout: jest.fn(async (identifier, ttlSeconds) => {
            await set(`login:lockout:${identifier}`, '1', { EX: ttlSeconds });
            await del(`login:attempts:${identifier}`);
        }),
        clearLoginAttempts: jest.fn(async (identifier) => {
            await del([`login:attempts:${identifier}`, `login:lockout:${identifier}`]);
        }),
        setOtp: jest.fn(async (phone, otp, ttlSeconds) => {
            await set(`otp:${phone}`, otp, { EX: ttlSeconds });
        }),
        getOtp: jest.fn(async (phone) => get(`otp:${phone}`)),
        delOtp: jest.fn(async (phone) => del(`otp:${phone}`)),
        setResetToken: jest.fn(async (token, userId, ttlSeconds) => {
            await set(`reset:${token}`, userId, { EX: ttlSeconds });
        }),
        getResetToken: jest.fn(async (token) => get(`reset:${token}`)),
        delResetToken: jest.fn(async (token) => del(`reset:${token}`)),
        getForgotPasswordCooldown: jest.fn(async (identifier) => {
            const key = `forgot:cooldown:${identifier}`;
            return key in redisMock ? 30 : 0;
        }),
        setForgotPasswordCooldown: jest.fn(async (identifier, cooldownSeconds) => {
            const key = `forgot:cooldown:${identifier}`;
            if (!(key in redisMock)) {
                redisMock[key] = '1';
            }
        }),
    };
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeUser(overrides = {}) {
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
    let service;
    let userRepo;
    let jwtService;
    let dataSource;
    let module;
    let notifServiceMock;
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
            query: jest.fn().mockResolvedValue([{ module: 'inventory', action: 'view' }]),
        };
        module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: userRepo },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn((payload, opts) => {
                            return `fake.jwt.${JSON.stringify(payload)}`;
                        }),
                        verify: jest.fn((token, opts) => {
                            const parts = token.split('fake.jwt.');
                            if (parts.length < 2)
                                throw new Error('invalid');
                            return JSON.parse(parts[1]);
                        }),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            const map = {
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
                { provide: RedisService, useValue: makeRedisServiceMock() },
                {
                    provide: TwilioVerifyService,
                    useValue: {
                        sendOtp: jest.fn(async () => ({ success: true, status: 'dev-mode' })),
                        verifyOtp: jest.fn(async (_phone, code) => {
                            // Accept '123456' as valid, reject everything else
                            if (code === '123456')
                                return { success: true, status: 'approved' };
                            return { success: false, status: 'pending', error: 'Invalid code' };
                        }),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendEmail: jest.fn(async (payload) => ({ id: 'notif-1', ...payload })),
                        sendSms: jest.fn(async (payload) => ({ id: 'notif-2', ...payload })),
                    },
                },
            ],
        }).compile();
        service = module.get(AuthService);
        jwtService = module.get(JwtService);
        // Store typed notification mock for use in nested describe blocks
        notifServiceMock = module.get(NotificationService);
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
            await expect(service.login({ identifier: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException for non-existent user', async () => {
            userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            await expect(service.login({ identifier: 'nobody@example.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
        });
        it('should throw ForbiddenException when account is locked', async () => {
            redisMock['login:lockout:test@example.com'] = '1';
            await expect(service.login({ identifier: 'test@example.com', password: 'password123' })).rejects.toThrow(ForbiddenException);
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            const user = makeUser({ isActive: false });
            userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
            await expect(service.login({ identifier: 'test@example.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
        });
    });
    // ─── Account lockout ──────────────────────────────────────────────────────
    describe('account lockout', () => {
        it('should lock account after 5 failed attempts', async () => {
            userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            for (let i = 0; i < 5; i++) {
                await service.login({ identifier: 'bad@example.com', password: 'wrong' }).catch(() => { });
            }
            const locked = await service.isLockedOut('bad@example.com');
            expect(locked).toBe(true);
        });
        it('should clear failed attempts on successful login', async () => {
            const user = makeUser();
            userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
            userRepo.update.mockResolvedValue({});
            dataSource.query.mockResolvedValue([]);
            redisMock['login:attempts:test@example.com'] = '3';
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
            redisMock[`refresh:${user.id}:${family}`] = refreshToken;
            userRepo.findOne.mockResolvedValue(user);
            dataSource.query.mockResolvedValue([]);
            const result = await service.refresh(refreshToken);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(redisMock[`refresh:${user.id}:${family}`]).toBeUndefined();
        });
        it('should invalidate all sessions when already-used token is submitted', async () => {
            const userId = 'user-uuid-1';
            const family = 'used-family';
            const refreshToken = `fake.jwt.${JSON.stringify({ sub: userId, family })}`;
            redisMock[`refresh:${userId}:other-family`] = 'some-token';
            await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
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
            redisMock[`refresh:${userId}:${family}`] = refreshToken;
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
            redisMock[`otp:${phone}`] = '123456';
            userRepo.findOne.mockResolvedValueOnce(null);
            userRepo.create.mockReturnValue(makeUser());
            userRepo.save.mockResolvedValue(makeUser());
            userRepo.findOne.mockResolvedValueOnce(makeUser());
            dataSource.query
                .mockResolvedValueOnce([{ id: 'customer-role-id' }])
                .mockResolvedValueOnce([]);
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
            await expect(service.register({
                phone: '+919876543210',
                firstName: 'John',
                otp: '000000',
                password: 'password123',
            })).rejects.toThrow(BadRequestException);
        });
    });
    // ─── 3.6 Forgot / Reset password ──────────────────────────────────────────
    describe('forgotPassword', () => {
        let user;
        beforeEach(() => {
            user = makeUser();
            userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
        });
        // ── Token storage ───────────────────────────────────────────────────────
        it('should store a reset token in Redis linked to the user ID', async () => {
            await service.forgotPassword('test@example.com');
            const resetKeys = Object.keys(redisMock).filter((k) => k.startsWith('reset:'));
            expect(resetKeys.length).toBe(1);
            const storedUserId = redisMock[resetKeys[0]];
            expect(storedUserId).toBe(user.id);
        });
        it('should set the reset token with a TTL of 1 hour (3600 seconds)', async () => {
            const redisService = module.get(RedisService);
            const setResetTokenSpy = jest.spyOn(redisService, 'setResetToken');
            await service.forgotPassword('test@example.com');
            const ttlArg = setResetTokenSpy.mock.calls[0]?.[2];
            expect(ttlArg).toBe(3600); // 1 hour in seconds
        });
        it('should not store any reset token for non-existent user (security, no info leak)', async () => {
            userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            await service.forgotPassword('nobody@example.com');
            const resetKeys = Object.keys(redisMock).filter((k) => k.startsWith('reset:'));
            expect(resetKeys).toHaveLength(0);
        });
        it('should not throw when user does not exist (no info leak)', async () => {
            userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            await expect(service.forgotPassword('nobody@example.com')).resolves.not.toThrow();
        });
        it('should search by email OR phone', async () => {
            await service.forgotPassword('test@example.com');
            expect(userRepo.createQueryBuilder().getOne).toHaveBeenCalled();
            const qb = userRepo.createQueryBuilder();
            expect(qb.where).toHaveBeenCalledWith('u.email = :id OR u.phone = :id', { id: 'test@example.com' });
        });
        // ── Email notifications ────────────────────────────────────────────────
        it('should send a password_reset email when user has an email address', async () => {
            await service.forgotPassword('test@example.com');
            expect(notifServiceMock.sendEmail).toHaveBeenCalledTimes(1);
            const callArg = notifServiceMock.sendEmail.mock.calls[0][0];
            expect(callArg.to).toBe('test@example.com');
            expect(callArg.type).toBe('password_reset');
            expect(callArg.templateKey).toBe('password_reset');
            expect(callArg.userId).toBe(user.id);
            expect(callArg.templateVars).toHaveProperty('name');
            expect(callArg.templateVars).toHaveProperty('resetUrl');
            expect(callArg.templateVars.resetUrl).toContain('/reset-password?token=');
        });
        it('should include the reset token in the email reset URL', async () => {
            await service.forgotPassword('test@example.com');
            const callArg = notifServiceMock.sendEmail.mock.calls[0][0];
            const resetUrl = callArg.templateVars.resetUrl;
            const tokenMatch = resetUrl.match(/token=([a-f0-9-]+)/);
            expect(tokenMatch).not.toBeNull();
            const tokenFromUrl = tokenMatch[1];
            expect(redisMock[`reset:${tokenFromUrl}`]).toBe(user.id);
        });
        it('should use the configured web URL for the reset link', async () => {
            const configService = module.get(ConfigService);
            configService.get.mockImplementation((key) => {
                const map = {
                    'app.jwtSecret': 'test-secret',
                    'app.jwtExpiry': '15m',
                    'app.refreshTokenSecret': 'test-refresh-secret',
                    'app.refreshTokenExpiry': '7d',
                    'app.webUrl': 'https://dreamgadgets.in',
                    'redis.url': 'redis://localhost:6379',
                    'app.env': 'test',
                };
                return map[key];
            });
            await service.forgotPassword('test@example.com');
            const callArg = notifServiceMock.sendEmail.mock.calls[0][0];
            expect(callArg.templateVars.resetUrl).toMatch(/^https:\/\/dreamgadgets\.in\/reset-password\?token=/);
        });
        it("should include the user's first name in the email template vars", async () => {
            user.firstName = 'John';
            await service.forgotPassword('test@example.com');
            const callArg = notifServiceMock.sendEmail.mock.calls[0][0];
            expect(callArg.templateVars.name).toBe('John');
        });
        it('should fall back to "User" when the user has no first name', async () => {
            user.firstName = undefined;
            await service.forgotPassword('test@example.com');
            const callArg = notifServiceMock.sendEmail.mock.calls[0][0];
            expect(callArg.templateVars.name).toBe('User');
        });
        it('should not send email when user has no email address', async () => {
            user.email = undefined;
            await service.forgotPassword('test@example.com');
            expect(notifServiceMock.sendEmail).not.toHaveBeenCalled();
        });
        // ── SMS notifications ──────────────────────────────────────────────────
        it('should send a password_reset SMS when user has a phone number', async () => {
            await service.forgotPassword('test@example.com');
            expect(notifServiceMock.sendSms).toHaveBeenCalledTimes(1);
            const callArg = notifServiceMock.sendSms.mock.calls[0][0];
            expect(callArg.to).toBe('+919876543210');
            expect(callArg.type).toBe('password_reset');
            expect(callArg.templateKey).toBe('password_reset');
            expect(callArg.templateVars).toHaveProperty('resetUrl');
        });
        it('should not send SMS when user has no phone number', async () => {
            user.phone = undefined;
            await service.forgotPassword('test@example.com');
            expect(notifServiceMock.sendSms).not.toHaveBeenCalled();
        });
        // ── Rate limiting ─────────────────────────────────────────────────────
        it('should throw HttpException(429) when rate-limited (cooldown active)', async () => {
            // Simulate active cooldown by setting the cooldown key in Redis
            redisMock['forgot:cooldown:test@example.com'] = '1';
            await expect(service.forgotPassword('test@example.com')).rejects.toThrow(HttpException);
            // The response should include retryAfter
            try {
                await service.forgotPassword('test@example.com');
            }
            catch (err) {
                expect(err.response?.retryAfter).toBeGreaterThan(0);
                expect(err.status).toBe(429);
            }
        });
        it('should set cooldown for non-existent user to prevent enumeration', async () => {
            userRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            await service.forgotPassword('nobody@example.com');
            // Cooldown key should be set even for non-existent users
            expect(redisMock['forgot:cooldown:nobody@example.com']).toBe('1');
        });
        it('should set cooldown after successful forgot-password request', async () => {
            await service.forgotPassword('test@example.com');
            expect(redisMock['forgot:cooldown:test@example.com']).toBe('1');
        });
        it('should allow request after cooldown expires', async () => {
            // First request succeeds
            await service.forgotPassword('test@example.com');
            // Clear the cooldown (simulate time passing)
            delete redisMock['forgot:cooldown:test@example.com'];
            // Reset the getForgotPasswordCooldown mock to return 0
            const redisService = module.get(RedisService);
            redisService.getForgotPasswordCooldown.mockResolvedValueOnce(0);
            // Second request should succeed
            await expect(service.forgotPassword('test@example.com')).resolves.not.toThrow();
        });
        // ── Resilience ─────────────────────────────────────────────────────────
        it('should not fail when notification service throws (fire-and-forget)', async () => {
            notifServiceMock.sendEmail.mockRejectedValueOnce(new Error('Email service down'));
            notifServiceMock.sendSms.mockRejectedValueOnce(new Error('SMS service down'));
            await expect(service.forgotPassword('test@example.com')).resolves.not.toThrow();
            const resetKeys = Object.keys(redisMock).filter((k) => k.startsWith('reset:'));
            expect(resetKeys).toHaveLength(1);
        });
        it('should still store token even when notification fails', async () => {
            notifServiceMock.sendEmail.mockRejectedValueOnce(new Error('Down'));
            await service.forgotPassword('test@example.com');
            const resetKeys = Object.keys(redisMock).filter((k) => k.startsWith('reset:'));
            expect(resetKeys).toHaveLength(1);
            expect(redisMock[resetKeys[0]]).toBe(user.id);
        });
    });
    describe('resetPassword', () => {
        const userId = 'user-uuid-1';
        const token = 'valid-reset-token-uuid';
        beforeEach(() => {
            redisMock[`reset:${token}`] = userId;
            redisMock[`refresh:${userId}:family1`] = 'some-refresh-token';
            redisMock[`refresh:${userId}:family2`] = 'another-refresh-token';
            userRepo.update.mockResolvedValue({});
        });
        // ── Success path ───────────────────────────────────────────────────────
        it('should update the user record with a bcrypt-hashed password', async () => {
            await service.resetPassword(token, 'NewP@ssword456');
            expect(userRepo.update).toHaveBeenCalledWith(userId, expect.objectContaining({
                passwordHash: expect.any(String),
            }));
            // Verify the stored hash is actually a bcrypt hash (starts with $2b$)
            const updateArg = userRepo.update.mock.calls[0][1];
            const isBcryptHash = updateArg.passwordHash.startsWith('$2b$');
            expect(isBcryptHash).toBe(true);
        });
        it('should hash the password with bcrypt cost factor 12', async () => {
            // We verify the bcrypt cost by checking that the hash starts with $2b$12$
            // (cost factor 12 is embedded in the bcrypt hash prefix)
            await service.resetPassword(token, 'MyNewP@ss123');
            const updateArg = userRepo.update.mock.calls[0][1];
            const hashPrefix = updateArg.passwordHash.substring(0, 6);
            expect(hashPrefix).toBe('$2b$12');
        });
        it('should invalidate all existing refresh token families', async () => {
            await service.resetPassword(token, 'NewP@ssword456');
            expect(redisMock[`refresh:${userId}:family1`]).toBeUndefined();
            expect(redisMock[`refresh:${userId}:family2`]).toBeUndefined();
        });
        it('should delete the reset token after successful use (single-use)', async () => {
            await service.resetPassword(token, 'NewP@ssword456');
            expect(redisMock[`reset:${token}`]).toBeUndefined();
        });
        it('should prevent the same token from being used twice', async () => {
            await service.resetPassword(token, 'NewP@ssword456');
            await expect(service.resetPassword(token, 'AnotherP@ss789')).rejects.toThrow(BadRequestException);
        });
        // ── Error handling ────────────────────────────────────────────────────
        it('should throw BadRequestException for an invalid token', async () => {
            await expect(service.resetPassword('nonexistent-token', 'NewP@ssword456')).rejects.toThrow(BadRequestException);
        });
        it('should throw BadRequestException for an expired token (deleted from Redis)', async () => {
            delete redisMock[`reset:${token}`];
            await expect(service.resetPassword(token, 'NewP@ssword456')).rejects.toThrow(BadRequestException);
        });
        it('should not call userRepo.update when the token is invalid', async () => {
            await expect(service.resetPassword('bad-token', 'NewP@ssword456')).rejects.toThrow(BadRequestException);
            expect(userRepo.update).not.toHaveBeenCalled();
        });
        it('should not invalidate sessions when the token is invalid', async () => {
            const before = Object.keys(redisMock).filter((k) => k.startsWith(`refresh:${userId}:`));
            await expect(service.resetPassword('bad-token', 'NewP@ssword456')).rejects.toThrow(BadRequestException);
            const after = Object.keys(redisMock).filter((k) => k.startsWith(`refresh:${userId}:`));
            expect(after.sort()).toEqual(before.sort());
        });
        // ── Password constraints ───────────────────────────────────────────────
        it('should accept passwords with minimum 8 characters', async () => {
            await expect(service.resetPassword(token, 'Abcd1234')).resolves.not.toThrow();
        });
        it('should handle special characters in the new password', async () => {
            await expect(service.resetPassword(token, 'P@$$w0rd!#123')).resolves.not.toThrow();
            const updateArg = userRepo.update.mock.calls[0][1];
            expect(updateArg.passwordHash).toMatch(/^\$2b\$/);
        });
    });
    // ─── Property-based test: JWT payload always contains required fields ──────
    describe('JWT payload structure (property-based)', () => {
        it('should always contain sub, role, permissions, branchId in JWT payload', async () => {
            await fc.assert(fc.asyncProperty(fc.record({
                id: fc.uuid(),
                email: fc.emailAddress(),
                roleName: fc.constantFrom('shop_owner', 'store_manager', 'shop_sales', 'customer'),
                branchId: fc.oneof(fc.uuid(), fc.constant(null)),
                permCount: fc.integer({ min: 0, max: 5 }),
            }), async ({ id, email, roleName, branchId, permCount }) => {
                const user = makeUser({
                    id,
                    email,
                    branchId: branchId ?? undefined,
                    role: { id: 'role-id', name: roleName, description: '', isSystem: true, createdAt: new Date() },
                    roleId: 'role-id',
                });
                const perms = Array.from({ length: permCount }, (_, i) => ({
                    module: 'inventory',
                    action: `action${i}`,
                }));
                dataSource.query.mockResolvedValue(perms);
                userRepo.update.mockResolvedValue({});
                userRepo.createQueryBuilder().getOne.mockResolvedValue(user);
                const signCalls = [];
                jwtService.sign.mockImplementation((payload) => {
                    signCalls.push(payload);
                    return `fake.jwt.${JSON.stringify(payload)}`;
                });
                await service.login({ identifier: email, password: 'password123' });
                const accessPayload = signCalls[0];
                expect(accessPayload).toHaveProperty('sub');
                expect(accessPayload).toHaveProperty('email');
                expect(accessPayload).toHaveProperty('role');
                expect(accessPayload).toHaveProperty('permissions');
                expect(accessPayload).toHaveProperty('branchId');
                expect(Array.isArray(accessPayload.permissions)).toBe(true);
            }), { numRuns: 20 });
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map