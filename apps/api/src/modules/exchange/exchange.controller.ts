import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { QueryExchangeDto } from './dto/query-exchange.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Exchanges')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('exchanges')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post()
  @RequirePermission('exchange.create')
  @ApiOperation({ summary: 'Create a new exchange entry with condition assessment' })
  async create(@Body() dto: CreateExchangeDto, @CurrentUser() user: any) {
    return this.exchangeService.create(dto, user.sub);
  }

  @Get('price-guide')
  @RequirePermission('exchange.view')
  @ApiOperation({ summary: 'Get market price guide per model+condition' })
  async getPriceGuide(@Query('modelId') modelId?: string) {
    return this.exchangeService.getPriceGuide(modelId);
  }

  @Get('price-suggestion')
  @RequirePermission('exchange.view')
  @ApiOperation({ summary: 'Get exchange price suggestion using formula' })
  async suggestPrice(
    @Query('basePrice') basePrice: string,
    @Query('batteryHealth') batteryHealth: string,
    @Query('monthsSinceFirstInvoice') monthsSinceFirstInvoice: string,
  ) {
    return this.exchangeService.suggestPrice({
      basePrice: parseFloat(basePrice),
      batteryHealth: parseInt(batteryHealth, 10),
      monthsSinceFirstInvoice: parseInt(monthsSinceFirstInvoice, 10),
    });
  }

  @Get()
  @RequirePermission('exchange.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List exchanges with optional filters' })
  async findAll(@Query() query: QueryExchangeDto) {
    return this.exchangeService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('exchange.view')
  @ApiOperation({ summary: 'Get exchange by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.exchangeService.findById(id);
  }

  @Patch(':id')
  @RequirePermission('exchange.edit')
  @ApiOperation({ summary: 'Update exchange details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateExchangeDto>,
  ) {
    return this.exchangeService.update(id, dto);
  }

  @Post(':id/add-inventory')
  @RequirePermission('exchange.edit')
  @ApiOperation({ summary: 'Add exchanged device to inventory' })
  async addToInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { branchId: string; boxType?: string; purchasePrice?: number; taxRate?: number },
    @CurrentUser() user: any,
  ) {
    return this.exchangeService.addToInventory(id, { ...body, createdById: user.sub });
  }
}
