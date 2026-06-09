import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private clientPromise: Promise<ReturnType<typeof createClient>> | null = null;
  private client: ReturnType<typeof createClient> | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Lazily initialise and return the singleton Redis client.
   * All callers share the same underlying connection.
   * Uses a cached promise to ensure exactly one connection attempt.
   */
  async getClient(): Promise<ReturnType<typeof createClient>> {
    if (!this.clientPromise) {
      this.clientPromise = this.connect();
    }
    return this.clientPromise;
  }

  private async connect(): Promise<ReturnType<typeof createClient>> {
    const url =
      this.configService.get<string>('redis.url') ??
      this.configService.get<string>('REDIS_URL') ??
      'redis://localhost:6379';

    const client = createClient({ url });

    client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    await client.connect();
    this.client = client;
    this.logger.log('Redis client connected');
    return client;
  }

  // ─── Generic key-value ──────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return client.get(key);
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const client = await this.getClient();
    await client.set(key, value, options ?? {});
  }

  async del(key: string | string[]): Promise<void> {
    const client = await this.getClient();
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length > 0) {
      await client.del(keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const client = await this.getClient();
    await client.expire(key, seconds);
  }

  async incr(key: string): Promise<number> {
    const client = await this.getClient();
    return client.incr(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const client = await this.getClient();
    return client.keys(pattern);
  }

  // ─── Auth-specific helpers ──────────────────────────────────────────────────

  // Refresh tokens
  async setRefreshToken(userId: string, family: string, token: string, ttlSeconds: number): Promise<void> {
    await this.set(`refresh:${userId}:${family}`, token, { EX: ttlSeconds });
  }

  async getRefreshToken(userId: string, family: string): Promise<string | null> {
    return this.get(`refresh:${userId}:${family}`);
  }

  async delRefreshToken(userId: string, family: string): Promise<void> {
    await this.del(`refresh:${userId}:${family}`);
  }

  async invalidateAllRefreshTokens(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`;
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.del(keys);
    }
  }

  // Login attempt tracking
  async getLoginAttempts(identifier: string): Promise<number> {
    const val = await this.get(`login:attempts:${identifier}`);
    return val ? parseInt(val, 10) : 0;
  }

  async incrementLoginAttempts(identifier: string, lockoutTtlSeconds: number): Promise<number> {
    const client = await this.getClient();
    const key = `login:attempts:${identifier}`;
    const attempts = await client.incr(key);
    if (attempts === 1) {
      await client.expire(key, lockoutTtlSeconds);
    }
    return attempts;
  }

  async isLockedOut(identifier: string): Promise<boolean> {
    return this.exists(`login:lockout:${identifier}`);
  }

  async setLockout(identifier: string, ttlSeconds: number): Promise<void> {
    await this.set(`login:lockout:${identifier}`, '1', { EX: ttlSeconds });
    await this.del(`login:attempts:${identifier}`);
  }

  async clearLoginAttempts(identifier: string): Promise<void> {
    await this.del([`login:attempts:${identifier}`, `login:lockout:${identifier}`]);
  }

  // OTP
  async setOtp(phone: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.set(`otp:${phone}`, otp, { EX: ttlSeconds });
  }

  async getOtp(phone: string): Promise<string | null> {
    return this.get(`otp:${phone}`);
  }

  async delOtp(phone: string): Promise<void> {
    await this.del(`otp:${phone}`);
  }

  // Password reset tokens
  async setResetToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.set(`reset:${token}`, userId, { EX: ttlSeconds });
  }

  async getResetToken(token: string): Promise<string | null> {
    return this.get(`reset:${token}`);
  }

  async delResetToken(token: string): Promise<void> {
    await this.del(`reset:${token}`);
  }

  // ─── Sales-specific helpers ─────────────────────────────────────────────────

  async getNextInvoiceSequence(branchId: string, year: number): Promise<number> {
    const client = await this.getClient();
    const key = `invoice:seq:${branchId}:${year}`;
    const seq = await client.incr(key);
    // Set expiry to end of year + buffer (400 days) on first increment
    if (seq === 1) {
      await client.expire(key, 400 * 24 * 60 * 60);
    }
    return seq;
  }

  // POS locks
  async posLockItem(itemId: string, ttlSeconds: number): Promise<void> {
    await this.set(`pos:lock:${itemId}`, '1', { EX: ttlSeconds });
  }

  async posUnlockItem(itemId: string): Promise<void> {
    await this.del(`pos:lock:${itemId}`);
  }

  async isPosLocked(itemId: string): Promise<boolean> {
    return this.exists(`pos:lock:${itemId}`);
  }

  // ─── Payment-specific helpers ───────────────────────────────────────────────

  async setWebhookIdempotency(webhookId: string, ttlSeconds: number): Promise<void> {
    await this.set(`webhook:processed:${webhookId}`, '1', { EX: ttlSeconds });
  }

  async isWebhookProcessed(webhookId: string): Promise<boolean> {
    return this.exists(`webhook:processed:${webhookId}`);
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleDestroy(): Promise<void> {
    if (this.clientPromise) {
      try {
        const client = await this.clientPromise;
        await client.quit();
        this.client = null;
        this.clientPromise = null;
        this.logger.log('Redis client disconnected');
      } catch (err: any) {
        this.logger.warn(`Error disconnecting Redis: ${err.message}`);
      }
    }
  }
}
