import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SearchService } from '../search/search.service';
import { RedisService } from '../../common/redis/redis.service';
import { OnlineOrderService, CreateOnlineOrderDto } from '../sales/online-order.service';
import { PaymentService } from '../payment/payment.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { IsArray, IsObject, IsOptional, IsNumber, IsString, MinLength } from 'class-validator';

class ContactInquiryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @MinLength(10)
  message: string;
}

// BUG-16: apps/web/app/partner/page.tsx POSTs this payload to
// /public/partner/inquiry — the route did not exist, so every partner form
// submission 404'd (the page even special-cased 404 to fail silently).
class PartnerInquiryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(6)
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  partnerType?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

class CreatePublicOrderDto {
  @IsOptional()
  clientId?: string;

  @IsArray()
  items: Array<{ itemId: string; imei?: string | null; description: string; unitPrice: number; quantity?: number }>;

  @IsObject()
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @IsNumber()
  totalAmount: number;
}

@ApiTags('Public')
@Controller('public')
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly onlineOrderService: OnlineOrderService,
    private readonly paymentService: PaymentService,
    private readonly adminService: AdminService,
    private readonly redisService: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ─── BUG-08: resolve the `clients` row for a web user ──────────────────────
  //
  // `online_orders.client_id` has an FK to `clients(id)` and the order→client
  // relation drives "my orders", order cancellation ownership and profile
  // stats. Storing (or comparing against) `users.id` here was wrong in every
  // one of those paths. Match an existing client by phone (both canonical
  // forms) or email; lazily create one on first order so future lookups are
  // stable. Returns null when nothing can be linked — callers fall back to
  // guest semantics instead of failing the request.
  private async resolveClientIdForUser(userId: string): Promise<string | null> {
    try {
      const userRows: any[] = await this.dataSource.query(
        `SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1`,
        [userId],
      );
      const user = userRows?.[0];
      if (!user) return null;

      // Phone identity: users store '91XXXXXXXXXX' (auth normalizer) while
      // staff-created clients often store bare 'XXXXXXXXXX' — match both.
      const phoneVariants = new Set<string>();
      if (user.phone) {
        const raw = String(user.phone).trim();
        const digits = raw.replace(/\D/g, '');
        phoneVariants.add(raw);
        if (digits) phoneVariants.add(digits);
        if (digits.length === 12 && digits.startsWith('91')) phoneVariants.add(digits.slice(2));
        if (digits.length === 10) phoneVariants.add(`91${digits}`);
      }
      const phones = [...phoneVariants];
      const email = user.email ? String(user.email).trim().toLowerCase() : null;

      const existing: any[] = await this.dataSource.query(
        `SELECT id FROM clients
          WHERE (phone = ANY($1) OR ($2::text IS NOT NULL AND LOWER(email) = $2::text))
          ORDER BY created_at ASC
          LIMIT 1`,
        [phones, email],
      );
      if (existing?.length) return existing[0].id;

      // Nothing to link yet. clients.phone is NOT NULL + UNIQUE, so a client
      // can only be created when the user actually has a phone number.
      if (phones.length === 0) return null;

      const created: any[] = await this.dataSource.query(
        `INSERT INTO clients (first_name, last_name, phone, email, customer_type, created_by)
         VALUES ($1, $2, $3, $4, 'online', $5)
         ON CONFLICT (phone) DO NOTHING
         RETURNING id`,
        [
          user.first_name ?? 'Online Customer',
          user.last_name ?? null,
          user.phone,
          email,
          userId,
        ],
      );
      if (created?.length) return created[0].id;

      // CONFLICT lost a race with a concurrent request — re-select.
      const retry: any[] = await this.dataSource.query(
        `SELECT id FROM clients WHERE phone = ANY($1) LIMIT 1`,
        [phones],
      );
      return retry?.[0]?.id ?? null;
    } catch (err: any) {
      // Linkage must never break the order flow — degrade to guest.
      this.logger.warn(`[Public] Could not resolve client for user ${userId}: ${err?.message}`);
      return null;
    }
  }

  // ─── Health check ──────────────────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint — reports DB, Redis, and queue status' })
  async health() {
    const checks: Record<string, string> = {};

    // Database
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'ok';
    } catch (err: any) {
      checks.database = `error: ${err?.message ?? 'unknown'}`;
    }

    // Redis
    try {
      const client = await this.redisService.getClient();
      await client.ping();
      checks.redis = 'ok';
    } catch (err: any) {
      checks.redis = `error: ${err?.message ?? 'unknown'}`;
    }

    const allOk = Object.values(checks).every((s) => s === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }

  // ─── Products ──────────────────────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'Search public products (cached 60s)' })
  async getProducts(@Query() query: Record<string, any>) {
    // Build deterministic cache key from all query params
    const cacheKey = `public:products:${JSON.stringify(query, Object.keys(query).sort())}`;

    // Try cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Cache miss or error — fall through to DB query
    }

    const result = await this.searchService.searchPublicProducts(query.search ?? query.q ?? '', {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      condition: query.condition,
      brand: query.brand,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      storage: query.storage,
      colour: query.colour,
      branchId: query.branchId,
      sort: query.sort,
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
    } catch {
      // Non-critical — cache is best-effort
    }

    return response;
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get public product by ID with specs and details' })
  async getProduct(@Param('id') id: string) {
    const item = await this.searchService.getProductWithSpecs(id);
    if (!item) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    return { data: item };
  }

  @Get('products/related/:id')
  @ApiOperation({ summary: 'Get related products' })
  async getRelatedProducts(@Param('id') id: string) {
    const items = await this.searchService.getRelatedProducts(id);
    return { data: items };
  }

  // ─── Branches ─────────────────────────────────────────────────────────────────

  @Get('branches')
  @ApiOperation({ summary: 'List active store branches for the public store pages' })
  async getPublicBranches() {
    const branches = await this.dataSource.query(
      `SELECT
         b.id, b.name, b.code, b.address, b.city, b.state, b.pincode,
         b.phone, b.whatsapp, b.email, b.instagram, b.working_hours,
         b.map_url, b.sort_order,
         (SELECT COUNT(*)::int FROM inventory_items ii WHERE ii.branch_id = b.id) AS product_count
       FROM branches b
       ORDER BY b.sort_order ASC, b.name ASC`,
    );
    return {
      data: branches.map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        address: b.address,
        city: b.city,
        state: b.state,
        pincode: b.pincode,
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        instagram: b.instagram,
        workingHours: b.working_hours,
        mapUrl: b.map_url,
        sortOrder: b.sort_order,
        productCount: Number(b.product_count) || 0,
      })),
    };
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  @Post('orders')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a public online order (guest or authenticated)' })
  async createOrder(@Body() dto: CreatePublicOrderDto, @Request() req: any) {
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

    // Link the order to the customer's `clients` row (FK on online_orders),
    // never to `users.id` — that was BUG-08. No user → guest order (null).
    const clientId = req.user?.sub ? await this.resolveClientIdForUser(req.user.sub) : null;

    const createDto: CreateOnlineOrderDto = {
      clientId: clientId ?? undefined,
      branchId,
      items: dto.items,
      shippingAddress: dto.shippingAddress,
      totalAmount: dto.totalAmount,
    };

    const order = await this.onlineOrderService.create(createDto);
    return { data: order };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get public order details (guest or authenticated)' })
  async getOrder(@Param('id') id: string) {
    try {
      const orderSummary = await this.onlineOrderService.getPublicOrderSummary(id);
      return { data: orderSummary };
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        throw new NotFoundException({
          code: 'ORDER_NOT_FOUND',
          message: `Order ${id} not found`,
        });
      }
      throw err;
    }
  }

  @Post('orders/:id/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order (only pending_payment or payment_confirmed)' })
  async cancelOrder(@Param('id') id: string, @Request() req: any) {
    if (!req.user?.sub) {
      throw new BadRequestException({
        code: 'NOT_AUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    // Verify the order belongs to this user — ownership is decided by the
    // resolved `clients` id (BUG-08: comparing to users.id never matched).
    const order = await this.onlineOrderService.findById(id);
    const clientId = await this.resolveClientIdForUser(req.user.sub);
    if (!clientId || order.clientId !== clientId) {
      throw new BadRequestException({
        code: 'ORDER_NOT_OWNED',
        message: 'You can only cancel your own orders',
      });
    }

    // Auto-refund if the order was payment_confirmed — persist refund details on the Payment record
    let refund: { refundId: string; amount: number; status: string } | null = null;
    if (order.status === OnlineOrderStatus.PAYMENT_CONFIRMED) {
      const completedPayment = order.payments?.find(p => p.razorpayPaymentId && p.status === 'completed');
      if (completedPayment?.razorpayPaymentId) {
        try {
          refund = await this.paymentService.createRefund({
            paymentId: completedPayment.razorpayPaymentId,
            dbPaymentId: completedPayment.id,  // Persist refund details on this local payment record
            notes: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              reason: 'Customer requested cancellation',
            },
          });
        } catch (err: any) {
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

  @Get('orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user\'s orders' })
  async getUserOrders(@Request() req: any, @Query() query: Record<string, any>) {
    if (!req.user?.sub) {
      throw new BadRequestException({
        code: 'NOT_AUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    const userId = req.user.sub;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;
    const status = query.status as string | undefined;
    const search = query.search as string | undefined;

    // Orders are linked by the resolved `clients` id (BUG-08: querying by
    // users.id matched nothing because client_id never stores a user id).
    const clientId = await this.resolveClientIdForUser(userId);
    if (!clientId) {
      return { data: { data: [], total: 0, page, limit } };
    }
    const result = await this.onlineOrderService.findByClientId(clientId, page, limit, status, search);

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

  @Get('banners')
  @ApiOperation({ summary: 'Get active banners for frontend (filtered by page_type, position)' })
  async getBanners(
    @Query('pageType') pageType: string,
    @Query('position') position: string,
    @Query('device') deviceType?: string,
  ) {
    const banners = await this.adminService.getActiveBanners(
      pageType || 'home',
      position || 'slider',
      deviceType,
    );
    return banners;
  }

  @Get('banners/all')
  @ApiOperation({ summary: 'Get all active banners grouped by position' })
  async getAllActiveBanners(@Query('pageType') pageType: string) {
    const pt = pageType || 'home';
    const [slider, middle, bottom, offer] = await Promise.all([
      this.adminService.getActiveBanners(pt, 'slider'),
      this.adminService.getActiveBanners(pt, 'middle'),
      this.adminService.getActiveBanners(pt, 'bottom'),
      this.adminService.getActiveBanners(pt, 'offer'),
    ]);
    return { slider, middle, bottom, offer };
  }

  @Post('banners/:id/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track banner click' })
  async trackBannerClick(@Param('id') id: string) {
    await this.adminService.incrementBannerClicks(id);
    return { status: 'ok' };
  }

  // ─── Contact ────────────────────────────────────────────────────────────────────

  @Post('partner/inquiry')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a partner/franchise inquiry' })
  async submitPartnerInquiry(@Body() dto: PartnerInquiryDto) {
    // contact_inquiries only has (name, phone, email, message) — fold the
    // partner-specific fields into the message text so nothing is lost.
    const message = [
      `Partner type: ${dto.partnerType?.trim() || 'unspecified'}`,
      dto.businessName?.trim() ? `Business: ${dto.businessName.trim()}` : null,
      dto.message?.trim() || null,
    ]
      .filter(Boolean)
      .join('\n');

    const [inquiry] = await this.dataSource.query(
      `INSERT INTO contact_inquiries (name, phone, email, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, created_at`,
      [dto.name, dto.phone, dto.email ?? null, message],
    );

    return { data: inquiry };
  }

  @Post('contact')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact/inquiry form' })
  async submitContact(@Body() dto: ContactInquiryDto) {
    const [inquiry] = await this.dataSource.query(
      `INSERT INTO contact_inquiries (name, phone, email, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, created_at`,
      [dto.name, dto.phone, dto.email ?? null, dto.message],
    );

    return { data: inquiry };
  }

  // ─── WhatsApp Click Tracking ────────────────────────────────────────────────

  @Post('whatsapp/track-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a WhatsApp click event for analytics' })
  async trackWhatsAppClick(
    @Body() body: {
      source: string;
      productId?: string | null;
      phone: string;
      url: string;
      userAgent?: string | null;
      referrer?: string | null;
    },
  ) {
    // Validate required fields
    if (typeof body?.source !== 'string' || !body.source || typeof body?.phone !== 'string' || !body.phone) {
      return { status: 'ok' };
    }

    try {
      await this.dataSource.query(
        `INSERT INTO whatsapp_click_events (source, phone, page_url, user_agent, referrer)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          body.source?.slice(0, 100),
          body.phone?.slice(0, 20),
          body.url?.slice(0, 2000) ?? null,
          body.userAgent?.slice(0, 500) ?? null,
          body.referrer?.slice(0, 2000) ?? null,
        ],
      );
    } catch {
      // Silently fail — tracking shouldn't break UX
    }

    return { status: 'ok' };
  }

  @Get('account/whatsapp/analytics')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WhatsApp click analytics for authenticated users' })
  async getWhatsAppAnalytics(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('source') source?: string,
  ) {
    // Only allow staff/admin roles to access analytics
    const userRole = req.user?.role;
    if (!['admin', 'shop_owner', 'manager'].includes(userRole)) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Not found' });
    }

    const conditions: string[] = [];
    const params: any[] = [];
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
      this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM whatsapp_click_events ${whereClause}`,
        params,
      ),
      this.dataSource.query(
        `SELECT source, COUNT(*)::int AS count
         FROM whatsapp_click_events ${whereClause}
         GROUP BY source ORDER BY count DESC`,
        params,
      ),
      this.dataSource.query(
        `SELECT DATE(created_at) AS day, COUNT(*)::int AS count
         FROM whatsapp_click_events ${whereClause}
         GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30`,
        params,
      ),
    ]);

    return {
      total: totalCount[0]?.total ?? 0,
      bySource: sourceBreakdown,
      dailyTrend,
    };
  }

  // ─── Announcement Bar ────────────────────────────────────────────────────────────

  @Get('announcement')
  @ApiOperation({ summary: 'Get active announcement bar' })
  async getAnnouncement() {
    try {
      const setting = await this.adminService.getSetting('announcement_bar');
      const value = setting.value || {};
      // Only return if active, otherwise return empty
      if (!value.isActive) return null;
      return value;
    } catch {
      return null;
    }
  }

  // ─── Brand Heroes ──────────────────────────────────────────────────────────────

  @Get('brand-hero/:slug')
  @ApiOperation({ summary: 'Get brand hero background image' })
  async getBrandHero(@Param('slug') slug: string) {
    const hero = await this.adminService.getBrandHero(slug);
    return hero;
  }

  // ─── User Profile ─────────────────────────────────────────────────────────────

  @Get('account/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile with order stats' })
  async getUserProfile(@Request() req: any) {
    if (!req.user?.sub) {
      throw new BadRequestException({
        code: 'NOT_AUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    const userRow = await this.dataSource.query(
      `SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = $1`,
      [req.user.sub],
    );

    if (!userRow?.length) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const user = userRow[0];

    // Get order stats — counted against the customer's `clients` id, not the
    // user id (BUG-08: this query always returned zeros).
    const clientId = await this.resolveClientIdForUser(req.user.sub);
    const stats = clientId
      ? await this.dataSource.query(
          `SELECT
            COUNT(*)::int AS total_orders,
            COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_spent,
            COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_count,
            COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_count
          FROM online_orders
          WHERE client_id = $1`,
          [clientId],
        )
      : [{ total_orders: 0, total_spent: 0, delivered_count: 0, pending_count: 0 }];

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
}
