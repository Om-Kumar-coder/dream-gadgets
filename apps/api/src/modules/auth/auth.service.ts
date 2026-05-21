import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { JwtPayload } from '@dream-gadgets/shared-types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/reset-password.dto';

// Redis key helpers
const REFRESH_KEY = (userId: string, family: string) => `refresh:${userId}:${family}`;
const ATTEMPTS_KEY = (identifier: string) => `login:attempts:${identifier}`;
const LOCKOUT_KEY = (identifier: string) => `login:lockout:${identifier}`;
const RESET_KEY = (token: string) => `reset:${token}`;
const OTP_KEY = (phone: string) => `otp:${phone}`;

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const RESET_TTL_SECONDS = 60 * 60; // 1 hour
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

@Injectable()
export class AuthService {
  private redisClient: any;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  // Lazily get the Redis client from the cache manager connection
  private async getRedis(): Promise<any> {
    if (!this.redisClient) {
      const { createClient } = await import('redis');
      const client = createClient({ url: this.configService.get<string>('redis.url') });
      await client.connect();
      this.redisClient = client;
    }
    return this.redisClient;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getUserPermissions(roleId: string): Promise<string[]> {
    if (!roleId) return [];
    const rows = await this.dataSource.query(
      `SELECT p.module, p.action
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1`,
      [roleId],
    );
    return rows.map((r: any) => `${r.module}.${r.action}`);
  }

  private async buildTokens(user: User): Promise<{ accessToken: string; refreshToken: string; family: string }> {
    const permissions = await this.getUserPermissions(user.roleId);
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email ?? '',
      role: user.role?.name ?? '',
      permissions,
      branchId: user.branchId ?? null,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.jwtSecret'),
      expiresIn: this.configService.get<string>('app.jwtExpiry') ?? '15m',
    });

    const family = uuidv4();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, family },
      {
        secret: this.configService.get<string>('app.refreshTokenSecret'),
        expiresIn: this.configService.get<string>('app.refreshTokenExpiry') ?? '7d',
      },
    );

    const redis = await this.getRedis();
    await redis.set(REFRESH_KEY(user.id, family), refreshToken, { EX: REFRESH_TTL_SECONDS });

    return { accessToken, refreshToken, family };
  }

  // ─── Account lockout ────────────────────────────────────────────────────────

  async isLockedOut(identifier: string): Promise<boolean> {
    const redis = await this.getRedis();
    const locked = await redis.get(LOCKOUT_KEY(identifier));
    return !!locked;
  }

  async incrementFailedAttempts(identifier: string): Promise<void> {
    const redis = await this.getRedis();
    const key = ATTEMPTS_KEY(identifier);
    const attempts = await redis.incr(key);
    // Set TTL on first attempt
    if (attempts === 1) {
      await redis.expire(key, LOCKOUT_TTL_SECONDS);
    }
    if (attempts >= LOCKOUT_THRESHOLD) {
      await redis.set(LOCKOUT_KEY(identifier), '1', { EX: LOCKOUT_TTL_SECONDS });
      await redis.del(key);
    }
  }

  async clearFailedAttempts(identifier: string): Promise<void> {
    const redis = await this.getRedis();
    await redis.del(ATTEMPTS_KEY(identifier));
    await redis.del(LOCKOUT_KEY(identifier));
  }

  // ─── Validate user (used by LocalStrategy) ──────────────────────────────────

  async validateUser(identifier: string, password: string): Promise<User | null> {
    const isLocked = await this.isLockedOut(identifier);
    if (isLocked) {
      throw new ForbiddenException('Account is locked. Try again in 15 minutes.');
    }

    const user = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('u.email = :id OR u.phone = :id', { id: identifier })
      .getOne();

    if (!user || !user.isActive) {
      await this.incrementFailedAttempts(identifier);
      return null;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.incrementFailedAttempts(identifier);
      return null;
    }

    await this.clearFailedAttempts(identifier);
    return user;
  }

  // ─── 3.2 Login ──────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const user = await this.validateUser(dto.identifier, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const { accessToken, refreshToken } = await this.buildTokens(user);

    // Return user profile (without sensitive fields)
    const { passwordHash, ...userProfile } = user;
    return { accessToken, refreshToken, user: userProfile };
  }

  // ─── 3.3 Refresh ────────────────────────────────────────────────────────────

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; family: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('app.refreshTokenSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sub: userId, family } = payload;
    const redis = await this.getRedis();
    const stored = await redis.get(REFRESH_KEY(userId, family));

    if (!stored) {
      // Token family already used or invalidated — invalidate entire family
      await this.invalidateAllFamilies(userId);
      throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
    }

    if (stored !== refreshToken) {
      // Token was rotated but old one submitted — invalidate family
      await redis.del(REFRESH_KEY(userId, family));
      await this.invalidateAllFamilies(userId);
      throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
    }

    // Invalidate old token
    await redis.del(REFRESH_KEY(userId, family));

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.buildTokens(user);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  private async invalidateAllFamilies(userId: string): Promise<void> {
    const redis = await this.getRedis();
    const pattern = `refresh:${userId}:*`;
    const keys: string[] = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  // ─── 3.4 Logout ─────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    let payload: { sub: string; family: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('app.refreshTokenSecret'),
      });
    } catch {
      // Token already invalid — nothing to do
      return;
    }
    const redis = await this.getRedis();
    await redis.del(REFRESH_KEY(payload.sub, payload.family));
  }

  // ─── 3.5 Register (customer) ────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // Verify OTP
    const redis = await this.getRedis();
    const storedOtp = await redis.get(OTP_KEY(dto.phone));
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    await redis.del(OTP_KEY(dto.phone));

    // Check duplicate phone
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new BadRequestException('Phone number already registered');
    }

    // Get customer role
    const customerRole = await this.dataSource.query(
      `SELECT id FROM roles WHERE name = 'customer' LIMIT 1`,
    );

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      phone: dto.phone,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      roleId: customerRole[0]?.id ?? null,
      isActive: true,
    });
    await this.userRepository.save(user);

    // Reload with role
    const saved = await this.userRepository.findOne({ where: { id: user.id }, relations: ['role'] });
    const { accessToken, refreshToken } = await this.buildTokens(saved!);
    const { passwordHash: _ph, ...userProfile } = saved!;
    return { accessToken, refreshToken, user: userProfile };
  }

  // ─── 3.5 Send OTP (helper for registration) ─────────────────────────────────

  async sendOtp(phone: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redis = await this.getRedis();
    await redis.set(OTP_KEY(phone), otp, { EX: OTP_TTL_SECONDS });
    // In production: enqueue SMS notification job
    // For now, log it (dev only)
    if (this.configService.get<string>('app.env') === 'development') {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }
  }

  // ─── 3.6 Forgot / Reset password ────────────────────────────────────────────

  async forgotPassword(identifier: string): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.email = :id OR u.phone = :id', { id: identifier })
      .getOne();

    if (!user) {
      // Don't reveal whether user exists
      return;
    }

    const token = uuidv4();
    const redis = await this.getRedis();
    await redis.set(RESET_KEY(token), user.id, { EX: RESET_TTL_SECONDS });

    // In production: enqueue email/SMS notification with reset link
    if (this.configService.get<string>('app.env') === 'development') {
      console.log(`[DEV] Password reset token for ${identifier}: ${token}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const redis = await this.getRedis();
    const userId = await redis.get(RESET_KEY(token));
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });

    // Invalidate all sessions
    await this.invalidateAllFamilies(userId);
    await redis.del(RESET_KEY(token));
  }

  // ─── 3.7 Get / Update profile ───────────────────────────────────────────────

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'branch'],
    });
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<User>> {
    const updateData: Record<string, any> = {};

    if (dto.firstName) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.email) {
      // Check email is not taken by another user
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException({
          code: 'EMAIL_TAKEN',
          message: 'This email is already in use by another account',
        });
      }
      updateData.email = dto.email;
    }

    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(userId, updateData);
    }

    return this.getProfile(userId);
  }

  // ─── Change password (requires current password verification) ────────────────

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException({
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect',
      });
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });

    // Invalidate all sessions except current one
    // For security, user will need to log in again
    await this.invalidateAllFamilies(userId);
  }

  // ─── Invalidate all sessions for a user (used by admin deactivation) ────────

  async invalidateUserSessions(userId: string): Promise<void> {
    await this.invalidateAllFamilies(userId);
  }
}
