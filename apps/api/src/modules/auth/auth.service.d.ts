import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/reset-password.dto';
import { RedisService } from '../../common/redis/redis.service';
import { TwilioVerifyService } from './services/twilio-verify.service';
import { NotificationService } from '../notification/notification.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private dataSource;
    private redisService;
    private twilioVerifyService;
    private notificationService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, dataSource: DataSource, redisService: RedisService, twilioVerifyService: TwilioVerifyService, notificationService: NotificationService);
    /**
     * Fetches permissions for a role, with Redis caching.
     * Cache is invalidated whenever role permissions are updated (admin action).
     * TTL: 15 minutes — permissions rarely change, so this dramatically reduces
     * DB load on every login and token refresh.
     */
    private getUserPermissions;
    /**
     * Invalidates the permission cache for a role.
     * Call this when role permissions are updated in the admin panel.
     */
    invalidatePermissionCache(roleId: string): Promise<void>;
    private buildTokens;
    isLockedOut(identifier: string): Promise<boolean>;
    incrementFailedAttempts(identifier: string): Promise<void>;
    clearFailedAttempts(identifier: string): Promise<void>;
    validateUser(identifier: string, password: string): Promise<User | null>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Partial<User>;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private invalidateAllFamilies;
    logout(refreshToken: string): Promise<void>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    sendOtp(phone: string): Promise<void>;
    forgotPassword(identifier: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    getProfile(userId: string): Promise<Partial<User>>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<User>>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    invalidateUserSessions(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map