import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessoryService } from './accessory.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';
import { QueryAccessoryDto } from './dto/query-accessory.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Accessories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller()
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  // ─── POST /accessories ───────────────────────────────────────────────────────

  @Post('accessories')
  @RequirePermission('inventory.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new accessory' })
  async create(
    @Body() dto: CreateAccessoryDto,
    @CurrentUser() user: any,
  ) {
    return this.accessoryService.create(dto, user.sub);
  }

  // ─── GET /accessories ────────────────────────────────────────────────────────

  @Get('accessories')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'List accessories with filters' })
  async findAll(@Query() query: QueryAccessoryDto) {
    return this.accessoryService.findAll(query);
  }

  // ─── GET /accessories/:id ────────────────────────────────────────────────────

  @Get('accessories/:id')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get accessory by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.accessoryService.findById(id);
  }

  // ─── GET /accessories/sku/:sku ───────────────────────────────────────────────

  @Get('accessories/sku/:sku')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get accessory by SKU' })
  async findBySku(@Param('sku') sku: string) {
    return this.accessoryService.findBySku(sku);
  }

  // ─── PATCH /accessories/:id ──────────────────────────────────────────────────

  @Patch('accessories/:id')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Update accessory' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccessoryDto,
  ) {
    return this.accessoryService.update(id, dto);
  }

  // ─── PATCH /accessories/:id/stock ────────────────────────────────────────────

  @Patch('accessories/:id/stock')
  @RequirePermission('inventory.edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust accessory stock' })
  async adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { quantity: number; reason: string },
  ) {
    return this.accessoryService.adjustStock(id, dto.quantity, dto.reason);
  }

  // ─── PATCH /accessories/:id/toggle-online ────────────────────────────────────

  @Patch('accessories/:id/toggle-online')
  @RequirePermission('inventory.edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle accessory online status' })
  async toggleOnline(@Param('id', ParseUUIDPipe) id: string) {
    return this.accessoryService.toggleOnline(id);
  }

  // ─── GET /accessories/low-stock ──────────────────────────────────────────────

  @Get('accessories/low-stock')
  @RequirePermission('inventory.view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get low stock alerts' })
  async getLowStockAlerts() {
    return this.accessoryService.getLowStockAlerts();
  }
}