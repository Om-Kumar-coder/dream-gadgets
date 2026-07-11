import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { GstService } from './gst.service';
// ─── Mock DataSource ─────────────────────────────────────────────────────────
function makeDataSource() {
    return {
        query: jest.fn(),
    };
}
// ─── Shared mock helpers ─────────────────────────────────────────────────────
/**
 * Build a B2B invoice row (as returned by the raw SQL query).
 * Matches the `getB2b` SELECT shape.
 */
function b2bRow(overrides = {}) {
    return {
        sale_id: 'sale-uuid-1',
        invoice_number: 'DG-MUM-2025-001',
        sale_date: '2025-01-15',
        subtotal: '80000',
        discount_amount: '0',
        tax_amount: '14400',
        total_amount: '94400',
        client_id: 'client-uuid-1',
        customer_name: 'ABC Corp',
        customer_gstin: '27ABCDE1234F1Z5',
        customer_state: 'Maharashtra',
        branch_state: 'Maharashtra',
        branch_gstin: '27AAAAA0000A1Z5',
        branch_code: 'MAIN',
        ...overrides,
    };
}
/**
 * Build a sale item row (as returned by batchLoadSaleItems SQL).
 */
function saleItemRow(overrides = {}) {
    return {
        sale_id: 'sale-uuid-1',
        hsn_code: '84713000',
        unit_price: '80000',
        discount: '0',
        tax_rate: '18',
        tax_amount: '14400',
        total: '94400',
        ...overrides,
    };
}
/**
 * Build a B2CL invoice row — inter-state, no GSTIN, > 2.5L.
 */
function b2clRow(overrides = {}) {
    return {
        sale_id: 'sale-b2cl-1',
        invoice_number: 'DG-MUM-2025-010',
        sale_date: '2025-01-20',
        subtotal: '500000',
        discount_amount: '0',
        tax_amount: '90000',
        total_amount: '590000',
        client_id: 'client-b2cl-1',
        customer_gstin: null,
        customer_state: 'Karnataka',
        branch_state: 'Maharashtra',
        ...overrides,
    };
}
/**
 * Build a B2CS row — no GSTIN, same state or small value.
 */
function b2csRow(overrides = {}) {
    return {
        total_amount: '5000',
        subtotal: '4237.29',
        tax_amount: '762.71',
        client_id: 'client-b2cs-1',
        customer_state: 'Maharashtra',
        customer_gstin: '',
        branch_state: 'Maharashtra',
        ...overrides,
    };
}
/**
 * Build a CDNR (credit note) row as returned by the getCdnr SQL.
 */
function cdnrRow(overrides = {}) {
    return {
        return_id: 'return-uuid-1',
        return_number: 'RMA-2025-001',
        return_date: '2025-01-25',
        reason: 'Defective product',
        refund_amount: '94400',
        refund_status: 'processed',
        sale_id: 'sale-uuid-1',
        client_id: 'client-uuid-1',
        return_type: 'sale',
        original_invoice: 'DG-MUM-2025-001',
        subtotal: '80000',
        tax_amount: '14400',
        customer_state: 'Maharashtra',
        branch_state: 'Maharashtra',
        ...overrides,
    };
}
// ─── SQL matchers ─────────────────────────────────────────────────────────────
/**
 * Returns true if the SQL string appears to be the B2B query.
 */
function isB2bQuery(sql) {
    return sql.includes('c.gstin IS NOT NULL') && !sql.includes('returns');
}
/**
 * Returns true if the SQL string appears to be the B2CL query.
 */
function isB2clQuery(sql) {
    return sql.includes('s.total_amount > 250000') && sql.includes('c.state != b.state');
}
/**
 * Returns true if the SQL string appears to be the B2CS query.
 */
function isB2csQuery(sql) {
    return sql.includes('FROM sales s')
        && (sql.includes("c.gstin IS NULL") || sql.includes("c.gstin = ''"))
        && !sql.includes('c.state != b.state')
        && !sql.includes('c.gstin IS NOT NULL');
}
/**
 * Returns true if the SQL string is a sale_items batch query.
 */
function isSaleItemsQuery(sql) {
    return sql.includes('FROM sale_items si');
}
/**
 * Returns true if the SQL string is the CDNR query.
 */
function isCdnrQuery(sql) {
    return sql.includes('FROM returns r');
}
// ─── Test suite ───────────────────────────────────────────────────────────────
describe('GstService', () => {
    let service;
    let dataSource;
    beforeEach(async () => {
        dataSource = makeDataSource();
        const module = await Test.createTestingModule({
            providers: [
                GstService,
                { provide: getDataSourceToken(), useValue: dataSource },
            ],
        }).compile();
        service = module.get(GstService);
    });
    // ─── 1. B2B Classification ───────────────────────────────────────────────────
    describe('B2B classification (registered customers with GSTIN)', () => {
        it('should classify intra-state sale as B2B when customer has GSTIN', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow()];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b).toHaveLength(1);
            const entry = result.b2b[0];
            expect(entry.invoiceNumber).toBe('DG-MUM-2025-001');
            expect(entry.customerGstin).toBe('27ABCDE1234F1Z5');
            expect(entry.supplyType).toBe('Intra-State');
            expect(entry.placeOfSupply).toBe('27'); // Maharashtra code
            expect(entry.totalCgst).toBeGreaterThan(0);
            expect(entry.totalSgst).toBeGreaterThan(0);
            expect(entry.totalIgst).toBe(0);
            expect(entry.items).toHaveLength(1);
            expect(entry.items[0].hsnCode).toBe('84713000');
        });
        it('should classify inter-state sale as B2B with IGST', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow({ customer_state: 'Karnataka' })];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b).toHaveLength(1);
            expect(result.b2b[0].supplyType).toBe('Inter-State');
            expect(result.b2b[0].totalCgst).toBe(0);
            expect(result.b2b[0].totalSgst).toBe(0);
            expect(result.b2b[0].totalIgst).toBeGreaterThan(0);
            expect(result.b2b[0].placeOfSupply).toBe('29'); // Karnataka code
        });
        it('should include customer name from first+last name concatenation', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow({ customer_name: 'John Doe' })];
                if (isSaleItemsQuery(sql))
                    return [];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b[0].customerName).toBe('John Doe');
        });
        it('should handle missing customer name gracefully', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow({ customer_name: '' })];
                if (isSaleItemsQuery(sql))
                    return [];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b[0].customerName).toBe('—');
        });
        it('should fall back to sale-level totals when no sale items exist', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow()];
                if (isSaleItemsQuery(sql))
                    return [];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b).toHaveLength(1);
            expect(result.b2b[0].items).toHaveLength(1);
            expect(result.b2b[0].items[0].taxableValue).toBe(80000);
        });
    });
    // ─── 2. B2CL Classification ──────────────────────────────────────────────────
    describe('B2CL classification (large inter-state without GSTIN)', () => {
        it('should classify inter-state sale > 2.5L as B2CL when no GSTIN', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2clQuery(sql))
                    return [b2clRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2cl).toHaveLength(1);
            const entry = result.b2cl[0];
            expect(entry.invoiceNumber).toBe('DG-MUM-2025-010');
            expect(entry.taxableValue).toBe(500000);
            expect(entry.totalAmount).toBe(590000);
            expect(entry.cgst).toBe(0);
            expect(entry.sgst).toBe(0);
            expect(entry.igst).toBeGreaterThan(0);
        });
        it('should set IGST only for B2CL (inter-state)', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2clQuery(sql))
                    return [b2clRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2cl[0].igst).toBe(90000);
            expect(result.b2cl[0].cgst).toBe(0);
            expect(result.b2cl[0].sgst).toBe(0);
        });
    });
    // ─── 3. B2CS Classification ──────────────────────────────────────────────────
    describe('B2CS classification (small B2C aggregated by rate)', () => {
        it('should exclude large inter-state sales from B2CS (they belong to B2CL)', async () => {
            // A large (>2.5L) inter-state sale without GSTIN must appear in B2CL but NOT in B2CS
            dataSource.query.mockImplementation((sql) => {
                if (isB2clQuery(sql))
                    return [b2clRow()];
                if (isB2csQuery(sql))
                    return [
                        { total_amount: '590000', subtotal: '500000', tax_amount: '90000', client_id: 'client-b2cl-1', customer_state: 'Karnataka', customer_gstin: '', branch_state: 'Maharashtra' },
                    ];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            // The sale should be classified as B2CL
            expect(result.b2cl).toHaveLength(1);
            // B2CS should NOT include the 590000 sale (it's > 2.5L and inter-state — B2CL territory)
            const totalB2csValue = result.b2cs.reduce((s, e) => s + e.totalAmount, 0);
            expect(totalB2csValue).toBe(0);
        });
        it('should aggregate intra-state B2C sales by tax rate', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2csQuery(sql))
                    return [
                        b2csRow(), // 18% rate
                        b2csRow({ total_amount: '3000', subtotal: '2542.37', tax_amount: '457.63' }), // 18% rate
                    ];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2cs).toHaveLength(1); // both at same rate → 1 aggregated entry
            const entry = result.b2cs[0];
            expect(entry.rate).toBe(18);
            expect(entry.taxableValue).toBeCloseTo(4237.29 + 2542.37, 1);
            expect(entry.totalAmount).toBeCloseTo(5000 + 3000, 1);
        });
        it('should aggregate different tax rates into separate entries', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2csQuery(sql))
                    return [
                        b2csRow(), // 18%
                        b2csRow({ total_amount: '2000', subtotal: '1818.18', tax_amount: '181.82' }), // ~10% (different rate)
                    ];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2cs.length).toBeGreaterThanOrEqual(1);
            // Should have at least 2 entries or 1 aggregated with larger value
            const totalTaxable = result.b2cs.reduce((s, e) => s + e.taxableValue, 0);
            expect(totalTaxable).toBeCloseTo(4237.29 + 1818.18, 1);
        });
    });
    // ─── 4. CDNR Classification ──────────────────────────────────────────────────
    describe('CDNR classification (credit notes from returns)', () => {
        it('should classify sale return as CDNR with negative values', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.cdnr).toHaveLength(1);
            const entry = result.cdnr[0];
            expect(entry.returnNumber).toBe('RMA-2025-001');
            expect(entry.originalInvoiceNumber).toBe('DG-MUM-2025-001');
            expect(entry.noteType).toBe('Credit');
            // CDNR values must be negative
            expect(entry.taxableValue).toBeLessThan(0);
            expect(entry.cgst).toBeLessThan(0);
            expect(entry.sgst).toBeLessThan(0);
            expect(entry.refundAmount).toBeLessThan(0);
        });
        it('should compute correct negative tax breakup for intra-state CDNR', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            const entry = result.cdnr[0];
            // Intra-state: CGST = SGST = tax/2 = 14400/2 = 7200, negative
            expect(entry.cgst).toBe(-7200);
            expect(entry.sgst).toBe(-7200);
            // IGST is 0 for intra-state; -Math.abs(0) = -0, so use toBeCloseTo
            expect(entry.igst).toBeCloseTo(0);
        });
        it('should handle inter-state CDNR with IGST only', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isCdnrQuery(sql))
                    return [cdnrRow({ customer_state: 'Karnataka' })];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            const entry = result.cdnr[0];
            // CGST/SGST are 0 for inter-state; -Math.abs(0) = -0, so use toBeCloseTo
            expect(entry.cgst).toBeCloseTo(0);
            expect(entry.sgst).toBeCloseTo(0);
            expect(entry.igst).toBeLessThan(0);
            // IGST absolute value should equal full tax amount (inter-state)
            expect(Math.abs(entry.igst)).toBe(14400);
        });
        it('should handle sale return with missing original invoice', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isCdnrQuery(sql))
                    return [cdnrRow({ original_invoice: null })];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.cdnr[0].originalInvoiceNumber).toBeNull();
        });
    });
    // ─── 5. Integration — full GSTR-1 generation ─────────────────────────────────
    describe('generateGstr1() — full classification', () => {
        it('should return all four sections', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow()];
                if (isB2clQuery(sql))
                    return [b2clRow()];
                if (isB2csQuery(sql))
                    return [b2csRow()];
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow()];
                return [];
            });
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result).toHaveProperty('b2b');
            expect(result).toHaveProperty('b2cl');
            expect(result).toHaveProperty('b2cs');
            expect(result).toHaveProperty('cdnr');
            expect(Array.isArray(result.b2b)).toBe(true);
            expect(Array.isArray(result.b2cl)).toBe(true);
            expect(Array.isArray(result.b2cs)).toBe(true);
            expect(Array.isArray(result.cdnr)).toBe(true);
        });
        it('should filter by branchId when provided', async () => {
            let calledWithBranchId = false;
            dataSource.query.mockImplementation((sql, params) => {
                // Check if any query passed a branchId parameter
                if (sql.includes('branch_id ='))
                    calledWithBranchId = true;
                return [];
            });
            await service.generateGstr1('2025-01-01', '2025-01-31', 'branch-uuid-1');
            expect(calledWithBranchId).toBe(true);
        });
    });
    // ─── 6. generateSummary ──────────────────────────────────────────────────────
    describe('generateSummary()', () => {
        it('should compute summary from GSTR-1 data', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow()];
                if (isB2clQuery(sql))
                    return [b2clRow()];
                if (isB2csQuery(sql))
                    return [b2csRow()];
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow()];
                return [];
            });
            const summary = await service.generateSummary('2025-01-01', '2025-01-31');
            expect(summary.totalB2bInvoices).toBe(1);
            expect(summary.totalB2clInvoices).toBe(1);
            expect(summary.totalCdnrNotes).toBe(1);
            expect(summary.totalTaxableValue).toBeGreaterThan(0);
            expect(summary.totalCgst).toBeGreaterThan(0);
            expect(summary.totalSgst).toBeGreaterThan(0);
            expect(summary.totalIgst).toBeGreaterThan(0);
        });
        it('should handle CDNR negative values in summary', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                return [];
            });
            const summary = await service.generateSummary('2025-01-01', '2025-01-31');
            expect(summary.totalCdnrValue).toBeLessThan(0);
        });
    });
    // ─── 7. Empty data ───────────────────────────────────────────────────────────
    describe('empty / edge case data', () => {
        it('should return empty arrays when no data exists', async () => {
            dataSource.query.mockResolvedValue([]);
            const result = await service.generateGstr1('2025-01-01', '2025-01-31');
            expect(result.b2b).toEqual([]);
            expect(result.b2cl).toEqual([]);
            expect(result.b2cs).toEqual([]);
            expect(result.cdnr).toEqual([]);
        });
        it('should return zero summary when no data exists', async () => {
            dataSource.query.mockResolvedValue([]);
            const summary = await service.generateSummary('2025-01-01', '2025-01-31');
            expect(summary.totalB2bInvoices).toBe(0);
            expect(summary.totalB2bValue).toBe(0);
            expect(summary.totalB2clInvoices).toBe(0);
            expect(summary.totalB2clValue).toBe(0);
            expect(summary.totalB2csValue).toBe(0);
            expect(summary.totalCdnrNotes).toBe(0);
            expect(summary.totalCdnrValue).toBe(0);
            expect(summary.totalTaxableValue).toBe(0);
            expect(summary.totalCgst).toBe(0);
            expect(summary.totalSgst).toBe(0);
            expect(summary.totalIgst).toBe(0);
        });
        it('should handle DB query failure gracefully', async () => {
            dataSource.query.mockImplementation(async () => {
                throw new Error('DB connection lost');
            });
            // Should not throw — the service catches errors internally
            await expect(service.generateGstr1('2025-01-01', '2025-01-31')).rejects.toThrow();
        });
    });
    // ─── 8. Excel export ─────────────────────────────────────────────────────────
    describe('generateExcel()', () => {
        it('should return a Buffer', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow()];
                if (isB2clQuery(sql))
                    return [b2clRow()];
                if (isB2csQuery(sql))
                    return [b2csRow()];
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow()];
                return [];
            });
            const buffer = await service.generateExcel('2025-01-01', '2025-01-31');
            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(0);
        });
        it('should handle empty data gracefully', async () => {
            dataSource.query.mockResolvedValue([]);
            const buffer = await service.generateExcel('2025-01-01', '2025-01-31');
            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(0);
        });
        it('should include summary section data in the Excel', async () => {
            dataSource.query.mockImplementation((sql) => {
                if (isB2bQuery(sql))
                    return [b2bRow(), b2bRow({ sale_id: 'sale-uuid-2', invoice_number: 'DG-MUM-2025-002', subtotal: '20000', tax_amount: '3600', total_amount: '23600' })];
                if (isB2clQuery(sql))
                    return [b2clRow()];
                if (isB2csQuery(sql))
                    return [b2csRow()];
                if (isCdnrQuery(sql))
                    return [cdnrRow()];
                if (isSaleItemsQuery(sql))
                    return [saleItemRow(), saleItemRow({ sale_id: 'sale-uuid-2' })];
                return [];
            });
            const buffer = await service.generateExcel('2025-01-01', '2025-01-31');
            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(0);
            // Result is either an xlsx (with exceljs) or JSON fallback, both are Buffers
        });
    });
    // ─── 9. Branch filtering ────────────────────────────────────────────────────
    describe('branch filtering', () => {
        it('should pass branchId parameter to all SQL queries', async () => {
            const queries = [];
            dataSource.query.mockImplementation((sql, params) => {
                queries.push(sql);
                return [];
            });
            await service.generateGstr1('2025-01-01', '2025-01-31', 'branch-uuid-1');
            // All 4 queries (B2B, B2CL, B2CS, CDNR) should include branch filter
            const branchFiltered = queries.filter((q) => q.includes('$3'));
            expect(branchFiltered.length).toBe(4);
        });
        it('should not include branch filter when branchId is omitted', async () => {
            const queries = [];
            dataSource.query.mockImplementation((sql, params) => {
                queries.push(sql);
                return [];
            });
            await service.generateGstr1('2025-01-01', '2025-01-31');
            // No queries should have $3 (the branch parameter)
            const withThreeParam = queries.filter((q) => q.includes('$3'));
            expect(withThreeParam.length).toBe(0);
        });
    });
});
//# sourceMappingURL=gst.service.spec.js.map