import { Response } from 'express';
import { GstService } from './gst.service';
export declare class GstController {
    private readonly gstService;
    constructor(gstService: GstService);
    getGstr1(from: string, to: string, branchId?: string): Promise<{
        status: string;
        data: import("./gst.service").Gstr1Section;
        summary: import("./gst.service").GstSummary;
    }>;
    exportGstr1(from: string, to: string, res: Response, branchId?: string): Promise<void>;
}
//# sourceMappingURL=gst.controller.d.ts.map