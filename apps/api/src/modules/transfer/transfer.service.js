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
import { Injectable, BadRequestException, NotFoundException, Logger, } from '@nestjs/common';
import { In } from 'typeorm';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
let TransferService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TransferService = _classThis = class {
        constructor(transferRepo, transferItemRepo, itemRepo, branchRepo, dataSource, eventService) {
            this.transferRepo = transferRepo;
            this.transferItemRepo = transferItemRepo;
            this.itemRepo = itemRepo;
            this.branchRepo = branchRepo;
            this.dataSource = dataSource;
            this.eventService = eventService;
            this.logger = new Logger(TransferService.name);
        }
        // ─── Transfer number generation ──────────────────────────────────────────────
        // Format: TRF-{BRANCH_CODE}-{YEAR}-{TS}
        async generateTransferNumber(branchId) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            const branchCode = branch?.code ?? branchId.slice(0, 4).toUpperCase();
            const year = new Date().getFullYear();
            const ts = Date.now().toString().slice(-6);
            return `TRF-${branchCode}-${year}-${ts}`;
        }
        // ─── 9.2 Create transfer ─────────────────────────────────────────────────────
        async create(dto, userId) {
            const { fromBranchId, toBranchId, itemIds, notes } = dto;
            if (fromBranchId === toBranchId) {
                throw new BadRequestException({
                    code: 'SAME_BRANCH',
                    message: 'Source and destination branches must be different',
                });
            }
            // Load and validate all items
            const items = await this.itemRepo.find({ where: { id: In(itemIds) } });
            if (items.length !== itemIds.length) {
                const foundIds = items.map((i) => i.id);
                const missing = itemIds.filter((id) => !foundIds.includes(id));
                throw new NotFoundException(`Inventory items not found: ${missing.join(', ')}`);
            }
            // Validate all items belong to fromBranch and are available
            for (const item of items) {
                if (item.branchId !== fromBranchId) {
                    throw new BadRequestException({
                        code: 'ITEM_WRONG_BRANCH',
                        message: `Item ${item.imei} does not belong to source branch`,
                    });
                }
                if (item.status !== 'available') {
                    throw new BadRequestException({
                        code: 'ITEM_NOT_AVAILABLE',
                        message: `Item ${item.imei} is not available (status: ${item.status})`,
                    });
                }
            }
            const transferNumber = await this.generateTransferNumber(fromBranchId);
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Create transfer record
                const transfer = queryRunner.manager.create(StockTransfer, {
                    transferNumber,
                    fromBranchId,
                    toBranchId,
                    status: 'initiated',
                    notes: notes ?? null,
                    initiatedById: userId,
                    initiatedAt: new Date(),
                });
                const savedTransfer = await queryRunner.manager.save(StockTransfer, transfer);
                // Create transfer items and update inventory status
                for (const item of items) {
                    const transferItem = queryRunner.manager.create(StockTransferItem, {
                        transferId: savedTransfer.id,
                        itemId: item.id,
                        imei: item.imei,
                        status: 'pending',
                    });
                    await queryRunner.manager.save(StockTransferItem, transferItem);
                    await queryRunner.manager.update(InventoryItem, item.id, { status: 'transferred' });
                }
                await queryRunner.commitTransaction();
                // Emit realtime event after successful commit
                try {
                    this.eventService.emitTransferCreated(fromBranchId, {
                        transferId: savedTransfer.id,
                        transferNumber,
                        status: 'initiated',
                        fromBranchId,
                        toBranchId,
                        branchId: fromBranchId,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (err) {
                    this.logger.warn(`[Transfer] Failed to emit stock.transfer.created: ${err?.message}`);
                }
                return this.findById(savedTransfer.id);
            }
            catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                await queryRunner.release();
            }
        }
        // ─── 9.3 List transfers ──────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, fromBranchId, toBranchId, status, search } = query;
            const qb = this.transferRepo
                .createQueryBuilder('transfer')
                .leftJoinAndSelect('transfer.fromBranch', 'fromBranch')
                .leftJoinAndSelect('transfer.toBranch', 'toBranch')
                .leftJoinAndSelect('transfer.initiatedBy', 'initiatedBy')
                .orderBy('transfer.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (fromBranchId)
                qb.andWhere('transfer.fromBranchId = :fromBranchId', { fromBranchId });
            if (toBranchId)
                qb.andWhere('transfer.toBranchId = :toBranchId', { toBranchId });
            if (status)
                qb.andWhere('transfer.status = :status', { status });
            if (search)
                qb.andWhere('transfer.transferNumber ILIKE :search', { search: `%${search}%` });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 9.3 Get transfer by ID ──────────────────────────────────────────────────
        async findById(id) {
            const transfer = await this.transferRepo.findOne({
                where: { id },
                relations: ['fromBranch', 'toBranch', 'initiatedBy', 'receivedBy', 'items'],
            });
            if (!transfer)
                throw new NotFoundException(`Transfer ${id} not found`);
            return transfer;
        }
        // ─── 9.4 Receive transfer (item-by-item, partial receipt) ────────────────────
        async receive(id, confirmedItemIds, userId) {
            const transfer = await this.findById(id);
            if (!['initiated', 'in_transit'].includes(transfer.status)) {
                throw new BadRequestException({
                    code: 'INVALID_STATUS',
                    message: `Transfer cannot be received in status: ${transfer.status}`,
                });
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Update confirmed items
                for (const itemId of confirmedItemIds) {
                    const transferItem = transfer.items?.find((i) => i.itemId === itemId);
                    if (!transferItem)
                        continue;
                    await queryRunner.manager.update(StockTransferItem, transferItem.id, { status: 'received' });
                    await queryRunner.manager.update(InventoryItem, itemId, {
                        branchId: transfer.toBranchId,
                        status: 'available',
                    });
                }
                // Update transfer status
                await queryRunner.manager.update(StockTransfer, id, {
                    status: 'received',
                    receivedById: userId,
                    receivedAt: new Date(),
                });
                await queryRunner.commitTransaction();
                // Emit realtime event after successful commit
                try {
                    this.eventService.emitTransferReceived(transfer.toBranchId, {
                        transferId: id,
                        transferNumber: transfer.transferNumber,
                        status: 'received',
                        fromBranchId: transfer.fromBranchId,
                        toBranchId: transfer.toBranchId,
                        branchId: transfer.toBranchId,
                        timestamp: new Date().toISOString(),
                    });
                    // Also notify source branch that transfer was received
                    this.eventService.emitTransferUpdated(transfer.fromBranchId, {
                        transferId: id,
                        transferNumber: transfer.transferNumber,
                        status: 'received',
                        fromBranchId: transfer.fromBranchId,
                        toBranchId: transfer.toBranchId,
                        branchId: transfer.fromBranchId,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (err) {
                    this.logger.warn(`[Transfer] Failed to emit transfer events: ${err?.message}`);
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
        // ─── 9.5 Reject transfer ─────────────────────────────────────────────────────
        async reject(id, rejectionReason) {
            const transfer = await this.findById(id);
            if (!['initiated', 'in_transit'].includes(transfer.status)) {
                throw new BadRequestException({
                    code: 'INVALID_STATUS',
                    message: `Transfer cannot be rejected in status: ${transfer.status}`,
                });
            }
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Restore all items to available at fromBranch
                for (const transferItem of transfer.items ?? []) {
                    await queryRunner.manager.update(InventoryItem, transferItem.itemId, {
                        branchId: transfer.fromBranchId,
                        status: 'available',
                    });
                    await queryRunner.manager.update(StockTransferItem, transferItem.id, { status: 'rejected' });
                }
                // Update transfer status
                await queryRunner.manager.update(StockTransfer, id, {
                    status: 'rejected',
                    rejectionReason,
                });
                await queryRunner.commitTransaction();
                // Emit realtime event after successful commit
                try {
                    this.eventService.emitTransferUpdated(transfer.fromBranchId, {
                        transferId: id,
                        transferNumber: transfer.transferNumber,
                        status: 'rejected',
                        fromBranchId: transfer.fromBranchId,
                        toBranchId: transfer.toBranchId,
                        branchId: transfer.fromBranchId,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (err) {
                    this.logger.warn(`[Transfer] Failed to emit transfer.rejected: ${err?.message}`);
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
        // ─── 9.6 Generate manifest PDF ───────────────────────────────────────────────
        async generateManifestPdf(id) {
            const transfer = await this.findById(id);
            const items = transfer.items ?? [];
            const itemRows = items
                .map((i) => `<tr><td>${i.imei}</td><td>${i.itemId}</td><td>${i.status}</td></tr>`)
                .join('');
            const html = `<html><body>
<h1>Transfer Manifest</h1>
<p>Transfer #: ${transfer.transferNumber}</p>
<p>From: ${transfer.fromBranch?.name ?? transfer.fromBranchId}</p>
<p>To: ${transfer.toBranch?.name ?? transfer.toBranchId}</p>
<p>Status: ${transfer.status}</p>
<p>Date: ${new Date(transfer.initiatedAt).toLocaleDateString('en-IN')}</p>
<table>
  <tr><th>IMEI</th><th>Item ID</th><th>Status</th></tr>
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
                return Buffer.from(`%PDF-1.4 placeholder\n${html}`);
            }
        }
    };
    __setFunctionName(_classThis, "TransferService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TransferService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TransferService = _classThis;
})();
export { TransferService };
//# sourceMappingURL=transfer.service.js.map