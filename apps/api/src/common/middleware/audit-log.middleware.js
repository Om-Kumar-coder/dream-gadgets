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
import { Injectable } from '@nestjs/common';
const SENSITIVE_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const SENSITIVE_PATHS = ['/sales', '/purchases', '/returns', '/admin/users', '/admin/roles', '/inventory'];
let AuditLogMiddleware = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuditLogMiddleware = _classThis = class {
        constructor(dataSource) {
            this.dataSource = dataSource;
        }
        use(req, res, next) {
            if (!SENSITIVE_METHODS.includes(req.method))
                return next();
            if (!SENSITIVE_PATHS.some(p => req.path.includes(p)))
                return next();
            const user = req.user;
            if (!user)
                return next();
            const originalSend = res.send.bind(res);
            res.send = (body) => {
                if (res.statusCode < 400) {
                    // Fire-and-forget audit log
                    this.dataSource.query(`INSERT INTO audit_logs (entity_type, entity_id, action, performed_by_id, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT DO NOTHING`, [
                        req.path.split('/')[2] ?? 'unknown',
                        null,
                        `${req.method} ${req.path}`,
                        user.sub,
                        req.ip,
                        req.headers['user-agent'] ?? '',
                    ]).catch(() => {
                        // audit_logs table may not exist yet — ignore
                    });
                }
                return originalSend(body);
            };
            next();
        }
    };
    __setFunctionName(_classThis, "AuditLogMiddleware");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditLogMiddleware = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditLogMiddleware = _classThis;
})();
export { AuditLogMiddleware };
//# sourceMappingURL=audit-log.middleware.js.map