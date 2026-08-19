import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ReportService, ReportType, ReportFilters } from './report.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@dream-gadgets/shared-types';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Dashboard KPIs — scoped by user role.
   * Owner (branchId=null in JWT): sees business-wide data including net income.
   * Branch user: sees only their branch's operational data; net income is zeroed.
   */
  @Get('dashboard')
  @RequirePermission('reports.view')
  async getDashboard(@CurrentUser() user: JwtPayload, @Query('branchId') queryBranchId?: string) {
    // Backend enforces branch scope: non-owners cannot request other branches' data
    const isOwner = !user.branchId;
    const branchId = isOwner ? (queryBranchId || undefined) : (user.branchId ?? undefined);
    const kpis = await this.reportService.getDashboardKpis(branchId);
    // Non-owners should not see business-wide net income
    if (!isOwner) {
      kpis.netIncome = 0;
    }
    return { status: 'success', data: kpis };
  }

  @Get('weekly-sales')
  @RequirePermission('reports.view')
  async getWeeklySales(@CurrentUser() user: JwtPayload, @Query('branchId') queryBranchId?: string) {
    const isOwner = !user.branchId;
    const branchId = isOwner ? (queryBranchId || undefined) : (user.branchId ?? undefined);
    const data = await this.reportService.getWeeklySalesChart(branchId);
    return { status: 'success', data };
  }

  @Get('stock-by-condition')
  @RequirePermission('reports.view')
  async getStockByCondition(@CurrentUser() user: JwtPayload, @Query('branchId') queryBranchId?: string) {
    const isOwner = !user.branchId;
    const branchId = isOwner ? (queryBranchId || undefined) : (user.branchId ?? undefined);
    const data = await this.reportService.getStockByConditionChart(branchId);
    return { status: 'success', data };
  }

  // GET /reports/:type/excel
  @Get(':type/excel')
  @RequirePermission('reports.export')
  async downloadExcel(
    @Param('type') type: ReportType,
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const filters: ReportFilters = {
      branchId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.reportService.generateExcel(type, filters);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${type}-report.xlsx"`,
    });
    res.send(buffer);
  }

  // GET /reports/:type/pdf
  @Get(':type/pdf')
  @RequirePermission('reports.export')
  async downloadPdf(
    @Param('type') type: ReportType,
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const filters: ReportFilters = {
      branchId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.reportService.generatePdf(type, filters);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${type}-report.pdf"`,
    });
    res.send(buffer);
  }

  // GET /reports/:type/async
  @Get(':type/async')
  @RequirePermission('reports.view')
  async enqueueReport(
    @Param('type') type: ReportType,
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'excel' | 'pdf' = 'excel',
  ) {
    const filters: ReportFilters = {
      branchId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await this.reportService.enqueueReport(type, filters, format);
    return { status: 'success', data: result };
  }
}
