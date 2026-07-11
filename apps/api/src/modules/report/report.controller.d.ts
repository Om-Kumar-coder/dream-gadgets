import { Response } from 'express';
import { ReportService, ReportType } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    getDashboard(branchId?: string): Promise<{
        status: string;
        data: import("./report.service").DashboardKpi;
    }>;
    getWeeklySales(branchId?: string): Promise<{
        status: string;
        data: {
            day: string;
            sales: number;
        }[];
    }>;
    getStockByCondition(branchId?: string): Promise<{
        status: string;
        data: {
            condition: string;
            count: number;
        }[];
    }>;
    downloadExcel(type: ReportType, branchId: string, startDate: string, endDate: string, res: Response): Promise<void>;
    downloadPdf(type: ReportType, branchId: string, startDate: string, endDate: string, res: Response): Promise<void>;
    enqueueReport(type: ReportType, branchId: string, startDate: string, endDate: string, format?: 'excel' | 'pdf'): Promise<{
        status: string;
        data: {
            jobId: string;
            status: string;
        };
    }>;
}
//# sourceMappingURL=report.controller.d.ts.map