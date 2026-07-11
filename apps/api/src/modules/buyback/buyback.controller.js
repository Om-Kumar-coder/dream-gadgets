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
import { Controller, Get, Post, Patch, UseGuards, UseInterceptors, HttpCode, HttpStatus, BadRequestException, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
let CreateBuybackLeadDto = (() => {
    var _a;
    let _brand_decorators;
    let _brand_initializers = [];
    let _brand_extraInitializers = [];
    let _modelName_decorators;
    let _modelName_initializers = [];
    let _modelName_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _deviceType_decorators;
    let _deviceType_initializers = [];
    let _deviceType_extraInitializers = [];
    let _screenCondition_decorators;
    let _screenCondition_initializers = [];
    let _screenCondition_extraInitializers = [];
    let _bodyCondition_decorators;
    let _bodyCondition_initializers = [];
    let _bodyCondition_extraInitializers = [];
    let _batteryHealth_decorators;
    let _batteryHealth_initializers = [];
    let _batteryHealth_extraInitializers = [];
    let _functionalIssues_decorators;
    let _functionalIssues_initializers = [];
    let _functionalIssues_extraInitializers = [];
    return _a = class CreateBuybackLeadDto {
            constructor() {
                this.brand = __runInitializers(this, _brand_initializers, void 0);
                this.modelName = (__runInitializers(this, _brand_extraInitializers), __runInitializers(this, _modelName_initializers, void 0));
                this.phone = (__runInitializers(this, _modelName_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.deviceType = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _deviceType_initializers, void 0));
                this.screenCondition = (__runInitializers(this, _deviceType_extraInitializers), __runInitializers(this, _screenCondition_initializers, void 0));
                this.bodyCondition = (__runInitializers(this, _screenCondition_extraInitializers), __runInitializers(this, _bodyCondition_initializers, void 0));
                this.batteryHealth = (__runInitializers(this, _bodyCondition_extraInitializers), __runInitializers(this, _batteryHealth_initializers, void 0));
                this.functionalIssues = (__runInitializers(this, _batteryHealth_extraInitializers), __runInitializers(this, _functionalIssues_initializers, void 0));
                __runInitializers(this, _functionalIssues_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _brand_decorators = [IsString(), MinLength(1), MaxLength(100)];
            _modelName_decorators = [IsString(), MinLength(1), MaxLength(200)];
            _phone_decorators = [IsString(), MinLength(10), MaxLength(20)];
            _deviceType_decorators = [IsOptional(), IsString(), MaxLength(50)];
            _screenCondition_decorators = [IsOptional(), IsString(), MaxLength(50)];
            _bodyCondition_decorators = [IsOptional(), IsString(), MaxLength(50)];
            _batteryHealth_decorators = [IsOptional(), IsString(), MaxLength(20)];
            _functionalIssues_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _brand_decorators, { kind: "field", name: "brand", static: false, private: false, access: { has: obj => "brand" in obj, get: obj => obj.brand, set: (obj, value) => { obj.brand = value; } }, metadata: _metadata }, _brand_initializers, _brand_extraInitializers);
            __esDecorate(null, null, _modelName_decorators, { kind: "field", name: "modelName", static: false, private: false, access: { has: obj => "modelName" in obj, get: obj => obj.modelName, set: (obj, value) => { obj.modelName = value; } }, metadata: _metadata }, _modelName_initializers, _modelName_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _deviceType_decorators, { kind: "field", name: "deviceType", static: false, private: false, access: { has: obj => "deviceType" in obj, get: obj => obj.deviceType, set: (obj, value) => { obj.deviceType = value; } }, metadata: _metadata }, _deviceType_initializers, _deviceType_extraInitializers);
            __esDecorate(null, null, _screenCondition_decorators, { kind: "field", name: "screenCondition", static: false, private: false, access: { has: obj => "screenCondition" in obj, get: obj => obj.screenCondition, set: (obj, value) => { obj.screenCondition = value; } }, metadata: _metadata }, _screenCondition_initializers, _screenCondition_extraInitializers);
            __esDecorate(null, null, _bodyCondition_decorators, { kind: "field", name: "bodyCondition", static: false, private: false, access: { has: obj => "bodyCondition" in obj, get: obj => obj.bodyCondition, set: (obj, value) => { obj.bodyCondition = value; } }, metadata: _metadata }, _bodyCondition_initializers, _bodyCondition_extraInitializers);
            __esDecorate(null, null, _batteryHealth_decorators, { kind: "field", name: "batteryHealth", static: false, private: false, access: { has: obj => "batteryHealth" in obj, get: obj => obj.batteryHealth, set: (obj, value) => { obj.batteryHealth = value; } }, metadata: _metadata }, _batteryHealth_initializers, _batteryHealth_extraInitializers);
            __esDecorate(null, null, _functionalIssues_decorators, { kind: "field", name: "functionalIssues", static: false, private: false, access: { has: obj => "functionalIssues" in obj, get: obj => obj.functionalIssues, set: (obj, value) => { obj.functionalIssues = value; } }, metadata: _metadata }, _functionalIssues_initializers, _functionalIssues_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
const UPLOAD_DIR = join(__dirname, '..', '..', '..', '..', 'uploads', 'buyback');
let UpdateBuybackLeadDto = (() => {
    var _a;
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class UpdateBuybackLeadDto {
            constructor() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                this.notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [IsString()];
            _notes_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let BuybackController = (() => {
    let _classDecorators = [ApiTags('Buyback'), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _uploadPhoto_decorators;
    let _getStats_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _updateStatus_decorators;
    var BuybackController = _classThis = class {
        constructor(buybackService) {
            this.buybackService = (__runInitializers(this, _instanceExtraInitializers), buybackService);
        }
        // ─── Public: Submit a buyback lead ────────────────────────────────────────────
        async create(dto) {
            if (!dto.brand?.trim() || !dto.modelName?.trim() || !dto.phone?.trim()) {
                throw new BadRequestException({
                    code: 'INVALID_LEAD_DATA',
                    message: 'Brand, model name, and phone are required',
                });
            }
            const lead = await this.buybackService.create(dto);
            return {
                data: {
                    id: lead.id,
                    message: 'Your request has been submitted. Our team will contact you shortly.',
                },
            };
        }
        // ─── Public: Upload photos for a lead ─────────────────────────────────────────
        async uploadPhoto(id, file) {
            if (!file) {
                throw new BadRequestException({ code: 'PHOTO_REQUIRED', message: 'Photo file is required' });
            }
            const photoUrl = `/uploads/buyback/${file.filename}`;
            const photo = await this.buybackService.addPhoto(id, photoUrl);
            return { status: 'success', data: { id: photo.id, url: photo.url } };
        }
        // ─── Admin: Stats ─────────────────────────────────────────────────────────
        async getStats() {
            const stats = await this.buybackService.getStats();
            return { status: 'success', data: stats };
        }
        // ─── Admin: List leads ────────────────────────────────────────────────────────
        async findAll(query) {
            return this.buybackService.findAll({
                page: query.page ? Number(query.page) : undefined,
                limit: query.limit ? Number(query.limit) : undefined,
                status: query.status,
                search: query.search,
            });
        }
        // ─── Admin: Get lead by ID ────────────────────────────────────────────────────
        async findById(id) {
            const lead = await this.buybackService.findById(id);
            if (!lead) {
                throw new BadRequestException({ code: 'LEAD_NOT_FOUND', message: 'Lead not found' });
            }
            return { data: lead };
        }
        // ─── Admin: Update lead status ────────────────────────────────────────────────
        async updateStatus(id, dto) {
            const lead = await this.buybackService.updateStatus(id, dto.status, dto.notes);
            if (!lead) {
                throw new BadRequestException({ code: 'LEAD_NOT_FOUND', message: 'Lead not found' });
            }
            return { data: lead };
        }
    };
    __setFunctionName(_classThis, "BuybackController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post('public/buyback/leads'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Submit a buyback/sell lead (public)' })];
        _uploadPhoto_decorators = [Post('public/buyback/leads/:id/photos'), UseInterceptors(FileInterceptor('photo', {
                storage: diskStorage({
                    destination: (_req, _file, cb) => {
                        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
                        cb(null, UPLOAD_DIR);
                    },
                    filename: (_req, file, cb) => {
                        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extname(file.originalname)}`;
                        cb(null, uniqueName);
                    },
                }),
                limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per photo
            })), ApiConsumes('multipart/form-data'), ApiOperation({ summary: 'Upload a photo for a buyback lead (public)' }), HttpCode(HttpStatus.CREATED)];
        _getStats_decorators = [Get('buyback/stats'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('buyback.view'), ApiBearerAuth(), ApiOperation({ summary: 'Buyback lead statistics (by status, condition, trend)' })];
        _findAll_decorators = [Get('buyback/leads'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('buyback.view'), ApiBearerAuth(), ApiOperation({ summary: 'List buyback leads (admin)' })];
        _findById_decorators = [Get('buyback/leads/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('buyback.view'), ApiBearerAuth(), ApiOperation({ summary: 'Get buyback lead by ID (admin)' })];
        _updateStatus_decorators = [Patch('buyback/leads/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('buyback.edit'), ApiBearerAuth(), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Update buyback lead status (admin)' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadPhoto_decorators, { kind: "method", name: "uploadPhoto", static: false, private: false, access: { has: obj => "uploadPhoto" in obj, get: obj => obj.uploadPhoto }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BuybackController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BuybackController = _classThis;
})();
export { BuybackController };
//# sourceMappingURL=buyback.controller.js.map