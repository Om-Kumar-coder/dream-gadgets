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

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // GET /reports/dashboard
  @Get('dashboard')
  async getDashboard(@Query('branchId') branchId?: string) {
    const kpis = await this.reportService.getDashboardKpis(branchId);
    return { status: 'success', data: kpis };
  }

  // GET /reports/weekly-sales — last 7 days sales per day for chart
  @Get('weekly-sales')
  async getWeeklySales(@Query('branchId') branchId?: string) {
    const data = await this.reportService.getWeeklySalesChart(branchId);
    return { status: 'success', data };
  }

  // GET /reports/stock-by-condition — inventory count grouped by condition
  @Get('stock-by-condition')
  async getStockByCondition(@Query('branchId') branchId?: string) {
    const data = await this.reportService.getStockByConditionChart(branchId);
    return { status: 'success', data };
  }

  // GET /reports/:type/excel
  @Get(':type/excel')
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
