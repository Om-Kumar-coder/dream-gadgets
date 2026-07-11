import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
export declare class RedisService implements OnModuleDestroy {
    private configService;
    private readonly logger;
    private clientPromise;
    private client;
    constructor(configService: ConfigService);
    /**
     * Lazily initialise and return the singleton Redis client.
     * All callers share the same underlying connection.
     * Uses a cached promise to ensure exactly one connection attempt.
     */
    getClient(): Promise<ReturnType<typeof createClient>>;
    private connect;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: {
        EX?: number;
    }): Promise<void>;
    del(key: string | string[]): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, seconds: number): Promise<void>;
    incr(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    setRefreshToken(userId: string, family: string, token: string, ttlSeconds: number): Promise<void>;
    getRefreshToken(userId: string, family: string): Promise<string | null>;
    delRefreshToken(userId: string, family: string): Promise<void>;
    invalidateAllRefreshTokens(userId: string): Promise<void>;
    getLoginAttempts(identifier: string): Promise<number>;
    incrementLoginAttempts(identifier: string, lockoutTtlSeconds: number): Promise<number>;
    isLockedOut(identifier: string): Promise<boolean>;
    setLockout(identifier: string, ttlSeconds: number): Promise<void>;
    clearLoginAttempts(identifier: string): Promise<void>;
    setResetToken(token: string, userId: string, ttlSeconds: number): Promise<void>;
    getResetToken(token: string): Promise<string | null>;
    delResetToken(token: string): Promise<void>;
    /**
     * Checks if the given identifier is currently rate-limited for forgot-password.
     * Returns the number of seconds remaining in the cooldown, or 0 if not limited.
     */
    getForgotPasswordCooldown(identifier: string): Promise<number>;
    /**
     * Records a forgot-password request for the given identifier and sets a cooldown.
     * Only sets TTL on the first request (when the key doesn't exist yet) so subsequent
     * requests within the cooldown window don't extend it.
     */
    setForgotPasswordCooldown(identifier: string, cooldownSeconds: number): Promise<void>;
    getNextInvoiceSequence(branchId: string, year: number): Promise<number>;
    posLockItem(itemId: string, ttlSeconds: number): Promise<void>;
    posUnlockItem(itemId: string): Promise<void>;
    isPosLocked(itemId: string): Promise<boolean>;
    setWebhookIdempotency(webhookId: string, ttlSeconds: number): Promise<void>;
    isWebhookProcessed(webhookId: string): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=redis.service.d.ts.map