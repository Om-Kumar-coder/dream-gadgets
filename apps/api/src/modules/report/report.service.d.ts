import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export type ReportType = 'daily_sales' | 'weekly_sales' | 'monthly_sales' | 'purchase' | 'gst' | 'stock_aging' | 'customer' | 'employee_sales' | 'exchange' | 'return' | 'inventory_valuation' | 'branch_pl';
export interface ReportFilters {
    branchId?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
}
export interface DashboardKpi {
    todaySalesCount: number;
    todaySalesValue: number;
    todayPurchasesCount: number;
    netIncome: number;
    activeStockCount: number;
    activeStockValue: number;
    bookedItems: number;
    pendingReturns: number;
    newClientsToday: number;
    onlineOrdersCount: number;
}
export declare class ReportService {
    private dataSource;
    private configService;
    private readonly logger;
    private queue;
    constructor(dataSource: DataSource, configService: ConfigService);
    private initQueue;
    getDashboardKpis(branchId?: string): Promise<DashboardKpi>;
    getWeeklySalesChart(branchId?: string): Promise<{
        day: string;
        sales: number;
    }[]>;
    getStockByConditionChart(branchId?: string): Promise<{
        condition: string;
        count: number;
    }[]>;
    getReportData(type: ReportType, filters: ReportFilters): Promise<any[]>;
    private getSalesReport;
    private getPurchaseReport;
    private getGstReport;
    private getStockAgingReport;
    private getInventoryValuationReport;
    private getEmployeeSalesReport;
    private getCustomerReport;
    private getExchangeReport;
    private getReturnReport;
    private getBranchPlReport;
    generateExcel(type: ReportType, filters: ReportFilters): Promise<Buffer>;
    private generateCsvFallback;
    generatePdf(type: ReportType, filters: ReportFilters): Promise<Buffer>;
    private buildReportHtml;
    enqueueReport(type: ReportType, filters: ReportFilters, format?: 'excel' | 'pdf'): Promise<{
        jobId: string;
        status: string;
    }>;
    getScheduledReportDefinitions(): Array<{
        name: string;
        cron: string;
        type: ReportType;
    }>;
}
//# sourceMappingURL=report.service.d.ts.map