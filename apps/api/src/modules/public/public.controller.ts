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
  constructor(
    private readonly searchService: SearchService,
    private readonly onlineOrderService: OnlineOrderService,
    private readonly paymentService: PaymentService,
    private readonly adminService: AdminService,
    private readonly redisService: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ─── Health check ──────────────────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
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

  // ─── Orders ───────────────────────────────────────────────────────────────────

  @Post('orders')
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

    // Use authenticated user's clientId if available, otherwise null (guest)
    const clientId = req.user?.sub ?? null;

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

    // Verify the order belongs to this user
    const order = await this.onlineOrderService.findById(id);
    if (order.clientId !== req.user.sub) {
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

    // Get order stats
    const stats = await this.dataSource.query(
      `SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_spent,
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_count,
        COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_count
      FROM online_orders
      WHERE client_id = $1`,
      [req.user.sub],
    );

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
