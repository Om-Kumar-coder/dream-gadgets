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
import { Controller, Get, Post, NotFoundException, BadRequestException, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { IsArray, IsObject, IsOptional, IsNumber, IsString, MinLength } from 'class-validator';
let ContactInquiryDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    return _a = class ContactInquiryDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.message = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                __runInitializers(this, _message_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [IsString(), MinLength(1)];
            _phone_decorators = [IsString()];
            _email_decorators = [IsOptional(), IsString()];
            _message_decorators = [IsString(), MinLength(10)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let CreatePublicOrderDto = (() => {
    var _a;
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _shippingAddress_decorators;
    let _shippingAddress_initializers = [];
    let _shippingAddress_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    return _a = class CreatePublicOrderDto {
            constructor() {
                this.clientId = __runInitializers(this, _clientId_initializers, void 0);
                this.items = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.shippingAddress = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _shippingAddress_initializers, void 0));
                this.totalAmount = (__runInitializers(this, _shippingAddress_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
                __runInitializers(this, _totalAmount_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [IsOptional()];
            _items_decorators = [IsArray()];
            _shippingAddress_decorators = [IsObject()];
            _totalAmount_decorators = [IsNumber()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _shippingAddress_decorators, { kind: "field", name: "shippingAddress", static: false, private: false, access: { has: obj => "shippingAddress" in obj, get: obj => obj.shippingAddress, set: (obj, value) => { obj.shippingAddress = value; } }, metadata: _metadata }, _shippingAddress_initializers, _shippingAddress_extraInitializers);
            __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let PublicController = (() => {
    let _classDecorators = [ApiTags('Public'), Controller('public')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _health_decorators;
    let _getProducts_decorators;
    let _getProduct_decorators;
    let _getRelatedProducts_decorators;
    let _createOrder_decorators;
    let _getOrder_decorators;
    let _cancelOrder_decorators;
    let _getUserOrders_decorators;
    let _getBanners_decorators;
    let _getAllActiveBanners_decorators;
    let _trackBannerClick_decorators;
    let _submitContact_decorators;
    let _trackWhatsAppClick_decorators;
    let _getWhatsAppAnalytics_decorators;
    let _getAnnouncement_decorators;
    let _getBrandHero_decorators;
    let _getUserProfile_decorators;
    var PublicController = _classThis = class {
        constructor(searchService, onlineOrderService, paymentService, adminService, redisService, dataSource) {
            this.searchService = (__runInitializers(this, _instanceExtraInitializers), searchService);
            this.onlineOrderService = onlineOrderService;
            this.paymentService = paymentService;
            this.adminService = adminService;
            this.redisService = redisService;
            this.dataSource = dataSource;
        }
        // ─── Health check ──────────────────────────────────────────────────────────────
        async health() {
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            };
        }
        // ─── Products ──────────────────────────────────────────────────────────────────
        async getProducts(query) {
            // Build deterministic cache key from all query params
            const cacheKey = `public:products:${JSON.stringify(query, Object.keys(query).sort())}`;
            // Try cache first
            try {
                const cached = await this.redisService.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            catch {
                // Cache miss or error — fall through to DB query
            }
            const result = await this.searchService.searchPublicProducts('', {
                page: query.page ? Number(query.page) : undefined,
                limit: query.limit ? Number(query.limit) : undefined,
                condition: query.condition,
                brand: query.brand,
                minPrice: query.minPrice ? Number(query.minPrice) : undefined,
                maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
                storage: query.storage,
                colour: query.colour,
                branchId: query.branchId,
            });
            const response = {
                data: result.items,
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
            // Cache for 60 seconds
            try {
                await this.redisService.set(cacheKey, JSON.stringify(response), { EX: 60 });
            }
            catch {
                // Non-critical — cache is best-effort
            }
            return response;
        }
        async getProduct(id) {
            const item = await this.searchService.getProductWithSpecs(id);
            if (!item) {
                throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
            }
            return { data: item };
        }
        async getRelatedProducts(id) {
            const items = await this.searchService.getRelatedProducts(id);
            return { data: items };
        }
        // ─── Orders ───────────────────────────────────────────────────────────────────
        async createOrder(dto, req) {
            if (!dto.shippingAddress || !dto.totalAmount || !dto.items?.length) {
                throw new BadRequestException({
                    code: 'INVALID_ORDER_DATA',
                    message: 'Missing required order fields: shippingAddress, totalAmount, items',
                });
            }
            // Use configured branch ID or lookup the first active branch
            let branchId = process.env.DEFAULT_BRANCH_ID;
            if (!branchId) {
                const branches = await this.dataSource.query(`SELECT id FROM branches LIMIT 1`);
                branchId = branches?.[0]?.id;
            }
            if (!branchId) {
                throw new BadRequestException({
                    code: 'NO_BRANCH_CONFIGURED',
                    message: 'No default branch configured. Set DEFAULT_BRANCH_ID env or run database seeds.',
                });
            }
            // Use authenticated user's clientId if available, otherwise null (guest)
            const clientId = req.user?.sub ?? null;
            const createDto = {
                clientId: clientId ?? undefined,
                branchId,
                items: dto.items,
                shippingAddress: dto.shippingAddress,
                totalAmount: dto.totalAmount,
            };
            const order = await this.onlineOrderService.create(createDto);
            return { data: order };
        }
        async getOrder(id) {
            try {
                const orderSummary = await this.onlineOrderService.getPublicOrderSummary(id);
                return { data: orderSummary };
            }
            catch (err) {
                if (err?.message?.includes('not found')) {
                    throw new NotFoundException({
                        code: 'ORDER_NOT_FOUND',
                        message: `Order ${id} not found`,
                    });
                }
                throw err;
            }
        }
        async cancelOrder(id, req) {
            if (!req.user?.sub) {
                throw new BadRequestException({
                    code: 'NOT_AUTHENTICATED',
                    message: 'User not authenticated',
                });
            }
            // Verify the order belongs to this user
            const order = await this.onlineOrderService.findById(id);
            if (order.clientId !== req.user.sub) {
                throw new BadRequestException({
                    code: 'ORDER_NOT_OWNED',
                    message: 'You can only cancel your own orders',
                });
            }
            // Auto-refund if the order was payment_confirmed — persist refund details on the Payment record
            let refund = null;
            if (order.status === OnlineOrderStatus.PAYMENT_CONFIRMED) {
                const completedPayment = order.payments?.find(p => p.razorpayPaymentId && p.status === 'completed');
                if (completedPayment?.razorpayPaymentId) {
                    try {
                        refund = await this.paymentService.createRefund({
                            paymentId: completedPayment.razorpayPaymentId,
                            dbPaymentId: completedPayment.id, // Persist refund details on this local payment record
                            notes: {
                                orderId: order.id,
                                orderNumber: order.orderNumber,
                                reason: 'Customer requested cancellation',
                            },
                        });
                    }
                    catch (err) {
                        // Refund failure shouldn't block cancellation — logged in catch, continue
                        // Refund failure shouldn't block cancellation — logged in catch, continue
                    }
                }
            }
            const cancelledOrder = await this.onlineOrderService.updateStatus(id, OnlineOrderStatus.CANCELLED);
            return {
                data: cancelledOrder,
                refund: refund ?? undefined,
            };
        }
        async getUserOrders(req, query) {
            if (!req.user?.sub) {
                throw new BadRequestException({
                    code: 'NOT_AUTHENTICATED',
                    message: 'User not authenticated',
                });
            }
            const userId = req.user.sub;
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 20;
            const status = query.status;
            const search = query.search;
            // Orders are stored with clientId = userId (from checkout flow)
            const result = await this.onlineOrderService.findByClientId(userId, page, limit, status, search);
            return {
                data: {
                    data: result.data,
                    total: result.total,
                    page,
                    limit,
                },
            };
        }
        // ─── Banners ─────────────────────────────────────────────────────────────────
        async getBanners(pageType, position, deviceType) {
            const banners = await this.adminService.getActiveBanners(pageType || 'home', position || 'slider', deviceType);
            return banners;
        }
        async getAllActiveBanners(pageType) {
            const pt = pageType || 'home';
            const [slider, middle, bottom, offer] = await Promise.all([
                this.adminService.getActiveBanners(pt, 'slider'),
                this.adminService.getActiveBanners(pt, 'middle'),
                this.adminService.getActiveBanners(pt, 'bottom'),
                this.adminService.getActiveBanners(pt, 'offer'),
            ]);
            return { slider, middle, bottom, offer };
        }
        async trackBannerClick(id) {
            await this.adminService.incrementBannerClicks(id);
            return { status: 'ok' };
        }
        // ─── Contact ────────────────────────────────────────────────────────────────────
        async submitContact(dto) {
            const [inquiry] = await this.dataSource.query(`INSERT INTO contact_inquiries (name, phone, email, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, created_at`, [dto.name, dto.phone, dto.email ?? null, dto.message]);
            return { data: inquiry };
        }
        // ─── WhatsApp Click Tracking ────────────────────────────────────────────────
        async trackWhatsAppClick(body) {
            // Validate required fields
            if (typeof body?.source !== 'string' || !body.source || typeof body?.phone !== 'string' || !body.phone) {
                return { status: 'ok' };
            }
            try {
                await this.dataSource.query(`INSERT INTO whatsapp_click_events (source, phone, page_url, user_agent, referrer)
         VALUES ($1, $2, $3, $4, $5)`, [
                    body.source?.slice(0, 100),
                    body.phone?.slice(0, 20),
                    body.url?.slice(0, 2000) ?? null,
                    body.userAgent?.slice(0, 500) ?? null,
                    body.referrer?.slice(0, 2000) ?? null,
                ]);
            }
            catch {
                // Silently fail — tracking shouldn't break UX
            }
            return { status: 'ok' };
        }
        async getWhatsAppAnalytics(req, from, to, source) {
            // Only allow staff/admin roles to access analytics
            const userRole = req.user?.role;
            if (!['admin', 'shop_owner', 'manager'].includes(userRole)) {
                throw new NotFoundException({ code: 'NOT_FOUND', message: 'Not found' });
            }
            const conditions = [];
            const params = [];
            let paramIdx = 1;
            if (source) {
                conditions.push(`source = $${paramIdx++}`);
                params.push(source);
            }
            if (from) {
                conditions.push(`created_at >= $${paramIdx++}`);
                params.push(from);
            }
            if (to) {
                conditions.push(`created_at <= $${paramIdx++}`);
                params.push(to);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const [totalCount, sourceBreakdown, dailyTrend] = await Promise.all([
                this.dataSource.query(`SELECT COUNT(*)::int AS total FROM whatsapp_click_events ${whereClause}`, params),
                this.dataSource.query(`SELECT source, COUNT(*)::int AS count
         FROM whatsapp_click_events ${whereClause}
         GROUP BY source ORDER BY count DESC`, params),
                this.dataSource.query(`SELECT DATE(created_at) AS day, COUNT(*)::int AS count
         FROM whatsapp_click_events ${whereClause}
         GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30`, params),
            ]);
            return {
                total: totalCount[0]?.total ?? 0,
                bySource: sourceBreakdown,
                dailyTrend,
            };
        }
        // ─── Announcement Bar ────────────────────────────────────────────────────────────
        async getAnnouncement() {
            try {
                const setting = await this.adminService.getSetting('announcement_bar');
                const value = setting.value || {};
                // Only return if active, otherwise return empty
                if (!value.isActive)
                    return null;
                return value;
            }
            catch {
                return null;
            }
        }
        // ─── Brand Heroes ──────────────────────────────────────────────────────────────
        async getBrandHero(slug) {
            const hero = await this.adminService.getBrandHero(slug);
            return hero;
        }
        // ─── User Profile ─────────────────────────────────────────────────────────────
        async getUserProfile(req) {
            if (!req.user?.sub) {
                throw new BadRequestException({
                    code: 'NOT_AUTHENTICATED',
                    message: 'User not authenticated',
                });
            }
            const userRow = await this.dataSource.query(`SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = $1`, [req.user.sub]);
            if (!userRow?.length) {
                throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
            }
            const user = userRow[0];
            // Get order stats
            const stats = await this.dataSource.query(`SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_spent,
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_count,
        COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_count
      FROM online_orders
      WHERE client_id = $1`, [req.user.sub]);
            return {
                data: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    memberSince: user.created_at,
                    stats: stats[0] ?? { totalOrders: 0, totalSpent: 0, deliveredCount: 0, pendingCount: 0 },
                },
            };
        }
    };
    __setFunctionName(_classThis, "PublicController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _health_decorators = [Get('health'), ApiOperation({ summary: 'Health check endpoint' })];
        _getProducts_decorators = [Get('products'), ApiOperation({ summary: 'Search public products (cached 60s)' })];
        _getProduct_decorators = [Get('products/:id'), ApiOperation({ summary: 'Get public product by ID with specs and details' })];
        _getRelatedProducts_decorators = [Get('products/related/:id'), ApiOperation({ summary: 'Get related products' })];
        _createOrder_decorators = [Post('orders'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Create a public online order (guest or authenticated)' })];
        _getOrder_decorators = [Get('orders/:id'), ApiOperation({ summary: 'Get public order details (guest or authenticated)' })];
        _cancelOrder_decorators = [Post('orders/:id/cancel'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Cancel an order (only pending_payment or payment_confirmed)' })];
        _getUserOrders_decorators = [Get('orders'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Get authenticated user\'s orders' })];
        _getBanners_decorators = [Get('banners'), ApiOperation({ summary: 'Get active banners for frontend (filtered by page_type, position)' })];
        _getAllActiveBanners_decorators = [Get('banners/all'), ApiOperation({ summary: 'Get all active banners grouped by position' })];
        _trackBannerClick_decorators = [Post('banners/:id/click'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Track banner click' })];
        _submitContact_decorators = [Post('contact'), Throttle({ default: { ttl: 60000, limit: 5 } }), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Submit a contact/inquiry form' })];
        _trackWhatsAppClick_decorators = [Post('whatsapp/track-click'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Track a WhatsApp click event for analytics' })];
        _getWhatsAppAnalytics_decorators = [Get('account/whatsapp/analytics'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Get WhatsApp click analytics for authenticated users' })];
        _getAnnouncement_decorators = [Get('announcement'), ApiOperation({ summary: 'Get active announcement bar' })];
        _getBrandHero_decorators = [Get('brand-hero/:slug'), ApiOperation({ summary: 'Get brand hero background image' })];
        _getUserProfile_decorators = [Get('account/profile'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Get authenticated user profile with order stats' })];
        __esDecorate(_classThis, null, _health_decorators, { kind: "method", name: "health", static: false, private: false, access: { has: obj => "health" in obj, get: obj => obj.health }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProducts_decorators, { kind: "method", name: "getProducts", static: false, private: false, access: { has: obj => "getProducts" in obj, get: obj => obj.getProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProduct_decorators, { kind: "method", name: "getProduct", static: false, private: false, access: { has: obj => "getProduct" in obj, get: obj => obj.getProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRelatedProducts_decorators, { kind: "method", name: "getRelatedProducts", static: false, private: false, access: { has: obj => "getRelatedProducts" in obj, get: obj => obj.getRelatedProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOrder_decorators, { kind: "method", name: "createOrder", static: false, private: false, access: { has: obj => "createOrder" in obj, get: obj => obj.createOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrder_decorators, { kind: "method", name: "getOrder", static: false, private: false, access: { has: obj => "getOrder" in obj, get: obj => obj.getOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelOrder_decorators, { kind: "method", name: "cancelOrder", static: false, private: false, access: { has: obj => "cancelOrder" in obj, get: obj => obj.cancelOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserOrders_decorators, { kind: "method", name: "getUserOrders", static: false, private: false, access: { has: obj => "getUserOrders" in obj, get: obj => obj.getUserOrders }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBanners_decorators, { kind: "method", name: "getBanners", static: false, private: false, access: { has: obj => "getBanners" in obj, get: obj => obj.getBanners }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllActiveBanners_decorators, { kind: "method", name: "getAllActiveBanners", static: false, private: false, access: { has: obj => "getAllActiveBanners" in obj, get: obj => obj.getAllActiveBanners }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _trackBannerClick_decorators, { kind: "method", name: "trackBannerClick", static: false, private: false, access: { has: obj => "trackBannerClick" in obj, get: obj => obj.trackBannerClick }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _submitContact_decorators, { kind: "method", name: "submitContact", static: false, private: false, access: { has: obj => "submitContact" in obj, get: obj => obj.submitContact }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _trackWhatsAppClick_decorators, { kind: "method", name: "trackWhatsAppClick", static: false, private: false, access: { has: obj => "trackWhatsAppClick" in obj, get: obj => obj.trackWhatsAppClick }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWhatsAppAnalytics_decorators, { kind: "method", name: "getWhatsAppAnalytics", static: false, private: false, access: { has: obj => "getWhatsAppAnalytics" in obj, get: obj => obj.getWhatsAppAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAnnouncement_decorators, { kind: "method", name: "getAnnouncement", static: false, private: false, access: { has: obj => "getAnnouncement" in obj, get: obj => obj.getAnnouncement }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBrandHero_decorators, { kind: "method", name: "getBrandHero", static: false, private: false, access: { has: obj => "getBrandHero" in obj, get: obj => obj.getBrandHero }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserProfile_decorators, { kind: "method", name: "getUserProfile", static: false, private: false, access: { has: obj => "getUserProfile" in obj, get: obj => obj.getUserProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PublicController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PublicController = _classThis;
})();
export { PublicController };
//# sourceMappingURL=public.controller.js.map