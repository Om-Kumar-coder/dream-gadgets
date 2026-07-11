import { DataSource } from 'typeorm';
export interface Gstr1Section {
    /** B2B invoices — customer has GSTIN */
    b2b: B2bEntry[];
    /** B2C Large — inter-state value > 2.5L, no GSTIN */
    b2cl: B2clEntry[];
    /** B2C Small — aggregated by rate + state */
    b2cs: B2csEntry[];
    /** Credit/Debit notes from returns */
    cdnr: CdnrEntry[];
}
export interface B2bEntry {
    invoiceNumber: string;
    invoiceDate: string;
    customerGstin: string;
    customerName: string;
    placeOfSupply: string;
    supplyType: 'Inter-State' | 'Intra-State';
    items: B2bItem[];
    totalTaxableValue: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalAmount: number;
}
export interface B2bItem {
    hsnCode: string;
    taxableValue: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}
export interface B2clEntry {
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    taxableValue: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
}
export interface B2csEntry {
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
}
export interface CdnrEntry {
    returnNumber: string;
    returnDate: string;
    originalInvoiceNumber: string | null;
    reason: string;
    placeOfSupply: string;
    taxableValue: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    refundAmount: number;
    noteType: 'Credit' | 'Debit';
}
export interface GstSummary {
    totalB2bInvoices: number;
    totalB2bValue: number;
    totalB2clInvoices: number;
    totalB2clValue: number;
    totalB2csValue: number;
    totalCdnrNotes: number;
    totalCdnrValue: number;
    totalTaxableValue: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
}
export declare class GstService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    /**
     * Generate full GSTR-1 data for a date range and optional branch.
     */
    generateGstr1(fromDate: string, toDate: string, branchId?: string): Promise<Gstr1Section>;
    /**
     * Generate summary of GSTR-1 data.
     */
    generateSummary(fromDate: string, toDate: string, branchId?: string): Promise<GstSummary>;
    private getB2b;
    private getB2cl;
    private getB2cs;
    private getCdnr;
    private batchLoadSaleItems;
    private isInterState;
    private getStateCode;
    private computeTaxBreakup;
    generateExcel(fromDate: string, toDate: string, branchId?: string): Promise<Buffer>;
    private styleHeader;
}
//# sourceMappingURL=gst.service.d.ts.map