import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OnlineOrderService } from './online-order.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly onlineOrderService: OnlineOrderService) {}

  @Get()
  @RequirePermission('orders.view')
  @ApiOperation({ summary: 'List online orders with pagination' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.onlineOrderService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  @RequirePermission('orders.view')
  @ApiOperation({ summary: 'Get online order by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.onlineOrderService.findById(id);
  }
}
