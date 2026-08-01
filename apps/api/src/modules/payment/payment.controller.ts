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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsOptional, IsString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PhonePeService } from './phonepe.service';
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

class InitiatePhonePeDto {
  @ApiProperty({ description: 'Amount in paise (INR * 100)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Order ID from our system' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Mobile number for prefill' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;
}

class CreateRefundDto {
  @ApiProperty({ description: 'Payment ID' })
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
  constructor(
    private readonly paymentService: PaymentService,
    private readonly phonePeService: PhonePeService,
    private readonly configService: ConfigService,
  ) {}

  // ─── POST /payments/razorpay/order (legacy) ──────────────────────────────────
  @Post('payments/razorpay/order')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Razorpay order (legacy)' })
  @ApiSecurity('optional')
  async createPublicOrder(@Body() dto: CreateRazorpayOrderDto) {
    return this.paymentService.createRazorpayOrder(dto);
  }

  // ─── POST /webhooks/razorpay (legacy) ─────────────────────────────────────────
  @Post('webhooks/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook handler (legacy)' })
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
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    return this.paymentService.handleWebhook(rawBody, signature, body);
  }

  // ─── POST /payments/razorpay/verify (legacy) ──────────────────────────────────
  @Post('payments/razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature (legacy)' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment({
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      orderId: dto.orderId,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PHONEPE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── POST /payments/phonepe/initiate ─────────────────────────────────────────
  @Post('payments/phonepe/initiate')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a PhonePe payment (returns redirect URL)' })
  @ApiSecurity('optional')
  async initiatePhonePePayment(@Body() dto: InitiatePhonePeDto) {
    const merchantTransactionId = `DG_${dto.orderId.slice(0, 8)}_${Date.now()}`;
    const baseUrl = this.configService.get<string>('BACKEND_URL', 'http://localhost:3000');

    const result = await this.phonePeService.initiatePayment({
      amount: dto.amount,
      merchantTransactionId,
      merchantUserId: `order_${dto.orderId}`,
      mobileNumber: dto.mobileNumber,
      redirectUrl: `${baseUrl}/api/v1/payments/phonepe/redirect`,
      callbackUrl: `${baseUrl}/api/v1/webhooks/phonepe`,
    });

    await this.paymentService.savePhonePeTransactionRef(dto.orderId, merchantTransactionId);

    return {
      redirectUrl: result.redirectUrl,
      merchantTransactionId: result.merchantTransactionId,
      orderId: dto.orderId,
    };
  }

  // ─── POST /payments/phonepe/redirect ─────────────────────────────────────────
  @Post('payments/phonepe/redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PhonePe payment redirect handler' })
  async handlePhonePeRedirect(@Body() body: any) {
    const result = await this.phonePeService.processRedirectCallback({
      merchantId: body.merchantId,
      transactionId: body.transactionId,
      code: body.code,
    });

    const order = await this.paymentService.findOrderByMerchantTxnId(result.merchantTransactionId);
    if (order && result.status === 'completed') {
      await this.paymentService.confirmPhonePePayment({
        orderId: order.id,
        merchantTransactionId: result.merchantTransactionId,
      });
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const status = result.status === 'completed' ? 'success' : 'failed';
    return {
      status,
      redirectUrl: order
        ? `${frontendUrl}/orders/${order.id}?payment=${status}`
        : `${frontendUrl}/orders?payment=${status}`,
    };
  }

  // ─── POST /webhooks/phonepe ──────────────────────────────────────────────────
  @Post('webhooks/phonepe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PhonePe webhook/callback handler' })
  async handlePhonePeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-verify') xVerifyHeader: string,
    @Body() body: any,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    const callbackData = await this.phonePeService.processCallback(rawBody, xVerifyHeader);

    const order = await this.paymentService.findOrderByMerchantTxnId(callbackData.merchantTransactionId);
    if (order && callbackData.status === 'completed') {
      await this.paymentService.confirmPhonePePayment({
        orderId: order.id,
        merchantTransactionId: callbackData.merchantTransactionId,
        phonepeTransactionId: callbackData.merchantTransactionId,
        amount: callbackData.amount,
      });
    }

    return { status: 'ok' };
  }

  // ─── POST /payments/phonepe/status ───────────────────────────────────────────
  @Post('payments/phonepe/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check PhonePe payment status' })
  async checkPhonePeStatus(@Body() body: { merchantTransactionId: string }) {
    return this.phonePeService.checkPaymentStatus(body.merchantTransactionId);
  }

  // ─── POST /payments/razorpay/refund (legacy) ──────────────────────────────────
  @Post('payments/razorpay/refund')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a Razorpay refund (admin only) (legacy)' })
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.paymentService.createRefund(dto);
  }

  // ─── POST /payments/phonepe/refund ───────────────────────────────────────────
  @Post('payments/phonepe/refund')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate a PhonePe refund (admin only)' })
  async createPhonePeRefund(@Body() body: { paymentId: string; amount?: number }) {
    // Look up the payment to get the PhonePe merchant transaction ID
    const paymentRef = await this.paymentService.getPhonePePaymentRef(body.paymentId);
    if (!paymentRef || !paymentRef.merchantTxnId) {
      throw new BadRequestException({
        code: 'NO_PHONEPE_PAYMENT',
        message: 'This payment has no associated PhonePe transaction',
      });
    }
    return this.phonePeService.refundPayment({
      originalTransactionId: paymentRef.merchantTxnId,
      amount: body.amount,
    });
  }

  // ─── GET /payments/:id ───────────────────────────────────────────────────────
  @Get('payments/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Get payment by ID (admin only)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findById(id);
  }

  // ─── GET /sales/:id/payments ──────────────────────────────────────────────────
  @Get('sales/:id/payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'List payments for a sale (admin only)' })
  async findBySaleId(@Param('id', ParseUUIDPipe) saleId: string) {
    return this.paymentService.findBySaleId(saleId);
  }

  // ─── GET /admin/refunds ──────────────────────────────────────────────────────
  @Get('admin/refunds')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.approve')
  @ApiOperation({ summary: 'List cancelled orders needing manual refund action' })
  async findRefundsNeedingAction() {
    return this.paymentService.findRefundsNeedingAction();
  }

  // ─── POST /admin/refunds/:paymentId/retry ────────────────────────────────────
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
