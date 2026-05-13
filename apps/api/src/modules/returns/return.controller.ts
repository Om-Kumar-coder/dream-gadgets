import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReturnService } from './return.service';
import { CreateSaleReturnDto, CreatePurchaseReturnDto } from './dto/create-return.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Returns')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller()
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  // ─── 11.2 POST /sales/:id/return ─────────────────────────────────────────────

  @Post('sales/:id/return')
  @RequirePermission('sales.approve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a sales return (credit note)' })
  async createSaleReturn(
    @Param('id', ParseUUIDPipe) saleId: string,
    @Body() dto: CreateSaleReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.returnService.createSaleReturn(saleId, dto, user.sub, user.role);
  }

  // ─── 12.1 POST /purchases/:id/return ─────────────────────────────────────────

  @Post('purchases/:id/return')
  @RequirePermission('purchases.edit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a purchase return' })
  async createPurchaseReturn(
    @Param('id', ParseUUIDPipe) purchaseId: string,
    @Body() dto: CreatePurchaseReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.returnService.createPurchaseReturn(purchaseId, dto, user.sub);
  }

  // ─── List returns ─────────────────────────────────────────────────────────────

  @Get('returns')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'List all returns' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('returnType') returnType?: string,
    @Query('originalId') originalId?: string,
  ) {
    return this.returnService.findAll({ page, limit, returnType, originalId });
  }

  // ─── Get return by ID ─────────────────────────────────────────────────────────

  @Get('returns/:id')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Get return by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnService.findById(id);
  }

  // ─── 11.6 / 12.2 Generate return PDF ─────────────────────────────────────────

  @Get('returns/:id/pdf')
  @RequirePermission('sales.view')
  @ApiOperation({ summary: 'Generate return credit note / return note PDF' })
  async getReturnPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfBuffer = await this.returnService.generateReturnPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="return-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(HttpStatus.OK).end(pdfBuffer);
  }
}
