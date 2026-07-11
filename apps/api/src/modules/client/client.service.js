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
import { Injectable, Logger, BadRequestException, NotFoundException, } from '@nestjs/common';
let ClientService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClientService = _classThis = class {
        constructor(clientRepo, dataSource, notificationService) {
            this.clientRepo = clientRepo;
            this.dataSource = dataSource;
            this.notificationService = notificationService;
            this.logger = new Logger(ClientService.name);
        }
        // ─── 8.2 Create client ───────────────────────────────────────────────────────
        async create(dto, userId) {
            // Check phone uniqueness
            const existing = await this.clientRepo.findOne({ where: { phone: dto.phone } });
            if (existing) {
                throw new BadRequestException({
                    code: 'PHONE_DUPLICATE',
                    message: `A client with phone ${dto.phone} already exists`,
                });
            }
            const client = this.clientRepo.create({
                ...dto,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                ekycStatus: 'pending',
                isActive: true,
                createdById: userId,
            });
            return this.clientRepo.save(client);
        }
        // ─── 8.2 List clients ────────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, search, branchId, customerType, ekycStatus } = query;
            const qb = this.clientRepo
                .createQueryBuilder('client')
                .leftJoinAndSelect('client.branch', 'branch')
                .orderBy('client.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (branchId)
                qb.andWhere('client.branchId = :branchId', { branchId });
            if (customerType)
                qb.andWhere('client.customerType = :customerType', { customerType });
            if (ekycStatus)
                qb.andWhere('client.ekycStatus = :ekycStatus', { ekycStatus });
            if (search) {
                qb.andWhere('(client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.phone ILIKE :search OR client.email ILIKE :search)', { search: `%${search}%` });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── 8.2 Get client by ID ────────────────────────────────────────────────────
        async findById(id) {
            const client = await this.clientRepo.findOne({
                where: { id },
                relations: ['branch', 'createdBy'],
            });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            return client;
        }
        // ─── 8.2 Update client ───────────────────────────────────────────────────────
        async update(id, dto) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            // Check phone uniqueness if phone is being changed
            if (dto.phone && dto.phone !== client.phone) {
                const existing = await this.clientRepo.findOne({ where: { phone: dto.phone } });
                if (existing) {
                    throw new BadRequestException({
                        code: 'PHONE_DUPLICATE',
                        message: `A client with phone ${dto.phone} already exists`,
                    });
                }
            }
            if (dto.dateOfBirth) {
                dto.dateOfBirth = new Date(dto.dateOfBirth);
            }
            Object.assign(client, dto);
            return this.clientRepo.save(client);
        }
        // ─── 8.3 Get client history ──────────────────────────────────────────────────
        async getHistory(id) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            const db = this.dataSource;
            // Query each table — gracefully handle missing tables
            const safeQuery = async (sql, params) => {
                try {
                    return await db.query(sql, params);
                }
                catch {
                    return [];
                }
            };
            const [purchases, sales, exchanges, returns] = await Promise.all([
                safeQuery(`SELECT p.id, p.invoice_number, p.vendor_name, p.total_amount, p.purchase_date, p.status
         FROM purchases p
         JOIN inventory_items ii ON ii.purchase_id = p.id
         WHERE ii.id IN (
           SELECT item_id FROM sale_items si
           JOIN sales s ON s.id = si.sale_id WHERE s.client_id = $1
         )
         UNION
         SELECT p.id, p.invoice_number, p.vendor_name, p.total_amount, p.purchase_date, p.status
         FROM purchases p WHERE p.created_by_id = $1
         LIMIT 50`, [id]),
                safeQuery(`SELECT s.id, s.invoice_number, s.total_amount, s.sale_date, s.payment_status, s.is_voided
         FROM sales s WHERE s.client_id = $1 ORDER BY s.sale_date DESC LIMIT 50`, [id]),
                safeQuery(`SELECT e.id, e.exchange_price, e.condition, e.created_at
         FROM exchange_devices e WHERE e.client_id = $1 ORDER BY e.created_at DESC LIMIT 50`, [id]),
                safeQuery(`SELECT r.id, r.return_amount, r.reason, r.status, r.created_at
         FROM returns r WHERE r.client_id = $1 ORDER BY r.created_at DESC LIMIT 50`, [id]),
            ]);
            return { purchases, sales, exchanges, returns };
        }
        // ─── 8.4 EKYC upload documents ──────────────────────────────────────────────
        async uploadEkycDocuments(id, documents) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            client.ekycDocuments = documents;
            client.ekycStatus = 'pending';
            return this.clientRepo.save(client);
        }
        // ─── 8.4 EKYC verify ────────────────────────────────────────────────────────
        async verifyEkyc(id, userId) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            client.ekycStatus = 'verified';
            client.ekycVerifiedAt = new Date();
            client.ekycVerifiedById = userId;
            return this.clientRepo.save(client);
        }
        // ─── 8.5 Send email ──────────────────────────────────────────────────────────
        async sendEmail(id, payload) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            const target = client.email;
            if (!target) {
                return { message: `Client ${id} has no email address` };
            }
            this.notificationService.sendEmail({
                to: target,
                type: 'custom_message',
                subject: payload.subject,
                body: payload.body,
                metadata: { clientId: id },
            }).catch((err) => this.logger.warn(`[Client] Failed to send email to ${target}: ${err?.message}`));
            return { message: `Email queued for client ${id}` };
        }
        // ─── 8.5 Send WhatsApp ───────────────────────────────────────────────────────
        async sendWhatsapp(id, payload) {
            const client = await this.clientRepo.findOne({ where: { id } });
            if (!client)
                throw new NotFoundException(`Client ${id} not found`);
            if (!client.phone) {
                return { message: `Client ${id} has no phone number` };
            }
            this.notificationService.sendWhatsApp({
                to: client.phone,
                type: 'custom_message',
                body: payload.message,
                metadata: { clientId: id },
            }).catch((err) => this.logger.warn(`[Client] Failed to send WhatsApp to ${client.phone}: ${err?.message}`));
            return { message: `WhatsApp message queued for client ${id}` };
        }
    };
    __setFunctionName(_classThis, "ClientService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClientService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClientService = _classThis;
})();
export { ClientService };
//# sourceMappingURL=client.service.js.map