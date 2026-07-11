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
import { WebSocketGateway, WebSocketServer, SubscribeMessage, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
let RealtimeGateway = (() => {
    let _classDecorators = [WebSocketGateway({
            cors: {
                origin: '*',
                credentials: true,
            },
            namespace: '/',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handlePing_decorators;
    let _handleJoinBranch_decorators;
    var RealtimeGateway = _classThis = class {
        constructor(realtimeService, configService) {
            this.realtimeService = (__runInitializers(this, _instanceExtraInitializers), realtimeService);
            this.configService = configService;
            this.server = __runInitializers(this, _server_initializers, void 0);
            this.logger = (__runInitializers(this, _server_extraInitializers), new Logger(RealtimeGateway.name));
        }
        // ─── 17.1 Gateway init ────────────────────────────────────────────────────────
        afterInit(server) {
            this.realtimeService.setServer(server);
            this.logger.log('WebSocket Gateway initialized');
        }
        // ─── 17.1 JWT authentication on connection ────────────────────────────────────
        async handleConnection(client) {
            try {
                const token = client.handshake?.auth?.token ??
                    client.handshake?.query?.token;
                if (!token) {
                    this.logger.warn(`[WS] Connection rejected — no token: ${client.id}`);
                    client.disconnect(true);
                    return;
                }
                const payload = this.verifyToken(token);
                if (!payload) {
                    this.logger.warn(`[WS] Connection rejected — invalid token: ${client.id}`);
                    client.disconnect(true);
                    return;
                }
                // Attach user info to socket
                client.data = { userId: payload.sub, branchId: payload.branchId, role: payload.role };
                // ─── 17.2 Room assignment ─────────────────────────────────────────────────
                await client.join(`user:${payload.sub}`);
                if (payload.branchId) {
                    await client.join(`branch:${payload.branchId}`);
                }
                // Owners join admin room
                if (!payload.branchId || payload.role === 'Shop Owner') {
                    await client.join('admin');
                }
                this.logger.log(`[WS] Client connected: ${client.id} (user: ${payload.sub})`);
            }
            catch (err) {
                this.logger.warn(`[WS] Connection error: ${err?.message}`);
                client.disconnect(true);
            }
        }
        handleDisconnect(client) {
            this.logger.log(`[WS] Client disconnected: ${client.id}`);
        }
        // ─── Token verification ───────────────────────────────────────────────────────
        verifyToken(token) {
            try {
                const jwt = require('jsonwebtoken');
                const secret = this.configService.get('app.jwtSecret') ?? this.configService.get('JWT_SECRET') ?? 'dev-secret';
                return jwt.verify(token, secret);
            }
            catch {
                return null;
            }
        }
        // ─── 17.3 / 17.4 Client-side event handlers ──────────────────────────────────
        handlePing(client) {
            client.emit('pong', { timestamp: new Date().toISOString() });
        }
        async handleJoinBranch(client, data) {
            if (client.data?.branchId === data.branchId || !client.data?.branchId) {
                await client.join(`branch:${data.branchId}`);
                client.emit('joined', { room: `branch:${data.branchId}` });
            }
        }
    };
    __setFunctionName(_classThis, "RealtimeGateway");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [WebSocketServer()];
        _handlePing_decorators = [SubscribeMessage('ping')];
        _handleJoinBranch_decorators = [SubscribeMessage('join-branch')];
        __esDecorate(_classThis, null, _handlePing_decorators, { kind: "method", name: "handlePing", static: false, private: false, access: { has: obj => "handlePing" in obj, get: obj => obj.handlePing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleJoinBranch_decorators, { kind: "method", name: "handleJoinBranch", static: false, private: false, access: { has: obj => "handleJoinBranch" in obj, get: obj => obj.handleJoinBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RealtimeGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RealtimeGateway = _classThis;
})();
export { RealtimeGateway };
//# sourceMappingURL=realtime.gateway.js.map