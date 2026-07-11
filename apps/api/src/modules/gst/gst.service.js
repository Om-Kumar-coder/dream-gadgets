var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger } from '@nestjs/common';
// Indian state codes for GST
const STATE_CODES = {
    'Jammu and Kashmir': '01', 'Himachal Pradesh': '02', 'Punjab': '03', 'Chandigarh': '04',
    'Uttarakhand': '05', 'Haryana': '06', 'Delhi': '07', 'Rajasthan': '08',
    'Uttar Pradesh': '09', 'Bihar': '10', 'Sikkim': '11', 'Arunachal Pradesh': '12',
    'Nagaland': '13', 'Manipur': '14', 'Mizoram': '15', 'Tripura': '16',
    'Meghalaya': '17', 'Assam': '18', 'West Bengal': '19', 'Jharkhand': '20',
    'Odisha': '21', 'Chhattisgarh': '22', 'Madhya Pradesh': '23', 'Gujarat': '24',
    'Daman and Diu': '25', 'Dadra and Nagar Haveli': '26', 'Maharashtra': '27',
    'Andhra Pradesh': '28', 'Karnataka': '29', 'Goa': '30', 'Lakshadweep': '31',
    'Kerala': '32', 'Tamil Nadu': '33', 'Puducherry': '34', 'Andaman and Nicobar': '35',
    'Telangana': '36', 'Andhra Pradesh (New)': '37', 'Ladakh': '38',
    // Short forms
    'WB': '19', 'MH': '27', 'KA': '29', 'TN': '33', 'UP': '09',
    'BR': '10', 'RJ': '08', 'MP': '23', 'GJ': '24', 'AP': '28',
    'TS': '36', 'KL': '32', 'HR': '06', 'PB': '03', 'CT': '22',
};
const B2CL_THRESHOLD = 250000; // ₹2.5 lakh
let GstService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GstService = _classThis = class {
        constructor(dataSource) {
            this.dataSource = dataSource;
            this.logger = new Logger(GstService.name);
        }
        /**
         * Generate full GSTR-1 data for a date range and optional branch.
         */
        async generateGstr1(fromDate, toDate, branchId) {
            const [b2b, b2cl, b2cs, cdnr] = await Promise.all([
                this.getB2b(fromDate, toDate, branchId),
                this.getB2cl(fromDate, toDate, branchId),
                this.getB2cs(fromDate, toDate, branchId),
                this.getCdnr(fromDate, toDate, branchId),
            ]);
            return { b2b, b2cl, b2cs, cdnr };
        }
        /**
         * Generate summary of GSTR-1 data.
         */
        async generateSummary(fromDate, toDate, branchId) {
            const data = await this.generateGstr1(fromDate, toDate, branchId);
            const sumItems = (items) => items.reduce((acc, i) => acc + Number(i.totalAmount), 0);
            const totalB2bValue = sumItems(data.b2b);
            const totalB2clValue = sumItems(data.b2cl);
            const totalB2csValue = sumItems(data.b2cs);
            const totalCdnrValue = data.cdnr.reduce((acc, i) => acc + Number(i.refundAmount), 0);
            const totalCgst = data.b2b.reduce((a, i) => a + Number(i.totalCgst), 0) +
                data.b2cl.reduce((a, i) => a + Number(i.cgst), 0) +
                data.b2cs.reduce((a, i) => a + Number(i.cgst), 0);
            const totalSgst = data.b2b.reduce((a, i) => a + Number(i.totalSgst), 0) +
                data.b2cl.reduce((a, i) => a + Number(i.sgst), 0) +
                data.b2cs.reduce((a, i) => a + Number(i.sgst), 0);
            const totalIgst = data.b2b.reduce((a, i) => a + Number(i.totalIgst), 0) +
                data.b2cl.reduce((a, i) => a + Number(i.igst), 0) +
                data.b2cs.reduce((a, i) => a + Number(i.igst), 0);
            const totalTaxableValue = data.b2b.reduce((a, i) => a + Number(i.totalTaxableValue), 0) +
                data.b2cl.reduce((a, i) => a + Number(i.taxableValue), 0) +
                data.b2cs.reduce((a, i) => a + Number(i.taxableValue), 0);
            return {
                totalB2bInvoices: data.b2b.length,
                totalB2bValue,
                totalB2clInvoices: data.b2cl.length,
                totalB2clValue,
                totalB2csValue,
                totalCdnrNotes: data.cdnr.length,
                totalCdnrValue,
                totalTaxableValue,
                totalCgst,
                totalSgst,
                totalIgst,
            };
        }
        // ─── B2B: Sales with GSTIN ──────────────────────────────────────────────────
        async getB2b(fromDate, toDate, branchId) {
            const branchFilter = branchId ? `AND s.branch_id = $3` : '';
            const rows = await this.dataSource.query(`SELECT
        s.id AS sale_id,
        s.invoice_number,
        s.sale_date,
        s.subtotal,
        s.discount_amount,
        s.tax_amount,
        s.total_amount,
        s.client_id,
        c.first_name || ' ' || COALESCE(c.last_name, '') AS customer_name,
        c.gstin AS customer_gstin,
        c.state AS customer_state,
        b.state AS branch_state,
        b.gstin AS branch_gstin,
        b.code AS branch_code
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.is_voided = false
        AND s.sale_date >= $1
        AND s.sale_date <= $2
        AND c.gstin IS NOT NULL
        ${branchFilter}
      ORDER BY s.sale_date ASC`, [fromDate, toDate, ...(branchId ? [branchId] : [])]);
            // Batch-load sale items for all invoices in one query
            const saleIds = rows.map((r) => r.sale_id);
            const allItemsMap = await this.batchLoadSaleItems(saleIds);
            const entries = [];
            for (const row of rows) {
                const isInterState = this.isInterState(row.branch_state, row.customer_state);
                const placeOfSupply = this.getStateCode(row.customer_state || row.branch_state);
                const taxBreakup = this.computeTaxBreakup(Number(row.subtotal), Number(row.tax_amount), isInterState);
                const items = allItemsMap.get(row.sale_id) || [];
                const itemEntries = items.length > 0 ? items : [{
                        hsnCode: '',
                        taxableValue: Number(row.subtotal),
                        taxRate: Number(row.tax_amount) > 0 && Number(row.subtotal) > 0
                            ? Math.round((Number(row.tax_amount) / Number(row.subtotal)) * 100)
                            : 0,
                        cgst: taxBreakup.cgst,
                        sgst: taxBreakup.sgst,
                        igst: taxBreakup.igst,
                        total: Number(row.total_amount),
                    }];
                entries.push({
                    invoiceNumber: row.invoice_number,
                    invoiceDate: new Date(row.sale_date).toISOString().split('T')[0],
                    customerGstin: row.customer_gstin,
                    customerName: row.customer_name || '—',
                    placeOfSupply,
                    supplyType: isInterState ? 'Inter-State' : 'Intra-State',
                    items: itemEntries,
                    totalTaxableValue: Number(row.subtotal),
                    totalCgst: taxBreakup.cgst,
                    totalSgst: taxBreakup.sgst,
                    totalIgst: taxBreakup.igst,
                    totalAmount: Number(row.total_amount),
                });
            }
            return entries;
        }
        // ─── B2CL: Large inter-state without GSTIN, > 2.5L ─────────────────────────
        async getB2cl(fromDate, toDate, branchId) {
            const branchFilter = branchId ? `AND s.branch_id = $3` : '';
            const rows = await this.dataSource.query(`SELECT
        s.id AS sale_id,
        s.invoice_number,
        s.sale_date,
        s.subtotal,
        s.discount_amount,
        s.tax_amount,
        s.total_amount,
        s.client_id,
        c.gstin AS customer_gstin,
        c.state AS customer_state,
        b.state AS branch_state
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.is_voided = false
        AND s.sale_date >= $1
        AND s.sale_date <= $2
        AND (c.gstin IS NULL OR c.gstin = '')
        AND (c.state IS NULL OR c.state != b.state)
        AND s.total_amount > ${B2CL_THRESHOLD}
        ${branchFilter}
      ORDER BY s.sale_date ASC`, [fromDate, toDate, ...(branchId ? [branchId] : [])]);
            return rows.map((row) => {
                const isInterState = true; // B2CL is always inter-state
                const taxBreakup = this.computeTaxBreakup(Number(row.subtotal), Number(row.tax_amount), isInterState);
                const rate = Number(row.tax_amount) > 0 && Number(row.subtotal) > 0
                    ? Math.round((Number(row.tax_amount) / Number(row.subtotal)) * 100)
                    : 0;
                return {
                    invoiceNumber: row.invoice_number,
                    invoiceDate: new Date(row.sale_date).toISOString().split('T')[0],
                    placeOfSupply: this.getStateCode(row.customer_state || row.branch_state),
                    taxableValue: Number(row.subtotal),
                    taxRate: rate,
                    cgst: 0,
                    sgst: 0,
                    igst: taxBreakup.igst,
                    totalAmount: Number(row.total_amount),
                };
            });
        }
        // ─── B2CS: Small B2C — aggregate by rate + state ───────────────────────────
        async getB2cs(fromDate, toDate, branchId) {
            const branchFilter = branchId ? `AND s.branch_id = $3` : '';
            const rows = await this.dataSource.query(`SELECT
        s.total_amount,
        s.subtotal,
        s.tax_amount,
        s.client_id,
        c.state AS customer_state,
        COALESCE(c.gstin, '') AS customer_gstin,
        b.state AS branch_state
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.is_voided = false
        AND s.sale_date >= $1
        AND s.sale_date <= $2
        AND (c.gstin IS NULL OR c.gstin = '')
        ${branchFilter}
      ORDER BY s.sale_date ASC`, [fromDate, toDate, ...(branchId ? [branchId] : [])]);
            // Filter out B2CL (already counted above) and aggregate
            const nonB2cl = rows.filter((r) => Number(r.total_amount) <= B2CL_THRESHOLD || // not large
                (r.customer_state || r.branch_state) === r.branch_state);
            // Aggregate by tax rate
            const aggregates = new Map();
            for (const row of nonB2cl) {
                const subtotal = Number(row.subtotal);
                const taxAmount = Number(row.tax_amount);
                const isInterState = this.isInterState(row.branch_state, row.customer_state);
                const taxBreakup = this.computeTaxBreakup(subtotal, taxAmount, isInterState);
                const rate = taxAmount > 0 && subtotal > 0
                    ? Math.round((taxAmount / subtotal) * 100)
                    : 0;
                const key = `${rate}`;
                if (!aggregates.has(key)) {
                    aggregates.set(key, {
                        rate,
                        taxableValue: 0,
                        cgst: 0,
                        sgst: 0,
                        igst: 0,
                        totalAmount: 0,
                    });
                }
                const agg = aggregates.get(key);
                agg.taxableValue += subtotal;
                agg.cgst += taxBreakup.cgst;
                agg.sgst += taxBreakup.sgst;
                agg.igst += taxBreakup.igst;
                agg.totalAmount += Number(row.total_amount);
            }
            return Array.from(aggregates.values());
        }
        // ─── CDNR: Credit/Debit Notes from Returns ─────────────────────────────────
        async getCdnr(fromDate, toDate, branchId) {
            const branchFilter = branchId
                ? `AND s.branch_id = $3`
                : '';
            const rows = await this.dataSource.query(`SELECT
        r.id AS return_id,
        r.return_number,
        r.created_at AS return_date,
        r.reason,
        r.refund_amount,
        r.refund_status,
        r.original_id AS sale_id,
        r.client_id,
        r.return_type,
        s.invoice_number AS original_invoice,
        s.subtotal,
        s.tax_amount,
        c.state AS customer_state,
        b.state AS branch_state
      FROM returns r
      LEFT JOIN sales s ON s.id = r.original_id AND r.return_type = 'sale'
      LEFT JOIN clients c ON c.id = r.client_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE r.return_type = 'sale'
        AND r.created_at >= $1
        AND r.created_at <= $2
        ${branchFilter}
      ORDER BY r.created_at ASC`, [fromDate, toDate, ...(branchId ? [branchId] : [])]);
            return rows.map((row) => {
                const isInterState = this.isInterState(row.branch_state, row.customer_state);
                const refundAmount = Number(row.refund_amount || 0);
                const subtotal = Number(row.subtotal || 0);
                const taxAmount = Number(row.tax_amount || 0);
                const taxBreakup = this.computeTaxBreakup(subtotal, taxAmount, isInterState);
                const rate = taxAmount > 0 && subtotal > 0
                    ? Math.round((taxAmount / subtotal) * 100)
                    : 0;
                // CDNR values must be negative in GSTR-1 (credit notes reduce liability)
                return {
                    returnNumber: row.return_number,
                    returnDate: new Date(row.return_date).toISOString().split('T')[0],
                    originalInvoiceNumber: row.original_invoice || null,
                    reason: row.reason,
                    placeOfSupply: this.getStateCode(row.customer_state || row.branch_state),
                    taxableValue: -Math.abs(subtotal),
                    taxRate: rate,
                    cgst: -Math.abs(taxBreakup.cgst),
                    sgst: -Math.abs(taxBreakup.sgst),
                    igst: -Math.abs(taxBreakup.igst),
                    refundAmount: -Math.abs(refundAmount),
                    noteType: 'Credit',
                };
            });
        }
        // ─── HSN-wise breakdown for B2B invoice items (batch) ──────────────────────
        async batchLoadSaleItems(saleIds) {
            const map = new Map();
            if (saleIds.length === 0)
                return map;
            try {
                // Build parameterized query with multiple IDs
                const placeholders = saleIds.map((_, i) => `$${i + 1}`).join(', ');
                const rows = await this.dataSource.query(`SELECT
          si.sale_id,
          COALESCE(si.hsn_code, '') AS hsn_code,
          si.unit_price,
          si.discount,
          si.tax_rate,
          si.tax_amount,
          si.total
        FROM sale_items si
        WHERE si.sale_id IN (${placeholders})`, saleIds);
                for (const row of rows) {
                    if (!map.has(row.sale_id)) {
                        map.set(row.sale_id, []);
                    }
                    const taxableValue = Number(row.unit_price) - Number(row.discount);
                    const taxRate = Number(row.tax_rate);
                    const taxAmount = Number(row.tax_amount);
                    map.get(row.sale_id).push({
                        hsnCode: row.hsn_code,
                        taxableValue,
                        taxRate,
                        cgst: taxAmount / 2,
                        sgst: taxAmount / 2,
                        igst: 0,
                        total: Number(row.total),
                    });
                }
            }
            catch (err) {
                this.logger.warn(`[GST] Failed to batch-load sale items: ${err?.message}`);
            }
            return map;
        }
        // ─── Helpers ──────────────────────────────────────────────────────────────────
        isInterState(branchState, customerState) {
            if (!branchState || !customerState)
                return false;
            const b = branchState.trim().toLowerCase();
            const c = customerState.trim().toLowerCase();
            return b !== c;
        }
        getStateCode(state) {
            if (!state)
                return '99'; // Other territory
            return STATE_CODES[state.trim()] ?? STATE_CODES[state.trim().toUpperCase()] ?? '99';
        }
        computeTaxBreakup(subtotal, taxAmount, isInterState) {
            if (isInterState) {
                return { cgst: 0, sgst: 0, igst: taxAmount };
            }
            return { cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0 };
        }
        // ─── Excel Export ────────────────────────────────────────────────────────────
        async generateExcel(fromDate, toDate, branchId) {
            const data = await this.generateGstr1(fromDate, toDate, branchId);
            const summary = await this.generateSummary(fromDate, toDate, branchId);
            try {
                const ExcelJS = require('exceljs');
                const workbook = new ExcelJS.Workbook();
                // ─── Summary Sheet ───────────────────────────────────────────────────
                const summarySheet = workbook.addWorksheet('Summary');
                summarySheet.addRow(['GSTR-1 Summary Report']);
                summarySheet.addRow([`Period: ${fromDate} to ${toDate}`]);
                summarySheet.addRow([]);
                summarySheet.addRow(['Section', 'Count', 'Total Value (₹)']);
                summarySheet.addRow(['B2B', summary.totalB2bInvoices, summary.totalB2bValue]);
                summarySheet.addRow(['B2CL (Large)', summary.totalB2clInvoices, summary.totalB2clValue]);
                summarySheet.addRow(['B2CS (Small)', '-', summary.totalB2csValue]);
                summarySheet.addRow(['CDNR (Credit Notes)', summary.totalCdnrNotes, summary.totalCdnrValue]);
                summarySheet.addRow([]);
                summarySheet.addRow(['Total Taxable Value', '', summary.totalTaxableValue]);
                summarySheet.addRow(['Total CGST', '', summary.totalCgst]);
                summarySheet.addRow(['Total SGST', '', summary.totalSgst]);
                summarySheet.addRow(['Total IGST', '', summary.totalIgst]);
                this.styleHeader(summarySheet, 1, 2);
                // ─── B2B Sheet ──────────────────────────────────────────────────────
                const b2bSheet = workbook.addWorksheet('B2B');
                b2bSheet.addRow(['Invoice No', 'Date', 'Customer GSTIN', 'Customer Name', 'Place of Supply',
                    'Supply Type', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Amount']);
                for (const entry of data.b2b) {
                    b2bSheet.addRow([
                        entry.invoiceNumber, entry.invoiceDate, entry.customerGstin, entry.customerName,
                        entry.placeOfSupply, entry.supplyType,
                        entry.totalTaxableValue, entry.totalCgst, entry.totalSgst, entry.totalIgst, entry.totalAmount,
                    ]);
                }
                this.styleHeader(b2bSheet, 1);
                b2bSheet.columns = b2bSheet.columns.map((c) => ({ ...c, width: 20 }));
                // ─── B2CL Sheet ─────────────────────────────────────────────────────
                const b2clSheet = workbook.addWorksheet('B2CL');
                b2clSheet.addRow(['Invoice No', 'Date', 'Place of Supply', 'Taxable Value', 'Tax Rate (%)',
                    'CGST', 'SGST', 'IGST', 'Total Amount']);
                for (const entry of data.b2cl) {
                    b2clSheet.addRow([
                        entry.invoiceNumber, entry.invoiceDate, entry.placeOfSupply,
                        entry.taxableValue, entry.taxRate, entry.cgst, entry.sgst, entry.igst, entry.totalAmount,
                    ]);
                }
                this.styleHeader(b2clSheet, 1);
                b2clSheet.columns = b2clSheet.columns.map((c) => ({ ...c, width: 20 }));
                // ─── B2CS Sheet ────────────────────────────────────────────────────
                const b2csSheet = workbook.addWorksheet('B2CS');
                b2csSheet.addRow(['Tax Rate (%)', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Amount']);
                for (const entry of data.b2cs) {
                    b2csSheet.addRow([entry.rate, entry.taxableValue, entry.cgst, entry.sgst, entry.igst, entry.totalAmount]);
                }
                this.styleHeader(b2csSheet, 1);
                b2csSheet.columns = b2csSheet.columns.map((c) => ({ ...c, width: 20 }));
                // ─── CDNR Sheet ─────────────────────────────────────────────────────
                const cdnrSheet = workbook.addWorksheet('CDNR');
                cdnrSheet.addRow(['Return No', 'Date', 'Original Invoice', 'Reason', 'Place of Supply',
                    'Taxable Value', 'Tax Rate (%)', 'CGST', 'SGST', 'IGST', 'Refund Amount', 'Note Type']);
                for (const entry of data.cdnr) {
                    cdnrSheet.addRow([
                        entry.returnNumber, entry.returnDate, entry.originalInvoiceNumber || '',
                        entry.reason, entry.placeOfSupply, entry.taxableValue, entry.taxRate,
                        entry.cgst, entry.sgst, entry.igst, entry.refundAmount, entry.noteType,
                    ]);
                }
                this.styleHeader(cdnrSheet, 1);
                cdnrSheet.columns = cdnrSheet.columns.map((c) => ({ ...c, width: 20 }));
                const buffer = await workbook.xlsx.writeBuffer();
                return Buffer.from(buffer);
            }
            catch (err) {
                if (err?.code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
                    this.logger.warn('ExcelJS not available, returning JSON as fallback');
                    return Buffer.from(JSON.stringify({ data, summary, message: 'Excel export requires exceljs package' }));
                }
                throw err;
            }
        }
        styleHeader(sheet, ...headerRows) {
            for (const rowNum of headerRows) {
                const row = sheet.getRow(rowNum);
                if (row) {
                    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF4472C4' },
                    };
                }
            }
        }
    };
    __setFunctionName(_classThis, "GstService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GstService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GstService = _classThis;
})();
export { GstService };
//# sourceMappingURL=gst.service.js.map