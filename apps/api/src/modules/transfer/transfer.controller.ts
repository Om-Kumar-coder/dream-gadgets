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
  ForbiddenException,
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
import { BranchScopeGuard } from '../../common/guards/branch-scope.guard';
import { BranchScoped } from '../../common/decorators/branch-scoped.decorator';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, BranchScopeGuard)
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @RequirePermission('transfers.create')
  @BranchScoped()
  @ApiOperation({ summary: 'Create a new stock transfer' })
  async create(@Body() dto: CreateTransferDto, @CurrentUser() user: any) {
    // Store isolation (P2-7): BranchScopeGuard only inspects body.branchId,
    // which transfers do not use — they carry fromBranchId/toBranchId. Enforce
    // here with the same cross-branch semantics as BranchScopeGuard: staff with
    // a branch assignment may only ship FROM their own store; owners and
    // cross-branch managers are unrestricted.
    const CROSS_BRANCH_ROLES = new Set(['shop_owner', 'multi_store_manager', 'store_manager']);
    const isCrossBranch = !user?.branchId || CROSS_BRANCH_ROLES.has(user?.role);
    if (!isCrossBranch && dto.fromBranchId !== user.branchId) {
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_VIOLATION',
        message: 'You can only transfer stock out of your assigned branch',
      });
    }
    return this.transferService.create(dto, user.sub);
  }

  @Get()
  @RequirePermission('transfers.view')
  @BranchScoped()
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List transfers with optional filters' })
  async findAll(@Query() query: QueryTransferDto) {
    return this.transferService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('transfers.view')
  @ApiOperation({ summary: 'Get transfer by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const transfer = await this.transferService.findById(id);
    // Store isolation (Phase 3): store-level staff may only view transfers that
    // involve their own branch — as source or as destination. Cross-branch
    // roles (branchId null) pass through, mirroring BranchScopeGuard.
    if (user?.branchId) {
      const involvesOwnBranch =
        transfer.fromBranchId === user.branchId || transfer.toBranchId === user.branchId;
      if (!involvesOwnBranch) {
        throw new ForbiddenException({
          code: 'BRANCH_SCOPE_VIOLATION',
          message: 'You can only access transfers involving your assigned branch',
        });
      }
    }
    return transfer;
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
