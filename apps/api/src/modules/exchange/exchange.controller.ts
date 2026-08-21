import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
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
import { BranchScopeGuard } from '../../common/guards/branch-scope.guard';
import { BranchScoped } from '../../common/decorators/branch-scoped.decorator';

@ApiTags('Exchanges')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, BranchScopeGuard)
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

  @Get('price-guide/audits')
  @RequirePermission('exchange.view')
  @ApiOperation({ summary: 'Get price guide change history (audit log)' })
  async getPriceGuideAudits(@Query('limit') limit?: string) {
    const audits = await this.exchangeService.getPriceGuideAudits(limit ? parseInt(limit, 10) : 50);
    // Return the array directly — the global interceptor wraps it as
    // { status, data: [...] } like every other list endpoint. Previously this
    // returned { data: audits }, double-nesting it ({ data: { data: [...] } })
    // which crashed the admin price-guide page ("...map is not a function").
    return audits;
  }

  @Post('price-guide')
  @RequirePermission('exchange.edit')
  @ApiOperation({ summary: 'Create or update a price guide entry (model + condition)' })
  async upsertPriceGuide(
    @Body() body: { modelId: string; condition: string; basePrice: number },
    @CurrentUser() user: any,
  ) {
    if (!body?.modelId || !body?.condition || body?.basePrice == null) {
      throw new BadRequestException({
        code: 'INVALID_PRICE_GUIDE',
        message: 'modelId, condition, and basePrice are required',
      });
    }
    const row = await this.exchangeService.upsertPriceGuide(body.modelId, body.condition, Number(body.basePrice), user.sub);
    return { data: row };
  }

  @Delete('price-guide/:modelId/:condition')
  @RequirePermission('exchange.edit')
  @ApiOperation({ summary: 'Delete a price guide entry (model + condition)' })
  async deletePriceGuide(
    @Param('modelId', ParseUUIDPipe) modelId: string,
    @Param('condition') condition: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.exchangeService.deletePriceGuide(modelId, condition, user.sub);
    return { data: result };
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
  @BranchScoped()
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
