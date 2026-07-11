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
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger, } from '@nestjs/common';
import { In } from 'typeorm';
import { getRequiredReturnRole } from '../../common/utils/business-logic';
// Role hierarchy for return approval
const ROLE_LEVEL = { any: 0, manager: 1, owner: 2 };
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
function generateReturnNumber() {
    const year = new Date().getFullYear();
    const ts = Date.now();
    return `RET-${year}-${ts}`;
}
let ReturnService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReturnService = _classThis = class {
        constructor(returnRepo, saleRepo, saleItemRepo, paymentRepo, purchaseRepo, itemRepo, configService, dataSource, redisService, eventService) {
            this.returnRepo = returnRepo;
            this.saleRepo = saleRepo;
            this.saleItemRepo = saleItemRepo;
            this.paymentRepo = paymentRepo;
            this.purchaseRepo = purchaseRepo;
            this.itemRepo = itemRepo;
            this.configService = configService;
            this.dataSource = dataSource;
            this.redisService = redisService;
            this.eventService = eventService;
            this.logger = new Logger(ReturnService.name);
        }
        // ─── 11.2 / 11.3 Create sale return ─────────────────────────────────────────
        async createSaleReturn(saleId, dto, userId, userRole) {
            // Load sale with items and payments
            const sale = await this.saleRepo.findOne({
                where: { id: saleId },
                relations: ['items', 'payments'],
            });
            if (!sale)
                throw new NotFoundException(`Sale ${saleId} not found`);
            if (sale.isVoided) {
                throw new BadRequestException({
                    code: 'SALE_VOIDED',
                    message: 'Cannot return a voided sale',
                });
            }
            // 11.3 Check return window
            const returnWindowDays = this.getReturnWindowDays();
            const saleDate = new Date(sale.saleDate);
            const now = new Date();
            const daysSinceSale = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceSale > returnWindowDays && !dto.managerOverride) {
                throw new BadRequestException({
                    code: 'RETURN_WINDOW_EXPIRED',
                    message: `Return window of ${returnWindowDays} days has expired (${daysSinceSale} days since sale)`,
                });
            }
            // 11.3 Check approval threshold
            const refundAmount = dto.refundAmount ?? Number(sale.totalAmount);
            const requiredRole = getRequiredReturnRole(refundAmount);
            if (requiredRole !== 'any') {
                const userLevel = getUserRoleLevel(userRole);
                const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;
                if (userLevel < requiredLevel) {
                    throw new ForbiddenException({
                        code: 'RETURN_NOT_AUTHORIZED',
                        message: `Return of ₹${refundAmount} requires ${requiredRole} authorization`,
                    });
                }
            }
            // 11.4 Update inventory items status
            const conditionAssessment = dto.conditionAssessment ?? 'available';
            const saleItems = sale.items ?? [];
            for (const si of saleItems) {
                await this.itemRepo.update(si.itemId, { status: conditionAssessment });
            }
            // 11.5 Razorpay refund trigger (INTEGRATED)
            let refundStatus = 'pending';
            if (dto.refundMethod === 'original_payment') {
                // Find the original payment record
                const originalPayment = sale.payments?.find(p => p.razorpayPaymentId);
                if (originalPayment && originalPayment.razorpayPaymentId) {
                    try {
                        const Razorpay = require('razorpay');
                        const razorpay = new Razorpay({
                            key_id: this.configService.get('RAZORPAY_KEY_ID'),
                            key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
                        });
                        const refund = await razorpay.payments.refund(originalPayment.razorpayPaymentId, { amount: Math.round(refundAmount * 100) });
                        refundStatus = refund.status;
                        this.logger.log(`[Returns] Razorpay refund processed for sale ${saleId}: ${refund.id}`);
                    }
                    catch (err) {
                        this.logger.warn(`[Returns] Razorpay refund failed for sale ${saleId}: ${err?.message}`);
                        refundStatus = 'failed';
                    }
                }
                else {
                    this.logger.log(`[Returns] No Razorpay payment found for sale ${saleId}, marking refund as processed`);
                    refundStatus = 'processed';
                }
            }
            // Create return record
            const returnRecord = this.returnRepo.create({
                returnNumber: generateReturnNumber(),
                returnType: 'sale',
                originalId: saleId,
                clientId: sale.clientId ?? null,
                reason: dto.reason,
                refundMethod: dto.refundMethod ?? null,
                refundAmount,
                refundStatus,
                approvedById: dto.approvedById ?? null,
                createdById: userId,
            });
            const saved = await this.returnRepo.save(returnRecord);
            // Emit realtime event
            try {
                this.eventService.emitReturnCreated(sale.branchId, {
                    returnId: saved.id,
                    returnNumber: saved.returnNumber,
                    returnType: 'sale',
                    originalId: saleId,
                    refundAmount: Number(refundAmount),
                    branchId: sale.branchId,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (err) {
                this.logger.warn(`[Returns] Failed to emit return.created: ${err?.message}`);
            }
            return saved;
        }
        // ─── 12.1 Create purchase return ─────────────────────────────────────────────
        async createPurchaseReturn(purchaseId, dto, userId) {
            const purchase = await this.purchaseRepo.findOne({ where: { id: purchaseId } });
            if (!purchase)
                throw new NotFoundException(`Purchase ${purchaseId} not found`);
            // Load linked inventory items
            let items;
            if (dto.itemIds && dto.itemIds.length > 0) {
                items = await this.itemRepo.find({ where: { id: In(dto.itemIds) } });
                if (items.length !== dto.itemIds.length) {
                    throw new NotFoundException('Some inventory items not found');
                }
            }
            else {
                items = await this.itemRepo.find({ where: { purchaseId } });
            }
            // 12.1 Remove items from active inventory
            const conditionAssessment = dto.conditionAssessment ?? 'scrapped';
            for (const item of items) {
                await this.itemRepo.update(item.id, { status: conditionAssessment });
            }
            const returnRecord = this.returnRepo.create({
                returnNumber: generateReturnNumber(),
                returnType: 'purchase',
                originalId: purchaseId,
                clientId: null,
                reason: dto.reason,
                refundMethod: null,
                refundAmount: Number(purchase.totalAmount),
                refundStatus: 'pending',
                approvedById: null,
                createdById: userId,
            });
            const saved = await this.returnRepo.save(returnRecord);
            // Emit realtime event
            try {
                this.eventService.emitReturnCreated(purchase.branchId ?? '', {
                    returnId: saved.id,
                    returnNumber: saved.returnNumber,
                    returnType: 'purchase',
                    originalId: purchaseId,
                    refundAmount: Number(purchase.totalAmount),
                    branchId: purchase.branchId ?? '',
                    timestamp: new Date().toISOString(),
                });
            }
            catch (err) {
                this.logger.warn(`[Returns] Failed to emit return.created: ${err?.message}`);
            }
            return saved;
        }
        // ─── List returns ────────────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, returnType, originalId } = query;
            const qb = this.returnRepo
                .createQueryBuilder('ret')
                .orderBy('ret.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (returnType)
                qb.andWhere('ret.returnType = :returnType', { returnType });
            if (originalId)
                qb.andWhere('ret.originalId = :originalId', { originalId });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── Get return by ID ────────────────────────────────────────────────────────
        async findById(id) {
            const ret = await this.returnRepo.findOne({
                where: { id },
                relations: ['createdBy', 'approvedBy'],
            });
            if (!ret)
                throw new NotFoundException(`Return ${id} not found`);
            return ret;
        }
        // ─── 11.6 / 12.2 Generate credit note / return note PDF ─────────────────────
        async generateReturnPdf(id) {
            const ret = await this.findById(id);
            const html = this.buildReturnNoteHtml(ret);
            return this.renderPdf(html);
        }
        buildReturnNoteHtml(ret) {
            const title = ret.returnType === 'sale' ? 'Credit Note / Return Invoice' : 'Purchase Return Note';
            return `<!DOCTYPE html><html><head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
  h1 { font-size: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #E0E0E0; padding: 6px; text-align: left; }
  th { background: #E5E5E5; }
</style>
</head><body>
<h1>Dream Gadgets — ${title}</h1>
<p><strong>Return #:</strong> ${ret.returnNumber}</p>
<p><strong>Date:</strong> ${new Date(ret.createdAt).toLocaleDateString('en-IN')}</p>
<p><strong>Type:</strong> ${ret.returnType === 'sale' ? 'Sale Return' : 'Purchase Return'}</p>
<p><strong>Original ID:</strong> ${ret.originalId}</p>
<p><strong>Reason:</strong> ${ret.reason}</p>
${ret.refundAmount != null ? `<p><strong>Refund Amount:</strong> ₹${Number(ret.refundAmount).toFixed(2)}</p>` : ''}
${ret.refundMethod ? `<p><strong>Refund Method:</strong> ${ret.refundMethod}</p>` : ''}
<p><strong>Refund Status:</strong> ${ret.refundStatus}</p>
</body></html>`;
        }
        async renderPdf(html) {
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
                return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
            }
        }
        // ─── Helpers ─────────────────────────────────────────────────────────────────
        getReturnWindowDays() {
            try {
                return this.configService.get('RETURN_WINDOW_DAYS') ?? 7;
            }
            catch {
                return 7;
            }
        }
    };
    __setFunctionName(_classThis, "ReturnService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReturnService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReturnService = _classThis;
})();
export { ReturnService };
//# sourceMappingURL=return.service.js.map