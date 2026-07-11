var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, Patch, Delete, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let WhatsappController = (() => {
    let _classDecorators = [ApiTags('WhatsApp'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('whatsapp')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getConversations_decorators;
    let _getConversation_decorators;
    let _getMessages_decorators;
    let _updateConversation_decorators;
    let _sendMessage_decorators;
    let _getStats_decorators;
    let _getTemplates_decorators;
    let _getTemplate_decorators;
    let _createTemplate_decorators;
    let _updateTemplate_decorators;
    let _deleteTemplate_decorators;
    let _getCampaigns_decorators;
    let _getCampaign_decorators;
    let _createCampaign_decorators;
    let _updateCampaign_decorators;
    let _deleteCampaign_decorators;
    let _launchCampaign_decorators;
    let _getCampaignStats_decorators;
    let _getAppointments_decorators;
    let _createAppointment_decorators;
    let _updateAppointment_decorators;
    var WhatsappController = _classThis = class {
        constructor(whatsappService, whatsappTemplateService, whatsappAppointmentService, notificationService) {
            this.whatsappService = (__runInitializers(this, _instanceExtraInitializers), whatsappService);
            this.whatsappTemplateService = whatsappTemplateService;
            this.whatsappAppointmentService = whatsappAppointmentService;
            this.notificationService = notificationService;
        }
        // ─── Conversations ───────────────────────────────────────────────────────
        async getConversations(page, limit, status, type, search) {
            return this.whatsappService.getConversations({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status,
                type,
                search,
            });
        }
        async getConversation(id) {
            return this.whatsappService.getConversationById(id);
        }
        async getMessages(id, page, limit) {
            return this.whatsappService.getMessages(id, page ? Number(page) : 1, limit ? Number(limit) : 50);
        }
        async updateConversation(id, dto) {
            return this.whatsappService.updateConversation(id, dto);
        }
        // ─── Send message ────────────────────────────────────────────────────────
        async sendMessage(dto, user) {
            // Use notification system to send the WhatsApp message
            const notification = await this.notificationService.sendWhatsApp({
                to: dto.to,
                type: 'agent_message',
                body: dto.content,
                metadata: {
                    sentBy: user.sub,
                    conversationId: dto.conversationId,
                },
            });
            // If a conversationId was provided, also store the message locally
            if (dto.conversationId) {
                await this.whatsappService.storeMessage({
                    conversationId: dto.conversationId,
                    direction: 'outbound',
                    fromNumber: 'system',
                    toNumber: dto.to,
                    content: dto.content,
                    providerMessageId: notification.providerMessageId ?? undefined,
                    metadata: { sentBy: user.sub },
                });
            }
            return { status: 'sent', notificationId: notification.id };
        }
        // ─── Stats ───────────────────────────────────────────────────────────────
        async getStats() {
            const [activeCount, unreadCount] = await Promise.all([
                this.whatsappService.getConversationCount('active'),
                this.whatsappService.getUnreadCount(),
            ]);
            return {
                activeConversations: activeCount,
                unreadCount,
            };
        }
        // ─── Templates ────────────────────────────────────────────────────────────
        async getTemplates(page, limit, category, status, search) {
            return this.whatsappTemplateService.getTemplates({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                category,
                status,
                search,
            });
        }
        async getTemplate(id) {
            return this.whatsappTemplateService.getTemplateById(id);
        }
        async createTemplate(dto) {
            return this.whatsappTemplateService.createTemplate(dto);
        }
        async updateTemplate(id, dto) {
            return this.whatsappTemplateService.updateTemplate(id, dto);
        }
        async deleteTemplate(id) {
            await this.whatsappTemplateService.deleteTemplate(id);
        }
        // ─── Campaigns ────────────────────────────────────────────────────────────
        async getCampaigns(page, limit, status, type, search) {
            return this.whatsappTemplateService.getCampaigns({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status,
                type,
                search,
            });
        }
        async getCampaign(id) {
            return this.whatsappTemplateService.getCampaignById(id);
        }
        async createCampaign(dto) {
            return this.whatsappTemplateService.createCampaign(dto);
        }
        async updateCampaign(id, dto) {
            return this.whatsappTemplateService.updateCampaign(id, dto);
        }
        async deleteCampaign(id) {
            await this.whatsappTemplateService.deleteCampaign(id);
        }
        async launchCampaign(id) {
            return this.whatsappTemplateService.launchCampaign(id);
        }
        async getCampaignStats(id) {
            return this.whatsappTemplateService.getCampaignStats(id);
        }
        // ─── Appointments ─────────────────────────────────────────────────────────
        async getAppointments(page, limit, status, type, phone) {
            return this.whatsappAppointmentService.getAppointments({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status,
                type,
                phone,
            });
        }
        async createAppointment(dto) {
            return this.whatsappAppointmentService.create(dto);
        }
        async updateAppointment(id, dto) {
            return this.whatsappAppointmentService.updateStatus(id, dto.status);
        }
    };
    __setFunctionName(_classThis, "WhatsappController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getConversations_decorators = [Get('conversations'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'List WhatsApp conversations' })];
        _getConversation_decorators = [Get('conversations/:id'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get conversation with messages' })];
        _getMessages_decorators = [Get('conversations/:id/messages'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get messages for a conversation' })];
        _updateConversation_decorators = [Patch('conversations/:id'), RequirePermission('whatsapp.edit'), ApiOperation({ summary: 'Update conversation details (status, type, assignee, priority, tags)' })];
        _sendMessage_decorators = [Post('send'), RequirePermission('whatsapp.send'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Send a WhatsApp message to a phone number' })];
        _getStats_decorators = [Get('stats'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get WhatsApp conversation stats' })];
        _getTemplates_decorators = [Get('templates'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'List WhatsApp templates' })];
        _getTemplate_decorators = [Get('templates/:id'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get template by ID' })];
        _createTemplate_decorators = [Post('templates'), RequirePermission('whatsapp.create'), ApiOperation({ summary: 'Create a WhatsApp template' })];
        _updateTemplate_decorators = [Patch('templates/:id'), RequirePermission('whatsapp.edit'), ApiOperation({ summary: 'Update a WhatsApp template' })];
        _deleteTemplate_decorators = [Delete('templates/:id'), RequirePermission('whatsapp.delete'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete a WhatsApp template' })];
        _getCampaigns_decorators = [Get('campaigns'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'List WhatsApp campaigns' })];
        _getCampaign_decorators = [Get('campaigns/:id'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get campaign by ID' })];
        _createCampaign_decorators = [Post('campaigns'), RequirePermission('whatsapp.create'), ApiOperation({ summary: 'Create a WhatsApp campaign' })];
        _updateCampaign_decorators = [Patch('campaigns/:id'), RequirePermission('whatsapp.edit'), ApiOperation({ summary: 'Update a WhatsApp campaign' })];
        _deleteCampaign_decorators = [Delete('campaigns/:id'), RequirePermission('whatsapp.delete'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete a WhatsApp campaign' })];
        _launchCampaign_decorators = [Post('campaigns/:id/launch'), RequirePermission('whatsapp.edit'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Launch a WhatsApp campaign' })];
        _getCampaignStats_decorators = [Get('campaigns/:id/stats'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'Get campaign analytics stats' })];
        _getAppointments_decorators = [Get('appointments'), RequirePermission('whatsapp.view'), ApiOperation({ summary: 'List WhatsApp appointments' })];
        _createAppointment_decorators = [Post('appointments'), RequirePermission('whatsapp.create'), ApiOperation({ summary: 'Create a WhatsApp appointment' })];
        _updateAppointment_decorators = [Patch('appointments/:id'), RequirePermission('whatsapp.edit'), ApiOperation({ summary: 'Update appointment status' })];
        __esDecorate(_classThis, null, _getConversations_decorators, { kind: "method", name: "getConversations", static: false, private: false, access: { has: obj => "getConversations" in obj, get: obj => obj.getConversations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConversation_decorators, { kind: "method", name: "getConversation", static: false, private: false, access: { has: obj => "getConversation" in obj, get: obj => obj.getConversation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMessages_decorators, { kind: "method", name: "getMessages", static: false, private: false, access: { has: obj => "getMessages" in obj, get: obj => obj.getMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateConversation_decorators, { kind: "method", name: "updateConversation", static: false, private: false, access: { has: obj => "updateConversation" in obj, get: obj => obj.updateConversation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTemplates_decorators, { kind: "method", name: "getTemplates", static: false, private: false, access: { has: obj => "getTemplates" in obj, get: obj => obj.getTemplates }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTemplate_decorators, { kind: "method", name: "getTemplate", static: false, private: false, access: { has: obj => "getTemplate" in obj, get: obj => obj.getTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createTemplate_decorators, { kind: "method", name: "createTemplate", static: false, private: false, access: { has: obj => "createTemplate" in obj, get: obj => obj.createTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTemplate_decorators, { kind: "method", name: "updateTemplate", static: false, private: false, access: { has: obj => "updateTemplate" in obj, get: obj => obj.updateTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteTemplate_decorators, { kind: "method", name: "deleteTemplate", static: false, private: false, access: { has: obj => "deleteTemplate" in obj, get: obj => obj.deleteTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCampaigns_decorators, { kind: "method", name: "getCampaigns", static: false, private: false, access: { has: obj => "getCampaigns" in obj, get: obj => obj.getCampaigns }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCampaign_decorators, { kind: "method", name: "getCampaign", static: false, private: false, access: { has: obj => "getCampaign" in obj, get: obj => obj.getCampaign }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createCampaign_decorators, { kind: "method", name: "createCampaign", static: false, private: false, access: { has: obj => "createCampaign" in obj, get: obj => obj.createCampaign }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCampaign_decorators, { kind: "method", name: "updateCampaign", static: false, private: false, access: { has: obj => "updateCampaign" in obj, get: obj => obj.updateCampaign }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteCampaign_decorators, { kind: "method", name: "deleteCampaign", static: false, private: false, access: { has: obj => "deleteCampaign" in obj, get: obj => obj.deleteCampaign }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _launchCampaign_decorators, { kind: "method", name: "launchCampaign", static: false, private: false, access: { has: obj => "launchCampaign" in obj, get: obj => obj.launchCampaign }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCampaignStats_decorators, { kind: "method", name: "getCampaignStats", static: false, private: false, access: { has: obj => "getCampaignStats" in obj, get: obj => obj.getCampaignStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAppointments_decorators, { kind: "method", name: "getAppointments", static: false, private: false, access: { has: obj => "getAppointments" in obj, get: obj => obj.getAppointments }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createAppointment_decorators, { kind: "method", name: "createAppointment", static: false, private: false, access: { has: obj => "createAppointment" in obj, get: obj => obj.createAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateAppointment_decorators, { kind: "method", name: "updateAppointment", static: false, private: false, access: { has: obj => "updateAppointment" in obj, get: obj => obj.updateAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappController = _classThis;
})();
export { WhatsappController };
//# sourceMappingURL=whatsapp.controller.js.map