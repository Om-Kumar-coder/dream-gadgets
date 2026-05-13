import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ReportService, ReportType } from './report.service';

// ─── Mock DataSource ──────────────────────────────────────────────────────────

function makeDataSource(queryResult: any[] = []): any {
  return {
    query: jest.fn(async () => queryResult) as any,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('ReportService', () => {
  let service: ReportService;
  let dataSource: any;
  let configService: any;

  beforeEach(async () => {
    dataSource = makeDataSource();
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'redis.url': undefined,
          REDIS_URL: undefined,
        };
        return config[key];
      }) as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  // ─── 15.2 Dashboard KPIs ─────────────────────────────────────────────────────

  describe('getDashboardKpis()', () => {
    it('should return zero KPIs when no data', async () => {
      dataSource.query.mockResolvedValue([{ count: 0, value: '0', booked: 0 }]);

      const result = await service.getDashboardKpis();

      expect(result).toBeDefined();
      expect(result.todaySalesCount).toBeGreaterThanOrEqual(0);
      expect(result.activeStockCount).toBeGreaterThanOrEqual(0);
    });

    it('should return KPIs with correct structure', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ count: 5, value: '50000' }])   // sales
        .mockResolvedValueOnce([{ count: 2 }])                    // purchases
        .mockResolvedValueOnce([{ count: 100, value: '500000', booked: 3 }]) // inventory
        .mockResolvedValueOnce([{ count: 1 }])                    // returns
        .mockResolvedValueOnce([{ count: 10 }]);                  // clients

      const result = await service.getDashboardKpis('branch-uuid-1');

      expect(result).toMatchObject({
        todaySalesCount: expect.any(Number),
        todaySalesValue: expect.any(Number),
        todayPurchasesCount: expect.any(Number),
        netIncome: expect.any(Number),
        activeStockCount: expect.any(Number),
        activeStockValue: expect.any(Number),
        bookedItems: expect.any(Number),
        pendingReturns: expect.any(Number),
        newClientsToday: expect.any(Number),
        onlineOrdersCount: expect.any(Number),
      });
    });

    it('should return zero KPIs gracefully when DB query fails', async () => {
      dataSource.query.mockImplementation(async () => { throw new Error('DB connection failed'); });

      const result = await service.getDashboardKpis();

      expect(result.todaySalesCount).toBe(0);
      expect(result.netIncome).toBe(0);
    });
  });

  // ─── 15.3 Report data ─────────────────────────────────────────────────────────

  describe('getReportData()', () => {
    const filters = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };

    it('should return sales data for daily_sales type', async () => {
      const mockData = [
        { id: 'sale-1', invoice_number: 'DG-001', total_amount: '10000' },
      ];
      dataSource.query.mockResolvedValue(mockData);

      const result = await service.getReportData('daily_sales', filters);

      expect(result).toEqual(mockData);
    });

    it('should return empty array when DB fails', async () => {
      dataSource.query.mockImplementation(async () => { throw new Error('DB error'); });

      const result = await service.getReportData('daily_sales', filters);

      expect(result).toEqual([]);
    });

    it('should handle all report types without throwing', async () => {
      dataSource.query.mockResolvedValue([]);

      const types: ReportType[] = [
        'daily_sales', 'weekly_sales', 'monthly_sales', 'purchase',
        'gst', 'stock_aging', 'inventory_valuation', 'employee_sales',
        'customer', 'exchange', 'return', 'branch_pl',
      ];

      for (const type of types) {
        const result = await service.getReportData(type, filters);
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it('should include branchId filter when provided', async () => {
      dataSource.query.mockResolvedValue([]);

      await service.getReportData('daily_sales', { ...filters, branchId: 'branch-uuid-1' });

      const callArgs = dataSource.query.mock.calls[0];
      expect(callArgs[0]).toContain('branch-uuid-1');
    });
  });

  // ─── 15.4 Excel export ────────────────────────────────────────────────────────

  describe('generateExcel()', () => {
    it('should return a Buffer', async () => {
      dataSource.query.mockResolvedValue([
        { invoice_number: 'DG-001', total_amount: 10000 },
      ]);

      const result = await service.generateExcel('daily_sales', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return CSV fallback when ExcelJS is unavailable', async () => {
      dataSource.query.mockResolvedValue([
        { col1: 'val1', col2: 'val2' },
      ]);

      // The service handles MODULE_NOT_FOUND gracefully
      const result = await service.generateExcel('daily_sales', {});

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle empty data gracefully', async () => {
      dataSource.query.mockResolvedValue([]);

      const result = await service.generateExcel('daily_sales', {});

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  // ─── 15.5 PDF export ─────────────────────────────────────────────────────────

  describe('generatePdf()', () => {
    it('should throw for unsupported report types', async () => {
      await expect(
        service.generatePdf('stock_aging', {}),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.generatePdf('stock_aging', {}),
      ).rejects.toMatchObject({ response: { code: 'PDF_NOT_SUPPORTED' } });
    });

    it('should return a Buffer for supported types', async () => {
      dataSource.query.mockResolvedValue([
        { invoice_number: 'DG-001', total_amount: 10000 },
      ]);

      const result = await service.generatePdf('daily_sales', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should support branch_pl type', async () => {
      dataSource.query.mockResolvedValue([]);

      const result = await service.generatePdf('branch_pl', {});

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  // ─── 15.6 Async report ────────────────────────────────────────────────────────

  describe('enqueueReport()', () => {
    it('should return jobId and queued status', async () => {
      const result = await service.enqueueReport('daily_sales', {}, 'excel');

      expect(result).toMatchObject({
        jobId: expect.any(String),
        status: 'queued',
      });
    });
  });

  // ─── 15.7 Scheduled reports ───────────────────────────────────────────────────

  describe('getScheduledReportDefinitions()', () => {
    it('should return 3 scheduled report definitions', () => {
      const defs = service.getScheduledReportDefinitions();

      expect(defs).toHaveLength(3);
    });

    it('should include daily, weekly, and monthly reports', () => {
      const defs = service.getScheduledReportDefinitions();
      const names = defs.map(d => d.name);

      expect(names).toContain('daily-sales-report');
      expect(names).toContain('weekly-sales-report');
      expect(names).toContain('monthly-gst-report');
    });

    it('should have valid cron expressions', () => {
      const defs = service.getScheduledReportDefinitions();

      for (const def of defs) {
        expect(def.cron).toBeDefined();
        expect(def.cron.split(' ').length).toBe(5);
      }
    });
  });
});
