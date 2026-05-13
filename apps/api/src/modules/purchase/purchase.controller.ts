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
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Purchases')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @RequirePermission('purchases.create')
  @ApiOperation({ summary: 'Create a new purchase and link inventory items' })
  async create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.purchaseService.create(dto, user.sub);
  }

  @Get()
  @RequirePermission('purchases.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List purchases with optional filters' })
  async findAll(@Query() query: QueryPurchaseDto) {
    return this.purchaseService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('purchases.view')
  @ApiOperation({ summary: 'Get purchase by ID (includes linked inventory items)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.findById(id);
  }

  @Patch(':id')
  @RequirePermission('purchases.edit')
  @ApiOperation({ summary: 'Update purchase details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(id, dto);
  }

  @Get(':id/invoice')
  @RequirePermission('purchases.view')
  @ApiOperation({ summary: 'Generate purchase invoice PDF' })
  async getInvoice(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfBuffer = await this.purchaseService.generateInvoicePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="purchase-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(HttpStatus.OK).end(pdfBuffer);
  }
}
