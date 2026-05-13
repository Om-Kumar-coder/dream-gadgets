import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── 7.3 Create sale ─────────────────────────────────────────────────────────

  @Post()
  @RequirePermission('sales.create')
  @ApiOperation({ summary: 'Create a new sale (POS)' })
  async create(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.create(dto, user.sub, user.role);
  }

  // ─── 7.6 List sales ──────────────────────────────────────────────────────────

  @Get()
  @RequirePermission('sales.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List sales with optional filters' })
  async findAll(@Query() query: QuerySaleDto) {
    return this.salesService.findAll(query);
  }

  // ─── 7.6 Get sale by ID ──────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Get sale by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findById(id);
  }

  // ─── 7.7 A4 invoice PDF ──────────────────────────────────────────────────────

  @Get(':id/invoice')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Generate A4 GST invoice PDF' })
  async getInvoice(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfBuffer = await this.salesService.generateInvoicePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(HttpStatus.OK).end(pdfBuffer);
  }

  // ─── 7.7 Thermal receipt PDF ─────────────────────────────────────────────────

  @Get(':id/invoice/thermal')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Generate thermal 80mm receipt PDF' })
  async getThermalInvoice(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfBuffer = await this.salesService.generateThermalPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(HttpStatus.OK).end(pdfBuffer);
  }

  // ─── 7.8 Email invoice ───────────────────────────────────────────────────────

  @Post(':id/invoice/email')
  @RequirePermission('sales.view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email invoice to client' })
  async emailInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { email?: string },
  ) {
    return this.salesService.emailInvoice(id, body.email);
  }

  // ─── 7.8 WhatsApp invoice ────────────────────────────────────────────────────

  @Post(':id/invoice/whatsapp')
  @RequirePermission('sales.view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send invoice via WhatsApp' })
  async whatsappInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { phone?: string },
  ) {
    return this.salesService.whatsappInvoice(id, body.phone);
  }

  // ─── 7.9 Void sale ───────────────────────────────────────────────────────────

  @Post(':id/void')
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void a sale (requires sales.approve permission)' })
  async voidSale(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.salesService.voidSale(id, user.sub);
  }

  // ─── 7.10 POS item lock ──────────────────────────────────────────────────────

  @Post('lock-item')
  @RequirePermission('sales.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lock an inventory item in POS cart (15-min TTL)' })
  async lockItem(@Body() body: { itemId: string }) {
    return this.salesService.lockItem(body.itemId);
  }

  @Post('unlock-item')
  @RequirePermission('sales.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock an inventory item from POS cart' })
  async unlockItem(@Body() body: { itemId: string }) {
    return this.salesService.unlockItem(body.itemId);
  }
}
