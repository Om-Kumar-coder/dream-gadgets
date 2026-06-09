import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsOptional, IsString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateRazorpayOrderDto {
  @ApiProperty({ description: 'Amount in paise (INR * 100)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notes?: Record<string, string>;
}

class VerifyPaymentDto {
  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;

  @IsString()
  orderId: string;
}

class CreateRefundDto {
  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  paymentId: string;

  @ApiPropertyOptional({ description: 'Amount in paise; omit for full refund' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notes?: Record<string, string>;
}

@ApiTags('Payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ─── POST /payments/razorpay/order ────────────────────────────────────────────
  // PUBLIC endpoint for guest & authenticated checkout
  @Post('payments/razorpay/order')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Razorpay order for online payment (public access for checkout)' })
  @ApiSecurity('optional')
  async createPublicOrder(@Body() dto: CreateRazorpayOrderDto, @Req() req: any) {
    // Allow both authenticated and unauthenticated access
    // In production, you might want to rate-limit guest orders
    return this.paymentService.createRazorpayOrder(dto);
  }

  // ─── POST /webhooks/razorpay ──────────────────────────────────────────────────

  @Post('webhooks/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook handler (HMAC-SHA256 verified)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    if (!signature) {
      throw new BadRequestException({
        code: 'MISSING_SIGNATURE',
        message: 'x-razorpay-signature header is required',
      });
    }

    // Use raw body for signature verification
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    return this.paymentService.handleWebhook(rawBody, signature, body);
  }

  // ─── POST /payments/razorpay/verify ───────────────────────────────────────────
  // PUBLIC endpoint for frontend payment verification callback
  @Post('payments/razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature and confirm order' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment({
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      orderId: dto.orderId,
    });
  }

  // ─── POST /payments/razorpay/refund ───────────────────────────────────────────
  // PROTECTED admin endpoint
  @Post('payments/razorpay/refund')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a Razorpay refund (admin only)' })
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.paymentService.createRefund(dto);
  }

  // ─── GET /payments/:id ─────────────────────────────────────────────────────────
  // PROTECTED admin endpoint
  @Get('payments/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Get payment by ID (admin only)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findById(id);
  }

  // ─── GET /sales/:id/payments ──────────────────────────────────────────────────
  // PROTECTED admin endpoint
  @Get('sales/:id/payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'List payments for a sale (admin only)' })
  async findBySaleId(@Param('id', ParseUUIDPipe) saleId: string) {
    return this.paymentService.findBySaleId(saleId);
  }

  // ─── GET /admin/refunds ──────────────────────────────────────────────────────
  // PROTECTED admin endpoint
  @Get('admin/refunds')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @ApiOperation({ summary: 'List cancelled orders needing manual refund action' })
  async findRefundsNeedingAction() {
    return this.paymentService.findRefundsNeedingAction();
  }

  // ─── POST /admin/refunds/:paymentId/retry ────────────────────────────────────
  // PROTECTED admin endpoint
  @Post('admin/refunds/:paymentId/retry')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a manual refund for a specific payment' })
  @ApiQuery({ name: 'amount', required: false, type: Number, description: 'Amount in paise; omit for full refund' })
  async retryRefund(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Query('amount') amount: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.retryRefund({
      paymentId,
      amount: amount ? parseInt(amount, 10) : undefined,
      adminId: user.sub,
    });
  }
}
