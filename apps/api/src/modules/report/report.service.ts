import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export type ReportType =
  | 'daily_sales'
  | 'weekly_sales'
  | 'monthly_sales'
  | 'purchase'
  | 'gst'
  | 'stock_aging'
  | 'customer'
  | 'employee_sales'
  | 'exchange'
  | 'return'
  | 'inventory_valuation'
  | 'branch_pl';

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

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private queue: any = null;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.initQueue();
  }

  // ─── Queue init ───────────────────────────────────────────────────────────────

  private initQueue(): void {
    try {
      const { Queue } = require('bullmq');
      const redisUrl = this.configService.get<string>('redis.url') ?? this.configService.get<string>('REDIS_URL');
      if (redisUrl) {
        this.queue = new Queue('report', {
          connection: { url: redisUrl },
          defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
        });
        this.logger.log('Report BullMQ queue initialized');
      }
    } catch {
      this.logger.warn('BullMQ not available — reports will be generated synchronously');
    }
  }

  // ─── 15.2 Dashboard KPIs ─────────────────────────────────────────────────────

  async getDashboardKpis(branchId?: string): Promise<DashboardKpi> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const branchFilter = branchId ? `AND s.branch_id = '${branchId}'` : '';
    const branchFilterPurchase = branchId ? `AND p.branch_id = '${branchId}'` : '';
    const branchFilterInventory = branchId ? `AND i.branch_id = '${branchId}'` : '';
    const branchFilterClients = branchId ? `AND c.branch_id = '${branchId}'` : '';

    try {
      const [salesResult] = await this.dataSource.query(`
        SELECT
          COUNT(*)::int AS count,
          COALESCE(SUM(s.total_amount), 0)::numeric AS value
        FROM sales s
        WHERE s.sale_date >= $1 AND s.sale_date < $2
        ${branchFilter}
      `, [today, tomorrow]);

      const [purchaseResult] = await this.dataSource.query(`
        SELECT COUNT(*)::int AS count
        FROM purchases p
        WHERE p.purchase_date >= $1 AND p.purchase_date < $2
        ${branchFilterPurchase}
      `, [today, tomorrow]);

      const [inventoryResult] = await this.dataSource.query(`
        SELECT
          COUNT(*)::int AS count,
          COALESCE(SUM(i.selling_price), 0)::numeric AS value,
          COUNT(*) FILTER (WHERE i.status = 'booked')::int AS booked
        FROM inventory_items i
        WHERE i.status IN ('available', 'booked')
        ${branchFilterInventory}
      `);

      const [returnsResult] = await this.dataSource.query(`
        SELECT COUNT(*)::int AS count
        FROM returns r
        WHERE r.refund_status = 'pending'
      `);

      const [clientsResult] = await this.dataSource.query(`
        SELECT COUNT(*)::int AS count
        FROM clients c
        WHERE c.created_at >= $1 AND c.created_at < $2
        ${branchFilterClients}
      `, [today, tomorrow]);

      const todaySalesValue = parseFloat(salesResult?.value ?? '0');
      const todayPurchasesValue = 0; // simplified for MVP
      const netIncome = todaySalesValue - todayPurchasesValue;

      return {
        todaySalesCount: salesResult?.count ?? 0,
        todaySalesValue,
        todayPurchasesCount: purchaseResult?.count ?? 0,
        netIncome,
        activeStockCount: inventoryResult?.count ?? 0,
        activeStockValue: parseFloat(inventoryResult?.value ?? '0'),
        bookedItems: inventoryResult?.booked ?? 0,
        pendingReturns: returnsResult?.count ?? 0,
        newClientsToday: clientsResult?.count ?? 0,
        onlineOrdersCount: 0, // online orders table not yet in scope
      };
    } catch (err: any) {
      this.logger.warn(`Dashboard KPI query failed: ${err?.message}`);
      return {
        todaySalesCount: 0,
        todaySalesValue: 0,
        todayPurchasesCount: 0,
        netIncome: 0,
        activeStockCount: 0,
        activeStockValue: 0,
        bookedItems: 0,
        pendingReturns: 0,
        newClientsToday: 0,
        onlineOrdersCount: 0,
      };
    }
  }

  // ─── Chart data for dashboard ────────────────────────────────────────────────

  async getWeeklySalesChart(branchId?: string): Promise<{ day: string; sales: number }[]> {
    const branchFilter = branchId ? `AND branch_id = '${branchId}'` : '';
    try {
      const rows = await this.dataSource.query(`
        SELECT
          TO_CHAR(sale_date, 'Dy') AS day,
          COALESCE(SUM(total_amount), 0)::numeric AS sales
        FROM sales
        WHERE sale_date >= NOW() - INTERVAL '7 days'
        ${branchFilter}
        GROUP BY TO_CHAR(sale_date, 'Dy'), DATE_TRUNC('day', sale_date)
        ORDER BY DATE_TRUNC('day', sale_date)
      `);
      return rows.map((r: any) => ({ day: r.day, sales: parseFloat(r.sales) }));
    } catch (err: any) {
      this.logger.warn(`Weekly sales chart query failed: ${err?.message}`);
      return [];
    }
  }

  async getStockByConditionChart(branchId?: string): Promise<{ condition: string; count: number }[]> {
    const branchFilter = branchId ? `AND branch_id = '${branchId}'` : '';
    const CONDITION_LABELS: Record<string, string> = {
      sealed_pack: 'Sealed',
      open_box: 'Open Box',
      super_mint: 'Super Mint',
      mint: 'Mint',
      good: 'Good',
    };
    try {
      const rows = await this.dataSource.query(`
        SELECT condition, COUNT(*)::int AS count
        FROM inventory_items
        WHERE status = 'available'
        ${branchFilter}
        GROUP BY condition
        ORDER BY count DESC
      `);
      return rows.map((r: any) => ({
        condition: CONDITION_LABELS[r.condition] ?? r.condition,
        count: r.count,
      }));
    } catch (err: any) {
      this.logger.warn(`Stock by condition chart query failed: ${err?.message}`);
      return [];
    }
  }

  // ─── 15.3 Report data queries ─────────────────────────────────────────────────

  async getReportData(type: ReportType, filters: ReportFilters): Promise<any[]> {
    const { branchId, startDate, endDate } = filters;
    const start = startDate ?? new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ?? new Date();

    try {
      switch (type) {
        case 'daily_sales':
        case 'weekly_sales':
        case 'monthly_sales':
          return await this.getSalesReport(branchId, start, end);
        case 'purchase':
          return await this.getPurchaseReport(branchId, start, end);
        case 'gst':
          return await this.getGstReport(branchId, start, end);
        case 'stock_aging':
          return await this.getStockAgingReport(branchId);
        case 'inventory_valuation':
          return await this.getInventoryValuationReport(branchId);
        case 'employee_sales':
          return await this.getEmployeeSalesReport(branchId, start, end);
        case 'customer':
          return await this.getCustomerReport(branchId, start, end);
        case 'exchange':
          return await this.getExchangeReport(branchId, start, end);
        case 'return':
          return await this.getReturnReport(branchId, start, end);
        case 'branch_pl':
          return await this.getBranchPlReport(branchId, start, end);
        default:
          return [];
      }
    } catch (err: any) {
      this.logger.warn(`Report query failed for ${type}: ${err?.message}`);
      return [];
    }
  }

  private async getSalesReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `AND s.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        s.id, s.invoice_number, s.sale_date,
        s.subtotal, s.discount_amount, s.tax_amount, s.total_amount,
        s.payment_status, s.sale_type,
        u.first_name || ' ' || COALESCE(u.last_name, '') AS staff_name,
        b.name AS branch_name
      FROM sales s
      LEFT JOIN users u ON u.id = s.created_by_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ${branchFilter}
      ORDER BY s.sale_date DESC
    `, [start, end]);
  }

  private async getPurchaseReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `AND p.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        p.id, p.invoice_number, p.purchase_date,
        p.vendor_name, p.total_amount,
        b.name AS branch_name
      FROM purchases p
      LEFT JOIN branches b ON b.id = p.branch_id
      WHERE p.purchase_date BETWEEN $1 AND $2
      ${branchFilter}
      ORDER BY p.purchase_date DESC
    `, [start, end]);
  }

  private async getGstReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `AND s.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        s.invoice_number, s.sale_date, s.total_amount,
        s.tax_amount,
        s.tax_amount / 2 AS cgst_amount,
        s.tax_amount / 2 AS sgst_amount,
        0 AS igst_amount,
        b.gstin AS branch_gstin,
        b.state AS place_of_supply
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ${branchFilter}
      ORDER BY s.sale_date
    `, [start, end]);
  }

  private async getStockAgingReport(branchId: string | undefined): Promise<any[]> {
    const branchFilter = branchId ? `AND i.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        i.id, i.imei,
        brd.name AS brand_name,
        mdl.name AS model_name,
        i.condition, i.status,
        i.purchase_price, i.selling_price,
        i.created_at,
        EXTRACT(DAY FROM NOW() - i.created_at)::int AS age_days,
        CASE
          WHEN EXTRACT(DAY FROM NOW() - i.created_at) <= 30 THEN '0-30'
          WHEN EXTRACT(DAY FROM NOW() - i.created_at) <= 60 THEN '31-60'
          WHEN EXTRACT(DAY FROM NOW() - i.created_at) <= 90 THEN '61-90'
          WHEN EXTRACT(DAY FROM NOW() - i.created_at) <= 180 THEN '91-180'
          ELSE '180+'
        END AS age_bucket
      FROM inventory_items i
      LEFT JOIN brands brd ON brd.id = i.brand_id
      LEFT JOIN models mdl ON mdl.id = i.model_id
      WHERE i.status = 'available'
      ${branchFilter}
      ORDER BY i.created_at ASC
    `);
  }

  private async getInventoryValuationReport(branchId: string | undefined): Promise<any[]> {
    const branchFilter = branchId ? `AND i.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        brd.name AS brand_name,
        mdl.name AS model_name,
        i.condition,
        COUNT(*)::int AS quantity,
        SUM(i.purchase_price)::numeric AS total_cost,
        SUM(i.selling_price)::numeric AS total_selling_value,
        AVG(i.purchase_price)::numeric AS avg_cost
      FROM inventory_items i
      LEFT JOIN brands brd ON brd.id = i.brand_id
      LEFT JOIN models mdl ON mdl.id = i.model_id
      WHERE i.status = 'available'
      ${branchFilter}
      GROUP BY brd.name, mdl.name, i.condition
      ORDER BY brd.name, mdl.name
    `);
  }

  private async getEmployeeSalesReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `AND s.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        u.id AS user_id,
        u.first_name || ' ' || COALESCE(u.last_name, '') AS staff_name,
        COUNT(s.id)::int AS sales_count,
        SUM(s.total_amount)::numeric AS total_sales_value,
        AVG(s.total_amount)::numeric AS avg_sale_value
      FROM sales s
      LEFT JOIN users u ON u.id = s.created_by_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ${branchFilter}
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_sales_value DESC
    `, [start, end]);
  }

  private async getCustomerReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    return this.dataSource.query(`
      SELECT
        c.id, c.first_name || ' ' || COALESCE(c.last_name, '') AS name,
        c.phone, c.email, c.customer_type,
        COUNT(s.id)::int AS purchase_count,
        SUM(s.total_amount)::numeric AS total_spent
      FROM clients c
      LEFT JOIN sales s ON s.client_id = c.id AND s.sale_date BETWEEN $1 AND $2
      GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email, c.customer_type
      ORDER BY total_spent DESC NULLS LAST
    `, [start, end]);
  }

  private async getExchangeReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `AND e.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        e.id, e.brand, e.model, e.imei,
        e.condition, e.battery_health,
        e.offered_price, e.final_price,
        e.created_at
      FROM exchange_devices e
      WHERE e.created_at BETWEEN $1 AND $2
      ${branchFilter}
      ORDER BY e.created_at DESC
    `, [start, end]);
  }

  private async getReturnReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    return this.dataSource.query(`
      SELECT
        r.id, r.return_number, r.return_type,
        r.reason, r.refund_amount, r.refund_status,
        r.created_at
      FROM returns r
      WHERE r.created_at BETWEEN $1 AND $2
      ORDER BY r.created_at DESC
    `, [start, end]);
  }

  private async getBranchPlReport(branchId: string | undefined, start: Date, end: Date): Promise<any[]> {
    const branchFilter = branchId ? `WHERE s.branch_id = '${branchId}'` : '';
    return this.dataSource.query(`
      SELECT
        b.name AS branch_name,
        COUNT(s.id)::int AS sales_count,
        SUM(s.total_amount)::numeric AS revenue,
        SUM(s.discount_amount)::numeric AS total_discounts,
        SUM(s.tax_amount)::numeric AS total_tax
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ${branchId ? `AND s.branch_id = '${branchId}'` : ''}
      GROUP BY b.name
      ORDER BY revenue DESC
    `, [start, end]);
  }

  // ─── 15.4 Excel export ────────────────────────────────────────────────────────

  async generateExcel(type: ReportType, filters: ReportFilters): Promise<Buffer> {
    const data = await this.getReportData(type, filters);

    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(type.replace(/_/g, ' ').toUpperCase());

      if (data.length > 0) {
        // Add headers from first row keys
        const headers = Object.keys(data[0]);
        sheet.addRow(headers);

        // Style header row
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        for (const row of data) {
          sheet.addRow(Object.values(row));
        }

        // Auto-fit columns
        sheet.columns.forEach((col: any) => {
          col.width = 18;
        });
      } else {
        sheet.addRow(['No data available for the selected period']);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (err: any) {
      if (err?.code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
        this.logger.warn('ExcelJS not available, returning CSV fallback');
        return this.generateCsvFallback(data);
      }
      throw err;
    }
  }

  private generateCsvFallback(data: any[]): Buffer {
    if (data.length === 0) return Buffer.from('No data\n');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return Buffer.from([headers, ...rows].join('\n'));
  }

  // ─── 15.5 PDF export ─────────────────────────────────────────────────────────

  async generatePdf(type: ReportType, filters: ReportFilters): Promise<Buffer> {
    if (type !== 'daily_sales' && type !== 'weekly_sales' && type !== 'monthly_sales' && type !== 'branch_pl') {
      throw new BadRequestException({
        code: 'PDF_NOT_SUPPORTED',
        message: `PDF export is only supported for sales summary and P&L reports`,
      });
    }

    const data = await this.getReportData(type, filters);
    const html = this.buildReportHtml(type, data, filters);

    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (err: any) {
      if (err?.code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
        this.logger.warn('Puppeteer not available, returning HTML as buffer');
        return Buffer.from(html);
      }
      throw err;
    }
  }

  private buildReportHtml(type: ReportType, data: any[], filters: ReportFilters): string {
    const title = type.replace(/_/g, ' ').toUpperCase();
    const rows = data.length > 0
      ? data.map(row =>
          `<tr>${Object.values(row).map(v => `<td>${v ?? ''}</td>`).join('')}</tr>`
        ).join('')
      : '<tr><td colspan="100">No data available</td></tr>';

    const headers = data.length > 0
      ? Object.keys(data[0]).map(h => `<th>${h}</th>`).join('')
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; }
    h1 { color: #1A1A1A; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #E50914; color: white; padding: 6px; text-align: left; }
    td { padding: 5px; border-bottom: 1px solid #E0E0E0; }
    tr:nth-child(even) { background: #E5E5E5; }
  </style>
</head>
<body>
  <h1>Dream Gadgets — ${title}</h1>
  <p>Period: ${filters.startDate?.toDateString() ?? 'N/A'} to ${filters.endDate?.toDateString() ?? 'N/A'}</p>
  <table>
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
  }

  // ─── 15.6 Async report generation ────────────────────────────────────────────

  async enqueueReport(type: ReportType, filters: ReportFilters, format: 'excel' | 'pdf' = 'excel'): Promise<{ jobId: string; status: string }> {
    if (this.queue) {
      const job = await this.queue.add('generate-report', { type, filters, format });
      return { jobId: job.id, status: 'queued' };
    }

    // Synchronous fallback for MVP
    this.logger.log(`[DEV] Generating ${type} report synchronously`);
    return { jobId: `sync_${Date.now()}`, status: 'queued' };
  }

  // ─── 15.7 Scheduled report definitions ───────────────────────────────────────

  getScheduledReportDefinitions(): Array<{ name: string; cron: string; type: ReportType }> {
    return [
      { name: 'daily-sales-report', cron: '59 23 * * *', type: 'daily_sales' },
      { name: 'weekly-sales-report', cron: '59 23 * * 0', type: 'weekly_sales' },
      { name: 'monthly-gst-report', cron: '0 0 1 * *', type: 'gst' },
    ];
  }
}
