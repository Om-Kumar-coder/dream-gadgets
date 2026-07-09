import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coupons')
@Controller()
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ─── Public: Validate a coupon code ──────────────────────────────────────────

  @Post('coupons/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code against a cart subtotal' })
  async validate(@Body() dto: ValidateCouponDto) {
    return this.couponService.validate(dto);
  }

  // ─── Admin CRUD ──────────────────────────────────────────────────────────────

  @Post('admin/coupons')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new coupon' })
  async create(@Body() dto: CreateCouponDto, @CurrentUser() user: any) {
    return this.couponService.create(dto, user.sub);
  }

  @Get('admin/coupons')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all coupons' })
  async findAll(@Query() query: QueryCouponDto) {
    return this.couponService.findAll(query);
  }

  @Get('admin/coupons/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.findById(id);
  }

  @Patch('admin/coupons/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a coupon' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Patch('admin/coupons/:id/toggle')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.create')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle coupon active status' })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.toggleActive(id);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('sales.create')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a coupon' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.couponService.remove(id);
  }
}
