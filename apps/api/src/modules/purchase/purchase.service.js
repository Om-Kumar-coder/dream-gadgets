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
import { Injectable, BadRequestException, NotFoundException, } from '@nestjs/common';
let PurchaseService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PurchaseService = _classThis = class {
        constructor(purchaseRepo, itemRepo) {
            this.purchaseRepo = purchaseRepo;
            this.itemRepo = itemRepo;
        }
        // ─── Invoice number generation ───────────────────────────────────────────────
        // Format: PUR-{BRANCH_CODE}-{YEAR}-{TIMESTAMP}
        generateInvoiceNumber(branchId) {
            const branchCode = branchId.slice(0, 4).toUpperCase();
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-6);
            return `PUR-${branchCode}-${year}-${timestamp}`;
        }
        // ─── 6.2 Create purchase ─────────────────────────────────────────────────────
        async create(dto, userId) {
            const { itemIds, taxAmount = 0, ...rest } = dto;
            // Validate at least one item
            if (!itemIds || itemIds.length === 0) {
                throw new BadRequestException({
                    code: 'NO_ITEMS',
                    message: 'At least one inventory item must be provided',
                });
            }
            // Load and validate all items exist
            const items = await this.itemRepo.findByIds(itemIds);
            if (items.length !== itemIds.length) {
                const foundIds = items.map((i) => i.id);
                const missing = itemIds.filter((id) => !foundIds.includes(id));
                throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
            }
            // Compute totalAmount as sum of item.totalCost
            const totalAmount = items.reduce((sum, item) => sum + Number(item.totalCost), 0);
            // Generate invoice number
            const invoiceNumber = this.generateInvoiceNumber(dto.branchId);
            // Create purchase record
            const purchase = this.purchaseRepo.create({
                ...rest,
                invoiceNumber,
                totalAmount,
                taxAmount,
                createdById: userId,
                status: dto.status ?? 'completed',
                purchaseDate: new Date(dto.purchaseDate),
            });
            const saved = await this.purchaseRepo.save(purchase);
            // Link items to this purchase
            await this.itemRepo.update(itemIds, { purchaseId: saved.id });
            return saved;
        }
        // ─── 6.3 List purchases ──────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, branchId, status, vendorName, search, fromDate, toDate } = query;
            const qb = this.purchaseRepo
                .createQueryBuilder('purchase')
                .leftJoinAndSelect('purchase.branch', 'branch')
                .orderBy('purchase.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (branchId)
                qb.andWhere('purchase.branchId = :branchId', { branchId });
            if (status)
                qb.andWhere('purchase.status = :status', { status });
            if (vendorName)
                qb.andWhere('purchase.vendorName ILIKE :vendorName', { vendorName: `%${vendorName}%` });
            if (search) {
                qb.andWhere('(purchase.invoiceNumber ILIKE :search OR purchase.vendorName ILIKE :search)', { search: `%${search}%` });
            }
            if (fromDate)
                qb.andWhere('purchase.purchaseDate >= :fromDate', { fromDate });
            if (toDate)
                qb.andWhere('purchase.purchaseDate <= :toDate', { toDate });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 6.3 Get by ID ───────────────────────────────────────────────────────────
        async findById(id) {
            const purchase = await this.purchaseRepo.findOne({
                where: { id },
                relations: ['branch', 'createdBy'],
            });
            if (!purchase)
                throw new NotFoundException(`Purchase ${id} not found`);
            // Load linked inventory items
            const items = await this.itemRepo.find({ where: { purchaseId: id } });
            return { ...purchase, items };
        }
        // ─── 6.4 Update purchase ─────────────────────────────────────────────────────
        async update(id, dto) {
            const purchase = await this.purchaseRepo.findOne({ where: { id } });
            if (!purchase)
                throw new NotFoundException(`Purchase ${id} not found`);
            if (dto.purchaseDate) {
                dto.purchaseDate = new Date(dto.purchaseDate);
            }
            Object.assign(purchase, dto);
            return this.purchaseRepo.save(purchase);
        }
        // ─── 6.5 Generate invoice PDF ────────────────────────────────────────────────
        async generateInvoicePdf(id) {
            const purchase = await this.findById(id);
            const items = purchase.items;
            const itemRows = items
                .map((item) => `<tr><td>${item.imei}</td><td>${item.condition}</td><td>₹${Number(item.totalCost).toFixed(2)}</td></tr>`)
                .join('');
            const html = `<html><body>
<h1>Purchase Invoice</h1>
<p>Invoice: ${purchase.invoiceNumber}</p>
<p>Date: ${purchase.purchaseDate}</p>
<p>Vendor: ${purchase.vendorName}</p>
<p>Branch: ${purchase.branchId}</p>
<p>Total: ₹${Number(purchase.totalAmount).toFixed(2)}</p>
<table>
  <tr><th>IMEI</th><th>Condition</th><th>Price</th></tr>
  ${itemRows}
</table>
</body></html>`;
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const puppeteer = require('puppeteer');
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: 'networkidle0' });
                const pdfBuffer = await page.pdf({ format: 'A4' });
                await browser.close();
                return Buffer.from(pdfBuffer);
            }
            catch {
                // Puppeteer not available — return placeholder buffer
                return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
            }
        }
    };
    __setFunctionName(_classThis, "PurchaseService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PurchaseService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PurchaseService = _classThis;
})();
export { PurchaseService };
//# sourceMappingURL=purchase.service.js.map