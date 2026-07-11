var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, HttpCode, ServiceUnavailableException, Logger } from '@nestjs/common';
let HealthController = (() => {
    let _classDecorators = [Controller('health')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _check_decorators;
    let _liveness_decorators;
    let _readiness_decorators;
    var HealthController = _classThis = class {
        constructor(dataSource, configService) {
            this.dataSource = (__runInitializers(this, _instanceExtraInitializers), dataSource);
            this.configService = configService;
            this.logger = new Logger(HealthController.name);
            this.startTime = Date.now();
        }
        async check() {
            const result = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                services: {
                    api: { status: 'ok', version: this.configService.get('app.env', 'development') },
                    database: { status: 'ok' },
                    redis: { status: 'ok' },
                    memory: {
                        status: 'ok',
                        heapUsedMb: 0,
                        heapTotalMb: 0,
                        rssMb: 0,
                    },
                },
            };
            // Check database connectivity
            try {
                const dbStart = Date.now();
                await this.dataSource.query('SELECT 1');
                result.services.database.latencyMs = Date.now() - dbStart;
            }
            catch (err) {
                result.status = 'degraded';
                result.services.database.status = 'down';
                result.services.database.error = err instanceof Error ? err.message : 'Unknown DB error';
                this.logger.error(`Health check: Database down - ${result.services.database.error}`);
            }
            // Check Redis connectivity using ioredis (used by BullMQ/CacheModule)
            try {
                const redisUrl = this.configService.get('redis.url');
                if (redisUrl && redisUrl.startsWith('redis://')) {
                    const redisStart = Date.now();
                    const Redis = await import('ioredis').then(m => m.default || m);
                    const client = new Redis(redisUrl, {
                        lazyConnect: true,
                        maxRetriesPerRequest: 1,
                        retryStrategy: () => null,
                    });
                    await client.connect();
                    await client.ping();
                    result.services.redis.latencyMs = Date.now() - redisStart;
                    await client.quit();
                }
            }
            catch (err) {
                // Redis might not be configured — mark degraded but don't fail
                result.services.redis.status = 'down';
                result.services.redis.error = err instanceof Error ? err.message : 'Unknown Redis error';
                this.logger.warn(`Health check: Redis unavailable - ${result.services.redis.error}`);
            }
            // Memory usage
            const mem = process.memoryUsage();
            result.services.memory = {
                status: mem.heapUsed / mem.heapTotal > 0.85 ? 'warn' : 'ok',
                heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
                heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
                rssMb: Math.round(mem.rss / 1024 / 1024),
            };
            if (result.services.memory.status === 'warn') {
                result.status = 'degraded';
                this.logger.warn(`Health check: High memory usage - ${result.services.memory.heapUsedMb}MB / ${result.services.memory.heapTotalMb}MB`);
            }
            return result;
        }
        liveness() {
            return { status: 'alive' };
        }
        async readiness() {
            try {
                await this.dataSource.query('SELECT 1');
                return { status: 'ready', database: 'connected' };
            }
            catch {
                throw new ServiceUnavailableException({
                    status: 'error',
                    error: {
                        code: 'SERVICE_UNAVAILABLE',
                        message: 'Database is not connected',
                    },
                });
            }
        }
    };
    __setFunctionName(_classThis, "HealthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _check_decorators = [Get()];
        _liveness_decorators = [Get('live'), HttpCode(200)];
        _readiness_decorators = [Get('ready')];
        __esDecorate(_classThis, null, _check_decorators, { kind: "method", name: "check", static: false, private: false, access: { has: obj => "check" in obj, get: obj => obj.check }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _liveness_decorators, { kind: "method", name: "liveness", static: false, private: false, access: { has: obj => "liveness" in obj, get: obj => obj.liveness }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _readiness_decorators, { kind: "method", name: "readiness", static: false, private: false, access: { has: obj => "readiness" in obj, get: obj => obj.readiness }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HealthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HealthController = _classThis;
})();
export { HealthController };
//# sourceMappingURL=health.controller.js.map