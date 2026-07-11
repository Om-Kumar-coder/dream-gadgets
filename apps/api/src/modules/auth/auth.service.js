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
import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const RESET_TTL_SECONDS = 60 * 60; // 1 hour
const FORGOT_PASSWORD_COOLDOWN_SECONDS = 60; // 60 seconds between reset requests per identifier
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(userRepository, jwtService, configService, dataSource, redisService, twilioVerifyService, notificationService) {
            this.userRepository = userRepository;
            this.jwtService = jwtService;
            this.configService = configService;
            this.dataSource = dataSource;
            this.redisService = redisService;
            this.twilioVerifyService = twilioVerifyService;
            this.notificationService = notificationService;
            this.logger = new Logger(AuthService.name);
        }
        // ─── Helpers ────────────────────────────────────────────────────────────────
        /**
         * Fetches permissions for a role, with Redis caching.
         * Cache is invalidated whenever role permissions are updated (admin action).
         * TTL: 15 minutes — permissions rarely change, so this dramatically reduces
         * DB load on every login and token refresh.
         */
        async getUserPermissions(roleId) {
            if (!roleId)
                return [];
            // Try cache first
            const cacheKey = `perms:role:${roleId}`;
            try {
                const cached = await this.redisService.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            catch {
                // Cache miss or error — fall through to DB query
            }
            // Fetch from DB
            const rows = await this.dataSource.query(`SELECT p.module, p.action
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1`, [roleId]);
            const permissions = rows.map((r) => `${r.module}.${r.action}`);
            // Cache for 15 minutes (permissions rarely change)
            try {
                await this.redisService.set(cacheKey, JSON.stringify(permissions), { EX: 900 });
            }
            catch {
                // Non-critical — cache is best-effort
            }
            return permissions;
        }
        /**
         * Invalidates the permission cache for a role.
         * Call this when role permissions are updated in the admin panel.
         */
        async invalidatePermissionCache(roleId) {
            try {
                await this.redisService.del(`perms:role:${roleId}`);
            }
            catch {
                // Non-critical
            }
        }
        async buildTokens(user) {
            const permissions = await this.getUserPermissions(user.roleId);
            const payload = {
                sub: user.id,
                email: user.email ?? '',
                role: user.role?.name ?? '',
                permissions,
                branchId: user.branchId ?? null,
            };
            const accessToken = this.jwtService.sign(payload, {
                secret: this.configService.get('app.jwtSecret'),
                expiresIn: this.configService.get('app.jwtExpiry') ?? '15m',
            });
            const family = uuidv4();
            const refreshToken = this.jwtService.sign({ sub: user.id, family }, {
                secret: this.configService.get('app.refreshTokenSecret'),
                expiresIn: this.configService.get('app.refreshTokenExpiry') ?? '7d',
            });
            await this.redisService.setRefreshToken(user.id, family, refreshToken, REFRESH_TTL_SECONDS);
            return { accessToken, refreshToken, family };
        }
        // ─── Account lockout ────────────────────────────────────────────────────────
        async isLockedOut(identifier) {
            return this.redisService.isLockedOut(identifier);
        }
        async incrementFailedAttempts(identifier) {
            const attempts = await this.redisService.incrementLoginAttempts(identifier, LOCKOUT_TTL_SECONDS);
            if (attempts >= LOCKOUT_THRESHOLD) {
                await this.redisService.setLockout(identifier, LOCKOUT_TTL_SECONDS);
            }
        }
        async clearFailedAttempts(identifier) {
            await this.redisService.clearLoginAttempts(identifier);
        }
        // ─── Validate user (used by LocalStrategy) ──────────────────────────────────
        async validateUser(identifier, password) {
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
        async login(dto) {
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
        async refresh(refreshToken) {
            let payload;
            try {
                payload = this.jwtService.verify(refreshToken, {
                    secret: this.configService.get('app.refreshTokenSecret'),
                });
            }
            catch {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }
            const { sub: userId, family } = payload;
            const stored = await this.redisService.getRefreshToken(userId, family);
            if (!stored) {
                // Token family already used or invalidated — invalidate entire family
                await this.invalidateAllFamilies(userId);
                throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
            }
            if (stored !== refreshToken) {
                // Token was rotated but old one submitted — invalidate family
                await this.redisService.delRefreshToken(userId, family);
                await this.invalidateAllFamilies(userId);
                throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
            }
            // Invalidate old token
            await this.redisService.delRefreshToken(userId, family);
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
        async invalidateAllFamilies(userId) {
            await this.redisService.invalidateAllRefreshTokens(userId);
        }
        // ─── 3.4 Logout ─────────────────────────────────────────────────────────────
        async logout(refreshToken) {
            let payload;
            try {
                payload = this.jwtService.verify(refreshToken, {
                    secret: this.configService.get('app.refreshTokenSecret'),
                });
            }
            catch {
                // Token already invalid — nothing to do
                return;
            }
            await this.redisService.delRefreshToken(payload.sub, payload.family);
        }
        // ─── 3.5 Register (customer) ────────────────────────────────────────────────
        async register(dto) {
            // Verify OTP via Twilio Verify
            const verifyResult = await this.twilioVerifyService.verifyOtp(dto.phone, dto.otp);
            if (!verifyResult.success) {
                throw new BadRequestException('Invalid or expired OTP');
            }
            // Check duplicate phone
            const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
            if (existing) {
                throw new BadRequestException('Phone number already registered');
            }
            // Get customer role
            const customerRole = await this.dataSource.query(`SELECT id FROM roles WHERE name = 'customer' LIMIT 1`);
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
            const { accessToken, refreshToken } = await this.buildTokens(saved);
            const { passwordHash: _ph, ...userProfile } = saved;
            return { accessToken, refreshToken, user: userProfile };
        }
        // ─── 3.5 Send OTP (helper for registration) ─────────────────────────────────
        async sendOtp(phone) {
            const result = await this.twilioVerifyService.sendOtp(phone);
            if (!result.success) {
                throw new BadRequestException(`Failed to send OTP: ${result.error}`);
            }
        }
        // ─── 3.6 Forgot / Reset password ────────────────────────────────────────────
        async forgotPassword(identifier) {
            // Check per-identifier rate limit (60-second cooldown)
            const cooldownRemaining = await this.redisService.getForgotPasswordCooldown(identifier);
            if (cooldownRemaining > 0) {
                throw new HttpException({
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please wait before requesting another reset link.',
                    retryAfter: cooldownRemaining,
                }, HttpStatus.TOO_MANY_REQUESTS);
            }
            const user = await this.userRepository
                .createQueryBuilder('u')
                .where('u.email = :id OR u.phone = :id', { id: identifier })
                .getOne();
            if (!user) {
                // Don't reveal whether user exists — but still set cooldown to prevent
                // identifier enumeration attacks
                await this.redisService.setForgotPasswordCooldown(identifier, FORGOT_PASSWORD_COOLDOWN_SECONDS);
                return;
            }
            const token = uuidv4();
            await this.redisService.setResetToken(token, user.id, RESET_TTL_SECONDS);
            // Set cooldown AFTER generating the token so the user doesn't get rate-limited
            // before actually receiving the reset link
            await this.redisService.setForgotPasswordCooldown(identifier, FORGOT_PASSWORD_COOLDOWN_SECONDS);
            // Build reset URL
            const webUrl = this.configService.get('app.webUrl') ?? 'http://localhost:3001';
            const resetUrl = `${webUrl}/reset-password?token=${token}`;
            const vars = {
                name: user.firstName ?? 'User',
                resetUrl,
            };
            // Send email if user has an email address
            if (user.email) {
                this.notificationService.sendEmail({
                    to: user.email,
                    userId: user.id,
                    type: 'password_reset',
                    templateKey: 'password_reset',
                    templateVars: vars,
                    metadata: { identifier },
                }).catch((err) => this.logger.warn(`[ForgotPassword] Failed to send email to ${user.email}: ${err?.message}`));
            }
            // Send SMS if user has a phone number
            if (user.phone) {
                this.notificationService.sendSms({
                    to: user.phone,
                    userId: user.id,
                    type: 'password_reset',
                    templateKey: 'password_reset',
                    templateVars: vars,
                    metadata: { identifier },
                }).catch((err) => this.logger.warn(`[ForgotPassword] Failed to send SMS to ${user.phone}: ${err?.message}`));
            }
        }
        async resetPassword(token, newPassword) {
            const userId = await this.redisService.getResetToken(token);
            if (!userId) {
                throw new BadRequestException('Invalid or expired reset token');
            }
            const passwordHash = await bcrypt.hash(newPassword, 12);
            await this.userRepository.update(userId, { passwordHash });
            // Invalidate all sessions
            await this.invalidateAllFamilies(userId);
            await this.redisService.delResetToken(token);
        }
        // ─── 3.7 Get / Update profile ───────────────────────────────────────────────
        async getProfile(userId) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['role', 'branch'],
            });
            if (!user)
                throw new NotFoundException('User not found');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash, ...profile } = user;
            return profile;
        }
        async updateProfile(userId, dto) {
            const updateData = {};
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
        async changePassword(userId, dto) {
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
        async invalidateUserSessions(userId) {
            await this.invalidateAllFamilies(userId);
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
export { AuthService };
//# sourceMappingURL=auth.service.js.map