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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from '../search/search.service';
import { OnlineOrderService, CreateOnlineOrderDto } from '../sales/online-order.service';
import { IsArray, IsObject, IsOptional, IsNumber } from 'class-validator';

class CreatePublicOrderDto {
  @IsOptional()
  clientId?: string;

  @IsArray()
  items: Array<{ itemId: string; unitPrice: number; quantity?: number }>;

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
  @ApiOperation({ summary: 'Search public products' })
  async getProducts(@Query() query: Record<string, any>) {
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

    return {
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get public product by ID' })
  async getProduct(@Param('id') id: string) {
    const result = await this.searchService.searchPublicProducts('', {
      itemId: id,
      page: 1,
      limit: 1,
    });
    const item = result.items[0];
    if (!item) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    return { data: item };
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

    // Default to first branch (in production, allow branch selection)
    const branchId = 'default-branch-uuid';

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

    // Fetch client's orders from database
    // Note: In a real system, you'd join with payments to get a list of online orders for the client
    // For now, we return an empty array since we need to map user -> client -> orders
    // This assumes the clientId is stored in the JWT payload or user table
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    // TODO: implement user -> client mapping in auth flow
    // For now, return empty result
    return {
      data: {
        data: [],
        total: 0,
        page,
        limit,
      },
    };
  }
}

