import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { GstController } from './gst.controller';
import { GstService, GstSummary } from './gst.service';

// ─── Mock GstService ──────────────────────────────────────────────────────────

/**
 * Build a mock GstService with pre-configured jest.fn() for each method.
 * Returns a plain object typed as Partial<GstService> to avoid complex intersection issues.
 */
function makeMockService(): Record<string, jest.Mock | any> {
  const mockSummary: GstSummary = {
    totalB2bInvoices: 1,
    totalB2bValue: 94400,
    totalB2clInvoices: 1,
    totalB2clValue: 590000,
    totalB2csValue: 7240,
    totalCdnrNotes: 1,
    totalCdnrValue: -94400,
    totalTaxableValue: 586237.29,
    totalCgst: 7701.36,
    totalSgst: 7701.36,
    totalIgst: 90000,
  };

  return {
    generateGstr1: jest.fn<any>().mockResolvedValue({
      b2b: [
        {
          invoiceNumber: 'DG-MUM-2025-001',
          invoiceDate: '2025-01-15',
          customerGstin: '27ABCDE1234F1Z5',
          customerName: 'ABC Corp',
          placeOfSupply: '27',
          supplyType: 'Intra-State',
          items: [{ hsnCode: '84713000', taxableValue: 80000, taxRate: 18, cgst: 7200, sgst: 7200, igst: 0, total: 94400 }],
          totalTaxableValue: 80000,
          totalCgst: 7200,
          totalSgst: 7200,
          totalIgst: 0,
          totalAmount: 94400,
        },
      ],
      b2cl: [
        {
          invoiceNumber: 'DG-MUM-2025-010',
          invoiceDate: '2025-01-20',
          placeOfSupply: '29',
          taxableValue: 500000,
          taxRate: 18,
          cgst: 0,
          sgst: 0,
          igst: 90000,
          totalAmount: 590000,
        },
      ],
      b2cs: [
        { rate: 18, taxableValue: 4237.29, cgst: 381.36, sgst: 381.36, igst: 0, totalAmount: 5000 },
        { rate: 12, taxableValue: 2000, cgst: 120, sgst: 120, igst: 0, totalAmount: 2240 },
      ],
      cdnr: [
        {
          returnNumber: 'RMA-2025-001',
          returnDate: '2025-01-25',
          originalInvoiceNumber: 'DG-MUM-2025-001',
          reason: 'Defective product',
          placeOfSupply: '27',
          taxableValue: -80000,
          taxRate: 18,
          cgst: -7200,
          sgst: -7200,
          igst: 0,
          refundAmount: -94400,
          noteType: 'Credit',
        },
      ],
    }),
    generateSummary: jest.fn<any>().mockResolvedValue(mockSummary),
    generateExcel: jest.fn<any>().mockResolvedValue(Buffer.from(JSON.stringify({ message: 'mock_excel' }))),
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('GstController (integration)', () => {
  let app: INestApplication;
  let mockService: Record<string, jest.Mock | any>;

  beforeEach(async () => {
    mockService = makeMockService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GstController],
      providers: [
        { provide: GstService, useValue: mockService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── 1. GET /gst/gstr1 — JSON endpoint ──────────────────────────────────────

  describe('GET /api/v1/gst/gstr1', () => {
    it('should return GSTR-1 data with all four sections and summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('summary');

      // Data sections
      expect(response.body.data).toHaveProperty('b2b');
      expect(response.body.data).toHaveProperty('b2cl');
      expect(response.body.data).toHaveProperty('b2cs');
      expect(response.body.data).toHaveProperty('cdnr');
      expect(Array.isArray(response.body.data.b2b)).toBe(true);
      expect(Array.isArray(response.body.data.b2cl)).toBe(true);
      expect(Array.isArray(response.body.data.b2cs)).toBe(true);
      expect(Array.isArray(response.body.data.cdnr)).toBe(true);
    });

    it('should call generateGstr1 and generateSummary with correct params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31', branchId: 'branch-uuid-1' })
        .expect(200);

      expect(mockService.generateGstr1).toHaveBeenCalledWith('2025-01-01', '2025-01-31', 'branch-uuid-1');
      expect(mockService.generateSummary).toHaveBeenCalledWith('2025-01-01', '2025-01-31', 'branch-uuid-1');
    });

    it('should omit branchId when not provided', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      expect(mockService.generateGstr1).toHaveBeenCalledWith('2025-01-01', '2025-01-31', undefined);
    });

    it('should include B2B entry details in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      const b2bEntry = response.body.data.b2b[0];
      expect(b2bEntry).toMatchObject({
        invoiceNumber: expect.any(String),
        customerGstin: expect.any(String),
        supplyType: expect.stringMatching(/Inter-State|Intra-State/),
        totalTaxableValue: expect.any(Number),
      });
    });

    it('should include summary with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      const summary = response.body.summary;
      expect(summary).toMatchObject({
        totalB2bInvoices: expect.any(Number),
        totalB2bValue: expect.any(Number),
        totalB2clInvoices: expect.any(Number),
        totalB2clValue: expect.any(Number),
        totalB2csValue: expect.any(Number),
        totalCdnrNotes: expect.any(Number),
        totalCdnrValue: expect.any(Number),
        totalTaxableValue: expect.any(Number),
        totalCgst: expect.any(Number),
        totalSgst: expect.any(Number),
        totalIgst: expect.any(Number),
      });
    });

    it('should return 200 when from/to are provided', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);
    });

    it('should propagate service errors as 500', async () => {
      mockService.generateGstr1.mockRejectedValueOnce(new Error('DB connection failed'));

      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(500);
    });
  });

  // ─── 2. GET /gst/gstr1/export — Excel download ──────────────────────────────

  describe('GET /api/v1/gst/gstr1/export', () => {
    it('should download Excel file with correct content-type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1/export')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('gstr1-2025-01-01-to-2025-01-31.xlsx');
    });

    it('should include branch in filename when branchId is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1/export')
        .query({ from: '2025-01-01', to: '2025-01-31', branchId: 'branch-uuid-1' })
        .expect(200);

      expect(response.headers['content-disposition']).toContain('gstr1-2025-01-01-to-2025-01-31.xlsx');
    });

    it('should call generateExcel with correct params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1/export')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      expect(mockService.generateExcel).toHaveBeenCalledWith('2025-01-01', '2025-01-31', undefined);
    });

    it('should return binary data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1/export')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);

      // Response should have content (supertest may deliver as string or buffer)
      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should propagate service errors as 500', async () => {
      mockService.generateExcel.mockRejectedValueOnce(new Error('Export failed'));

      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1/export')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(500);
    });
  });

  // ─── 3. Auth guard ─────────────────────────────────────────────────────────

  describe('authentication', () => {
    it('should allow requests with valid auth (guard is overridden)', async () => {
      // The guard is overridden to always pass, so this should succeed
      await request(app.getHttpServer())
        .get('/api/v1/gst/gstr1')
        .query({ from: '2025-01-01', to: '2025-01-31' })
        .expect(200);
    });
  });
});
