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
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransferDto } from './dto/query-transfer.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @RequirePermission('transfers.create')
  @ApiOperation({ summary: 'Create a new stock transfer' })
  async create(@Body() dto: CreateTransferDto, @CurrentUser() user: any) {
    return this.transferService.create(dto, user.sub);
  }

  @Get()
  @RequirePermission('transfers.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List transfers with optional filters' })
  async findAll(@Query() query: QueryTransferDto) {
    return this.transferService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('transfers.view')
  @ApiOperation({ summary: 'Get transfer by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.transferService.findById(id);
  }

  @Patch(':id/receive')
  @RequirePermission('transfers.edit')
  @ApiOperation({ summary: 'Receive transfer (item-by-item confirmation)' })
  async receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { itemIds: string[] },
    @CurrentUser() user: any,
  ) {
    return this.transferService.receive(id, body.itemIds, user.sub);
  }

  @Patch(':id/reject')
  @RequirePermission('transfers.edit')
  @ApiOperation({ summary: 'Reject transfer with reason' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
  ) {
    return this.transferService.reject(id, body.reason);
  }

  @Get(':id/manifest')
  @RequirePermission('transfers.view')
  @ApiOperation({ summary: 'Generate transfer manifest PDF' })
  async getManifest(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfBuffer = await this.transferService.generateManifestPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="transfer-manifest-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(HttpStatus.OK).end(pdfBuffer);
  }
}
