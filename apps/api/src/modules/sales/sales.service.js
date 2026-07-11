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
import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Accessory } from '../inventory/entities/accessory.entity';
import { validatePaymentSplits, calculateGST, getRequiredDiscountRole, } from '../../common/utils/business-logic';
const POS_LOCK_TTL = 15 * 60; // 15 minutes in seconds
// Role hierarchy for discount authorization
const ROLE_LEVEL = { sales: 0, manager: 1, owner: 2 };
function getUserRoleLevel(roleName) {
    if (!roleName)
        return 0;
    const lower = roleName.toLowerCase();
    if (lower === 'shop_owner' || lower === 'shop owner')
        return 2;
    if (lower === 'store_manager' || lower === 'store manager')
        return 1;
    return 0;
}
let SalesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SalesService = _classThis = class {
        constructor(saleRepo, saleItemRepo, paymentRepo, itemRepo, accessoryRepo, branchRepo, dataSource, configService, redisService, eventService, couponService, notificationService) {
            this.saleRepo = saleRepo;
            this.saleItemRepo = saleItemRepo;
            this.paymentRepo = paymentRepo;
            this.itemRepo = itemRepo;
            this.accessoryRepo = accessoryRepo;
            this.branchRepo = branchRepo;
            this.dataSource = dataSource;
            this.configService = configService;
            this.redisService = redisService;
            this.eventService = eventService;
            this.couponService = couponService;
            this.notificationService = notificationService;
            this.logger = new Logger(SalesService.name);
        }
        // ─── 7.2 Invoice number generation ──────────────────────────────────────────
        // Format: DG-{BRANCH_CODE}-{YEAR}-{padded_seq}
        async generateInvoiceNumber(branchId) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            const branchCode = branch?.code ?? branchId.slice(0, 4).toUpperCase();
            const year = new Date().getFullYear();
            const seq = await this.redisService.getNextInvoiceSequence(branchId, year);
            const paddedSeq = String(seq).padStart(5, '0');
            return `DG-${branchCode}-${year}-${paddedSeq}`;
        }
        // ─── 7.3 Create sale ─────────────────────────────────────────────────────────
        async create(dto, userId, userRole) {
            const { items, accessoryItems = [], payments, discountAmount = 0, isInterState = false, couponCode } = dto;
            // 1. Validate all items exist and are available/in_cart
            const itemIds = items.map((i) => i.itemId);
            const inventoryItems = await this.itemRepo.find({
                where: itemIds.map((id) => ({ id })),
            });
            if (inventoryItems.length !== itemIds.length) {
                const foundIds = inventoryItems.map((i) => i.id);
                const missing = itemIds.filter((id) => !foundIds.includes(id));
                throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
            }
            for (const inv of inventoryItems) {
                if (inv.status !== 'available' && inv.status !== 'in_cart') {
                    throw new BadRequestException({
                        code: 'ITEM_NOT_AVAILABLE',
                        message: `Item ${inv.imei} is not available for sale (status: ${inv.status})`,
                    });
                }
            }
            // 2. Calculate totals
            let subtotal = 0;
            let totalTax = 0;
            const saleItemsData = [];
            for (const itemDto of items) {
                const inv = inventoryItems.find((i) => i.id === itemDto.itemId);
                const discount = itemDto.discount ?? 0;
                const taxRate = itemDto.taxRate ?? 0;
                const priceAfterDiscount = itemDto.unitPrice - discount;
                const gst = calculateGST(priceAfterDiscount, taxRate, isInterState);
                const itemTotal = priceAfterDiscount + gst.total;
                subtotal += itemDto.unitPrice - discount;
                totalTax += gst.total;
                saleItemsData.push({
                    itemId: inv.id,
                    imei: inv.imei,
                    description: inv.itemName ?? `${inv.imei}`,
                    unitPrice: itemDto.unitPrice,
                    discount,
                    taxRate,
                    taxAmount: gst.total,
                    total: itemTotal,
                    hsnCode: itemDto.hsnCode ?? inv.hsnCode ?? null,
                });
            }
            // 3. Apply coupon if provided (replaces manual discount)
            let appliedCouponCode = null;
            let finalDiscountAmount = discountAmount;
            if (couponCode) {
                const validation = await this.couponService.validate({
                    code: couponCode,
                    subtotal,
                    branchId: dto.branchId,
                });
                if (!validation.valid) {
                    throw new BadRequestException({
                        code: 'COUPON_INVALID',
                        message: validation.message,
                    });
                }
                // Coupon replaces manual discount (per user choice)
                finalDiscountAmount = validation.discount ?? 0;
                appliedCouponCode = couponCode.toUpperCase();
                // If the manual discount was larger, keep manual discount instead
                if (discountAmount > finalDiscountAmount) {
                    finalDiscountAmount = discountAmount;
                    appliedCouponCode = null;
                }
            }
            const totalAmount = subtotal + totalTax - finalDiscountAmount;
            // 4. Validate discount authorization (7.5)
            if (finalDiscountAmount > 0 && subtotal > 0) {
                const discountPercent = (discountAmount / subtotal) * 100;
                const requiredRole = getRequiredDiscountRole(discountPercent);
                const userLevel = getUserRoleLevel(userRole);
                const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;
                if (userLevel < requiredLevel) {
                    throw new ForbiddenException({
                        code: 'DISCOUNT_NOT_AUTHORIZED',
                        message: `Discount of ${discountPercent.toFixed(1)}% requires ${requiredRole} authorization`,
                    });
                }
            }
            // 5. Validate payment splits (7.4)
            const valid = validatePaymentSplits(payments.map((p) => ({ amount: p.amount, method: p.method })), totalAmount);
            if (!valid) {
                throw new BadRequestException({
                    code: 'PAYMENT_SPLIT_MISMATCH',
                    message: `Payment splits sum does not match total amount (${totalAmount.toFixed(2)})`,
                });
            }
            // 6. Process accessory items (validate stock, decrement)
            const accessorySaleData = [];
            if (accessoryItems.length > 0) {
                const accIds = accessoryItems.map((a) => a.accessoryId);
                const accessories = await this.accessoryRepo.find({
                    where: accIds.map((id) => ({ id })),
                });
                if (accessories.length !== accIds.length) {
                    const foundIds = accessories.map((a) => a.id);
                    const missing = accIds.filter((id) => !foundIds.includes(id));
                    throw new NotFoundException(`Accessories not found: ${missing.join(', ')}`);
                }
                for (const accDto of accessoryItems) {
                    const acc = accessories.find((a) => a.id === accDto.accessoryId);
                    // Validate stock
                    if (acc.stockQuantity < accDto.quantity) {
                        throw new BadRequestException({
                            code: 'INSUFFICIENT_ACCESSORY_STOCK',
                            message: `Insufficient stock for ${acc.name}. Available: ${acc.stockQuantity}, Requested: ${accDto.quantity}`,
                        });
                    }
                    const discount = accDto.discount ?? 0;
                    const taxRate = accDto.taxRate ?? 0;
                    const priceAfterDiscount = accDto.unitPrice - discount;
                    const gst = calculateGST(priceAfterDiscount, taxRate, isInterState);
                    const itemTotal = priceAfterDiscount + gst.total;
                    const itemSubtotal = priceAfterDiscount * accDto.quantity;
                    subtotal += itemSubtotal;
                    totalTax += gst.total * accDto.quantity;
                    accessorySaleData.push({
                        accessoryId: acc.id,
                        quantity: accDto.quantity,
                        description: acc.name,
                        unitPrice: accDto.unitPrice,
                        discount,
                        taxRate,
                        taxAmount: gst.total * accDto.quantity,
                        total: itemTotal * accDto.quantity,
                        hsnCode: accDto.hsnCode ?? acc.hsnCode ?? null,
                    });
                }
            }
            // 7. Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber(dto.branchId);
            // 8. Persist everything in a transaction
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Create sale
                const sale = queryRunner.manager.create(Sale, {
                    invoiceNumber,
                    clientId: dto.clientId ?? null,
                    branchId: dto.branchId,
                    subtotal,
                    discountAmount: finalDiscountAmount,
                    taxAmount: totalTax,
                    totalAmount,
                    paymentStatus: 'paid',
                    saleType: dto.saleType ?? 'in-store',
                    notes: dto.notes ?? null,
                    createdById: userId,
                    saleDate: new Date(),
                    isVoided: false,
                });
                const savedSale = await queryRunner.manager.save(Sale, sale);
                // Create sale items (inventory items)
                for (const si of saleItemsData) {
                    const saleItem = queryRunner.manager.create(SaleItem, {
                        saleId: savedSale.id,
                        itemId: si.itemId,
                        imei: si.imei,
                        description: si.description,
                        unitPrice: si.unitPrice,
                        discount: si.discount,
                        taxRate: si.taxRate,
                        taxAmount: si.taxAmount,
                        total: si.total,
                        hsnCode: si.hsnCode,
                    });
                    await queryRunner.manager.save(SaleItem, saleItem);
                }
                // Create sale items (accessories)
                for (const si of accessorySaleData) {
                    const saleItem = queryRunner.manager.create(SaleItem, {
                        saleId: savedSale.id,
                        accessoryId: si.accessoryId,
                        quantity: si.quantity,
                        imei: '',
                        description: si.description,
                        unitPrice: si.unitPrice,
                        discount: si.discount,
                        taxRate: si.taxRate,
                        taxAmount: si.taxAmount,
                        total: si.total,
                        hsnCode: si.hsnCode,
                    });
                    await queryRunner.manager.save(SaleItem, saleItem);
                }
                // Create payment records
                for (const p of payments) {
                    const payment = queryRunner.manager.create(Payment, {
                        saleId: savedSale.id,
                        method: p.method,
                        amount: p.amount,
                        reference: p.reference ?? null,
                        note: p.note ?? null,
                        emiPlan: p.emiPlan ?? null,
                        status: 'completed',
                    });
                    await queryRunner.manager.save(Payment, payment);
                }
                // Update inventory items to 'sold'
                for (const inv of inventoryItems) {
                    await queryRunner.manager.update(InventoryItem, inv.id, { status: 'sold' });
                }
                // Decrement accessory stock
                for (const si of accessorySaleData) {
                    await queryRunner.manager.update(Accessory, si.accessoryId, {
                        stockQuantity: () => `stock_quantity - ${si.quantity}`,
                    });
                }
                await queryRunner.commitTransaction();
                // Release any POS locks
                try {
                    for (const id of itemIds) {
                        await this.redisService.posUnlockItem(id);
                    }
                }
                catch {
                    // Non-critical — log and continue
                }
                // Record coupon usage
                if (appliedCouponCode) {
                    try {
                        await this.couponService.recordUsage(appliedCouponCode);
                    }
                    catch (err) {
                        this.logger.warn(`Failed to record coupon usage: ${err?.message}`);
                    }
                }
                // Emit realtime events after successful commit
                try {
                    this.eventService.emitSaleCreated(dto.branchId, {
                        saleId: savedSale.id,
                        invoiceNumber: savedSale.invoiceNumber,
                        amount: Number(totalAmount),
                        branchId: dto.branchId,
                        timestamp: new Date().toISOString(),
                    });
                    for (const inv of inventoryItems) {
                        this.eventService.emitInventoryUpdated(dto.branchId, {
                            itemId: inv.id,
                            imei: inv.imei,
                            status: 'sold',
                            branchId: dto.branchId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                }
                catch (err) {
                    this.logger.warn(`Failed to emit realtime events: ${err?.message}`);
                }
                return this.findById(savedSale.id);
            }
            catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                await queryRunner.release();
            }
        }
        // ─── 7.6 List sales ──────────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, branchId, clientId, paymentStatus, saleType, fromDate, toDate, search, isVoided } = query;
            const qb = this.saleRepo
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.branch', 'branch')
                .orderBy('sale.saleDate', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (branchId)
                qb.andWhere('sale.branchId = :branchId', { branchId });
            if (clientId)
                qb.andWhere('sale.clientId = :clientId', { clientId });
            if (paymentStatus)
                qb.andWhere('sale.paymentStatus = :paymentStatus', { paymentStatus });
            if (saleType)
                qb.andWhere('sale.saleType = :saleType', { saleType });
            if (fromDate)
                qb.andWhere('sale.saleDate >= :fromDate', { fromDate });
            if (toDate)
                qb.andWhere('sale.saleDate <= :toDate', { toDate });
            if (search)
                qb.andWhere('sale.invoiceNumber ILIKE :search', { search: `%${search}%` });
            if (isVoided !== undefined)
                qb.andWhere('sale.is_voided = :isVoided', { isVoided });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 7.6 Get sale by ID ──────────────────────────────────────────────────────
        async findById(id) {
            const sale = await this.saleRepo.findOne({
                where: { id },
                relations: ['branch', 'createdBy', 'items', 'payments'],
            });
            if (!sale)
                throw new NotFoundException(`Sale ${id} not found`);
            return sale;
        }
        // ─── 7.7 Generate A4 invoice PDF ─────────────────────────────────────────────
        async generateInvoicePdf(id) {
            const sale = await this.findById(id);
            const html = this.buildA4InvoiceHtml(sale);
            return this.renderPdf(html, { format: 'A4' });
        }
        // ─── 7.7 Generate thermal 80mm receipt PDF ───────────────────────────────────
        async generateThermalPdf(id) {
            const sale = await this.findById(id);
            const html = this.buildThermalReceiptHtml(sale);
            return this.renderPdf(html, { width: '80mm', height: 'auto' });
        }
        buildA4InvoiceHtml(sale) {
            const itemRows = (sale.items ?? [])
                .map((si) => `<tr>
            <td>${si.imei}</td>
            <td>${si.description}</td>
            <td>${si.hsnCode ?? ''}</td>
            <td>₹${Number(si.unitPrice).toFixed(2)}</td>
            <td>₹${Number(si.discount).toFixed(2)}</td>
            <td>${Number(si.taxRate).toFixed(1)}%</td>
            <td>₹${Number(si.taxAmount).toFixed(2)}</td>
            <td>₹${Number(si.total).toFixed(2)}</td>
          </tr>`)
                .join('');
            const paymentRows = (sale.payments ?? [])
                .map((p) => `<tr><td>${p.method}</td><td>₹${Number(p.amount).toFixed(2)}</td></tr>`)
                .join('');
            return `<!DOCTYPE html><html><head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
  h1 { font-size: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #E0E0E0; padding: 6px; text-align: left; }
  th { background: #E5E5E5; }
  .totals { margin-top: 10px; text-align: right; }
</style>
</head><body>
<h1>Dream Gadgets — GST Invoice</h1>
<p><strong>Invoice #:</strong> ${sale.invoiceNumber}</p>
<p><strong>Date:</strong> ${new Date(sale.saleDate).toLocaleDateString('en-IN')}</p>
<p><strong>Branch:</strong> ${sale.branch?.name ?? sale.branchId}</p>
${sale.clientId ? `<p><strong>Client ID:</strong> ${sale.clientId}</p>` : ''}
<table>
  <tr><th>IMEI</th><th>Description</th><th>HSN</th><th>Unit Price</th><th>Discount</th><th>Tax Rate</th><th>Tax</th><th>Total</th></tr>
  ${itemRows}
</table>
<div class="totals">
  <p>Subtotal: ₹${Number(sale.subtotal).toFixed(2)}</p>
  <p>Discount: ₹${Number(sale.discountAmount).toFixed(2)}</p>
  <p>Tax: ₹${Number(sale.taxAmount).toFixed(2)}</p>
  <p><strong>Total: ₹${Number(sale.totalAmount).toFixed(2)}</strong></p>
</div>
<h3>Payments</h3>
<table>
  <tr><th>Method</th><th>Amount</th></tr>
  ${paymentRows}
</table>
</body></html>`;
        }
        buildThermalReceiptHtml(sale) {
            const itemRows = (sale.items ?? [])
                .map((si) => `<div>${si.description} — ₹${Number(si.total).toFixed(2)}</div>`)
                .join('');
            return `<!DOCTYPE html><html><head>
<style>
  body { font-family: monospace; font-size: 10px; width: 72mm; margin: 0; padding: 4px; }
  .center { text-align: center; }
  .line { border-top: 1px dashed #000; margin: 4px 0; }
</style>
</head><body>
<div class="center"><strong>Dream Gadgets</strong></div>
<div class="center">${sale.branch?.name ?? ''}</div>
<div class="line"></div>
<div>Invoice: ${sale.invoiceNumber}</div>
<div>Date: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}</div>
<div class="line"></div>
${itemRows}
<div class="line"></div>
<div>Subtotal: ₹${Number(sale.subtotal).toFixed(2)}</div>
<div>Tax: ₹${Number(sale.taxAmount).toFixed(2)}</div>
<div><strong>Total: ₹${Number(sale.totalAmount).toFixed(2)}</strong></div>
<div class="line"></div>
<div class="center">Thank you for shopping!</div>
</body></html>`;
        }
        async renderPdf(html, options) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const puppeteer = require('puppeteer');
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: 'networkidle0' });
                const pdfBuffer = await page.pdf(options);
                await browser.close();
                return Buffer.from(pdfBuffer);
            }
            catch {
                return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
            }
        }
        // ─── 7.8 Email invoice ───────────────────────────────────────────────────────
        async emailInvoice(id, email) {
            const sale = await this.findById(id);
            // Resolve recipient: use provided email, or look up from client
            let targetEmail = email;
            if (!targetEmail && sale.clientId) {
                try {
                    const client = await this.dataSource.query(`SELECT email FROM clients WHERE id = $1`, [sale.clientId]);
                    targetEmail = client?.[0]?.email ?? undefined;
                }
                catch {
                    // Ignore — fall through to skip
                }
            }
            if (!targetEmail) {
                return { message: `Invoice ${sale.invoiceNumber}: no email address available` };
            }
            const vars = {
                name: 'Customer',
                invoiceNumber: sale.invoiceNumber,
                amount: Number(sale.totalAmount).toFixed(2),
            };
            this.notificationService.sendEmail({
                to: targetEmail,
                type: 'invoice_delivery',
                templateKey: 'invoice_delivery',
                templateVars: vars,
                metadata: { saleId: id, invoiceNumber: sale.invoiceNumber },
            }).catch((err) => this.logger.warn(`[Sales] Failed to send invoice email to ${targetEmail}: ${err?.message}`));
            return { message: `Invoice ${sale.invoiceNumber} queued for email delivery to ${targetEmail}` };
        }
        // ─── 7.8 WhatsApp invoice ────────────────────────────────────────────────────
        async whatsappInvoice(id, phone) {
            const sale = await this.findById(id);
            // Resolve recipient: use provided phone, or look up from client
            let targetPhone = phone;
            if (!targetPhone && sale.clientId) {
                try {
                    const client = await this.dataSource.query(`SELECT phone FROM clients WHERE id = $1`, [sale.clientId]);
                    targetPhone = client?.[0]?.phone ?? undefined;
                }
                catch {
                    // Ignore — fall through to skip
                }
            }
            if (!targetPhone) {
                return { message: `Invoice ${sale.invoiceNumber}: no phone number available` };
            }
            const vars = {
                name: 'Customer',
                invoiceNumber: sale.invoiceNumber,
                amount: Number(sale.totalAmount).toFixed(2),
            };
            this.notificationService.sendWhatsApp({
                to: targetPhone,
                type: 'invoice_delivery',
                templateKey: 'invoice_delivery',
                templateVars: vars,
                metadata: { saleId: id, invoiceNumber: sale.invoiceNumber },
            }).catch((err) => this.logger.warn(`[Sales] Failed to send invoice WhatsApp to ${targetPhone}: ${err?.message}`));
            return { message: `Invoice ${sale.invoiceNumber} queued for WhatsApp delivery to ${targetPhone}` };
        }
        // ─── 7.9 Void sale ───────────────────────────────────────────────────────────
        async voidSale(id, userId) {
            const sale = await this.findById(id);
            if (sale.isVoided) {
                throw new BadRequestException({ code: 'ALREADY_VOIDED', message: 'Sale is already voided' });
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Mark sale as voided
                await queryRunner.manager.update(Sale, id, {
                    isVoided: true,
                    voidedById: userId,
                    voidedAt: new Date(),
                });
                // Restore inventory items to 'available'
                const saleItems = await this.saleItemRepo.find({ where: { saleId: id } });
                for (const si of saleItems) {
                    if (si.itemId) {
                        await queryRunner.manager.update(InventoryItem, si.itemId, { status: 'available' });
                    }
                    if (si.accessoryId) {
                        await queryRunner.manager.update(Accessory, si.accessoryId, {
                            stockQuantity: () => `stock_quantity + ${si.quantity ?? 1}`,
                        });
                    }
                }
                // Write audit log
                await queryRunner.manager.query(`INSERT INTO audit_logs (entity_type, entity_id, action, performed_by_id, changes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`, ['sale', id, 'void', userId, JSON.stringify({ isVoided: true, voidedAt: new Date() })]).catch(() => {
                    // audit_logs table may not exist in test env — ignore
                });
                await queryRunner.commitTransaction();
                // Emit realtime event after successful commit
                try {
                    this.eventService.emitSaleVoided(sale.branchId, {
                        saleId: id,
                        invoiceNumber: sale.invoiceNumber,
                        branchId: sale.branchId,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (err) {
                    this.logger.warn(`Failed to emit sale.voided: ${err?.message}`);
                }
                return this.findById(id);
            }
            catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                await queryRunner.release();
            }
        }
        // ─── 7.10 POS item soft-lock ─────────────────────────────────────────────────
        async lockItem(itemId) {
            const item = await this.itemRepo.findOne({ where: { id: itemId } });
            if (!item)
                throw new NotFoundException(`Item ${itemId} not found`);
            if (item.status !== 'available') {
                throw new BadRequestException({
                    code: 'ITEM_NOT_AVAILABLE',
                    message: `Item is not available (status: ${item.status})`,
                });
            }
            await this.itemRepo.update(itemId, { status: 'in_cart' });
            await this.redisService.posLockItem(itemId, POS_LOCK_TTL);
            // Broadcast lock event to branch
            this.eventService.emitInventoryLocked(item.branchId, {
                itemId,
                imei: item.imei,
                lockedBy: 'pos-user',
                branchId: item.branchId,
                timestamp: new Date().toISOString(),
            });
            return { message: `Item ${itemId} locked in cart` };
        }
        async unlockItem(itemId) {
            const item = await this.itemRepo.findOne({ where: { id: itemId } });
            if (!item)
                throw new NotFoundException(`Item ${itemId} not found`);
            if (item.status === 'in_cart') {
                await this.itemRepo.update(itemId, { status: 'available' });
            }
            await this.redisService.posUnlockItem(itemId);
            // Broadcast unlock event to branch
            this.eventService.emitInventoryUnlocked(item.branchId, {
                itemId,
                imei: item.imei,
                branchId: item.branchId,
                timestamp: new Date().toISOString(),
            });
            return { message: `Item ${itemId} unlocked` };
        }
    };
    __setFunctionName(_classThis, "SalesService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SalesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SalesService = _classThis;
})();
export { SalesService };
//# sourceMappingURL=sales.service.js.map