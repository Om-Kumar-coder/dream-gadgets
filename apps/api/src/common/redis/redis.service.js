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
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
let RedisService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RedisService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(RedisService.name);
            this.clientPromise = null;
            this.client = null;
        }
        /**
         * Lazily initialise and return the singleton Redis client.
         * All callers share the same underlying connection.
         * Uses a cached promise to ensure exactly one connection attempt.
         */
        async getClient() {
            if (!this.clientPromise) {
                this.clientPromise = this.connect();
            }
            return this.clientPromise;
        }
        async connect() {
            const url = this.configService.get('redis.url') ??
                this.configService.get('REDIS_URL') ??
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
        async get(key) {
            const client = await this.getClient();
            return client.get(key);
        }
        async set(key, value, options) {
            const client = await this.getClient();
            await client.set(key, value, options ?? {});
        }
        async del(key) {
            const client = await this.getClient();
            const keys = Array.isArray(key) ? key : [key];
            if (keys.length > 0) {
                await client.del(keys);
            }
        }
        async exists(key) {
            const client = await this.getClient();
            const result = await client.exists(key);
            return result === 1;
        }
        async expire(key, seconds) {
            const client = await this.getClient();
            await client.expire(key, seconds);
        }
        async incr(key) {
            const client = await this.getClient();
            return client.incr(key);
        }
        async keys(pattern) {
            const client = await this.getClient();
            return client.keys(pattern);
        }
        // ─── Auth-specific helpers ──────────────────────────────────────────────────
        // Refresh tokens
        async setRefreshToken(userId, family, token, ttlSeconds) {
            await this.set(`refresh:${userId}:${family}`, token, { EX: ttlSeconds });
        }
        async getRefreshToken(userId, family) {
            return this.get(`refresh:${userId}:${family}`);
        }
        async delRefreshToken(userId, family) {
            await this.del(`refresh:${userId}:${family}`);
        }
        async invalidateAllRefreshTokens(userId) {
            const pattern = `refresh:${userId}:*`;
            const keys = await this.keys(pattern);
            if (keys.length > 0) {
                await this.del(keys);
            }
        }
        // Login attempt tracking
        async getLoginAttempts(identifier) {
            const val = await this.get(`login:attempts:${identifier}`);
            return val ? parseInt(val, 10) : 0;
        }
        async incrementLoginAttempts(identifier, lockoutTtlSeconds) {
            const client = await this.getClient();
            const key = `login:attempts:${identifier}`;
            const attempts = await client.incr(key);
            if (attempts === 1) {
                await client.expire(key, lockoutTtlSeconds);
            }
            return attempts;
        }
        async isLockedOut(identifier) {
            return this.exists(`login:lockout:${identifier}`);
        }
        async setLockout(identifier, ttlSeconds) {
            await this.set(`login:lockout:${identifier}`, '1', { EX: ttlSeconds });
            await this.del(`login:attempts:${identifier}`);
        }
        async clearLoginAttempts(identifier) {
            await this.del([`login:attempts:${identifier}`, `login:lockout:${identifier}`]);
        }
        // Password reset tokens
        async setResetToken(token, userId, ttlSeconds) {
            await this.set(`reset:${token}`, userId, { EX: ttlSeconds });
        }
        async getResetToken(token) {
            return this.get(`reset:${token}`);
        }
        async delResetToken(token) {
            await this.del(`reset:${token}`);
        }
        // Forgot-password rate limiting (per identifier — email or phone)
        // Limits to 1 request per cooldown period per identifier
        /**
         * Checks if the given identifier is currently rate-limited for forgot-password.
         * Returns the number of seconds remaining in the cooldown, or 0 if not limited.
         */
        async getForgotPasswordCooldown(identifier) {
            const remainingTTL = await this.getClient().then((c) => c.ttl(`forgot:cooldown:${identifier}`));
            return remainingTTL > 0 ? remainingTTL : 0;
        }
        /**
         * Records a forgot-password request for the given identifier and sets a cooldown.
         * Only sets TTL on the first request (when the key doesn't exist yet) so subsequent
         * requests within the cooldown window don't extend it.
         */
        async setForgotPasswordCooldown(identifier, cooldownSeconds) {
            const key = `forgot:cooldown:${identifier}`;
            const exists = await this.exists(key);
            if (!exists) {
                await this.set(key, '1', { EX: cooldownSeconds });
            }
        }
        // ─── Sales-specific helpers ─────────────────────────────────────────────────
        async getNextInvoiceSequence(branchId, year) {
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
        async posLockItem(itemId, ttlSeconds) {
            await this.set(`pos:lock:${itemId}`, '1', { EX: ttlSeconds });
        }
        async posUnlockItem(itemId) {
            await this.del(`pos:lock:${itemId}`);
        }
        async isPosLocked(itemId) {
            return this.exists(`pos:lock:${itemId}`);
        }
        // ─── Payment-specific helpers ───────────────────────────────────────────────
        async setWebhookIdempotency(webhookId, ttlSeconds) {
            await this.set(`webhook:processed:${webhookId}`, '1', { EX: ttlSeconds });
        }
        async isWebhookProcessed(webhookId) {
            return this.exists(`webhook:processed:${webhookId}`);
        }
        // ─── Lifecycle ──────────────────────────────────────────────────────────────
        async onModuleDestroy() {
            if (this.clientPromise) {
                try {
                    const client = await this.clientPromise;
                    await client.quit();
                    this.client = null;
                    this.clientPromise = null;
                    this.logger.log('Redis client disconnected');
                }
                catch (err) {
                    this.logger.warn(`Error disconnecting Redis: ${err.message}`);
                }
            }
        }
    };
    __setFunctionName(_classThis, "RedisService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RedisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RedisService = _classThis;
})();
export { RedisService };
//# sourceMappingURL=redis.service.js.map