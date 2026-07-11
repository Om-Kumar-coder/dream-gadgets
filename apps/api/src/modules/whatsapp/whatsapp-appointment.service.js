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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Between } from 'typeorm';
let WhatsappAppointmentService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WhatsappAppointmentService = _classThis = class {
        constructor(appointmentRepo, notificationService) {
            this.appointmentRepo = appointmentRepo;
            this.notificationService = notificationService;
            this.logger = new Logger(WhatsappAppointmentService.name);
        }
        async create(dto) {
            if (!dto.phone || !dto.scheduledAt || !dto.type) {
                throw new BadRequestException({
                    code: 'MISSING_APPOINTMENT_FIELDS',
                    message: 'Phone, scheduledAt, and type are required',
                });
            }
            if (dto.scheduledAt < new Date()) {
                throw new BadRequestException({
                    code: 'PAST_APPOINTMENT',
                    message: 'Cannot schedule an appointment in the past',
                });
            }
            const appointment = this.appointmentRepo.create({
                phone: dto.phone,
                name: dto.name ?? null,
                type: dto.type,
                scheduledAt: dto.scheduledAt,
                clientId: dto.clientId ?? null,
                notes: dto.notes ?? null,
                metadata: dto.metadata ?? null,
                createdBy: dto.createdBy ?? null,
            });
            const saved = await this.appointmentRepo.save(appointment);
            // Send confirmation notification
            await this.sendConfirmation(saved);
            return saved;
        }
        async getAppointments(query) {
            const { page = 1, limit = 20, status, type, phone, staffId, fromDate, toDate } = query;
            const qb = this.appointmentRepo
                .createQueryBuilder('a')
                .orderBy('a.scheduledAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (status)
                qb.andWhere('a.status = :status', { status });
            if (type)
                qb.andWhere('a.type = :type', { type });
            if (phone)
                qb.andWhere('a.phone = :phone', { phone });
            if (staffId)
                qb.andWhere('a.staffId = :staffId', { staffId });
            if (fromDate)
                qb.andWhere('a.scheduledAt >= :fromDate', { fromDate: new Date(fromDate) });
            if (toDate)
                qb.andWhere('a.scheduledAt <= :toDate', { toDate: new Date(toDate) });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        async getAppointmentById(id) {
            const appointment = await this.appointmentRepo.findOne({ where: { id } });
            if (!appointment)
                throw new NotFoundException(`Appointment ${id} not found`);
            return appointment;
        }
        async updateStatus(id, status, userId) {
            const appointment = await this.getAppointmentById(id);
            const validTransitions = {
                scheduled: ['confirmed', 'cancelled', 'completed'],
                confirmed: ['in_progress', 'cancelled', 'completed'],
                in_progress: ['completed', 'cancelled'],
            };
            const allowed = validTransitions[appointment.status] ?? [];
            if (!allowed.includes(status)) {
                throw new BadRequestException({
                    code: 'INVALID_APPOINTMENT_TRANSITION',
                    message: `Cannot transition from '${appointment.status}' to '${status}'`,
                });
            }
            appointment.status = status;
            if (userId)
                appointment.staffId = userId;
            const saved = await this.appointmentRepo.save(appointment);
            // Send status update notification
            await this.sendStatusUpdate(saved);
            return saved;
        }
        async assignStaff(id, staffId) {
            const appointment = await this.getAppointmentById(id);
            appointment.staffId = staffId;
            return this.appointmentRepo.save(appointment);
        }
        async submitFeedback(id, rating, comment) {
            if (rating < 1 || rating > 5) {
                throw new BadRequestException({ code: 'INVALID_RATING', message: 'Rating must be between 1 and 5' });
            }
            const appointment = await this.getAppointmentById(id);
            appointment.feedbackRating = rating;
            appointment.feedbackComment = comment ?? null;
            return this.appointmentRepo.save(appointment);
        }
        async processReminders() {
            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            let sent24h = 0;
            let sent2h = 0;
            // 24-hour reminders
            const due24h = await this.appointmentRepo.find({
                where: {
                    status: 'scheduled',
                    scheduledAt: Between(now, in24h),
                    reminder24hSent: false,
                },
            });
            for (const appt of due24h) {
                try {
                    await this.sendReminder(appt, '24h');
                    appt.reminder24hSent = true;
                    await this.appointmentRepo.save(appt);
                    sent24h++;
                }
                catch (err) {
                    this.logger.warn(`Failed to send 24h reminder for appointment ${appt.id}: ${err?.message}`);
                }
            }
            // 2-hour reminders
            const due2h = await this.appointmentRepo.find({
                where: {
                    status: 'scheduled',
                    scheduledAt: Between(now, in2h),
                    reminder2hSent: false,
                },
            });
            for (const appt of due2h) {
                try {
                    await this.sendReminder(appt, '2h');
                    appt.reminder2hSent = true;
                    await this.appointmentRepo.save(appt);
                    sent2h++;
                }
                catch (err) {
                    this.logger.warn(`Failed to send 2h reminder for appointment ${appt.id}: ${err?.message}`);
                }
            }
            return { sent24h, sent2h };
        }
        // ─── Notifications ──────────────────────────────────────────────────────────
        async sendConfirmation(appointment) {
            const typeLabel = appointment.type.replace(/_/g, ' ');
            const dateStr = appointment.scheduledAt.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            });
            const timeStr = appointment.scheduledAt.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
            });
            const message = [
                `📅 *Appointment Confirmed*`,
                ``,
                `Dear ${appointment.name ?? 'Customer'},`,
                ``,
                `Your ${typeLabel} appointment has been scheduled.`,
                `📆 *Date:* ${dateStr}`,
                `⏰ *Time:* ${timeStr}`,
                ``,
                `Please visit our store at your scheduled time.`,
                `For any changes, please contact us.`,
                ``,
                `— Dream Gadgets Team`,
            ].join('\n');
            await this.notificationService.sendWhatsApp({
                to: appointment.phone,
                type: 'appointment_confirmed',
                body: message,
                metadata: { appointmentId: appointment.id, type: appointment.type },
            }).catch((err) => this.logger.warn(`Failed to send appointment confirmation to ${appointment.phone}: ${err?.message}`));
        }
        async sendStatusUpdate(appointment) {
            const statusLabels = {
                confirmed: 'has been confirmed',
                cancelled: 'has been cancelled',
                completed: 'has been marked as completed',
                in_progress: 'is now in progress',
            };
            const label = statusLabels[appointment.status] ?? `is now ${appointment.status}`;
            const typeLabel = appointment.type.replace(/_/g, ' ');
            const message = [
                `📋 *Appointment Update*`,
                ``,
                `Dear ${appointment.name ?? 'Customer'},`,
                ``,
                `Your ${typeLabel} appointment scheduled for ${appointment.scheduledAt.toLocaleDateString('en-IN')} ${label}.`,
                ``,
                `— Dream Gadgets Team`,
            ].join('\n');
            await this.notificationService.sendWhatsApp({
                to: appointment.phone,
                type: 'appointment_status',
                body: message,
                metadata: { appointmentId: appointment.id, status: appointment.status },
            }).catch((err) => this.logger.warn(`Failed to send appointment status update to ${appointment.phone}: ${err?.message}`));
        }
        async sendReminder(appointment, type) {
            const typeLabel = appointment.type.replace(/_/g, ' ');
            const timeStr = appointment.scheduledAt.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
            });
            const dateStr = appointment.scheduledAt.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
            });
            const prefix = type === '24h' ? '24 hours' : '2 hours';
            const message = [
                `⏰ *Reminder: ${typeLabel} Appointment*`,
                ``,
                `Dear ${appointment.name ?? 'Customer'},`,
                ``,
                `This is a reminder that your ${typeLabel} appointment is in *${prefix}*.`,
                `📆 *Date:* ${dateStr}`,
                `⏰ *Time:* ${timeStr}`,
                ``,
                `Please be on time. To reschedule, reply to this message or contact us.`,
                ``,
                `— Dream Gadgets Team`,
            ].join('\n');
            await this.notificationService.sendWhatsApp({
                to: appointment.phone,
                type: 'appointment_reminder',
                body: message,
                metadata: { appointmentId: appointment.id, reminderType: type },
            });
        }
    };
    __setFunctionName(_classThis, "WhatsappAppointmentService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappAppointmentService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappAppointmentService = _classThis;
})();
export { WhatsappAppointmentService };
//# sourceMappingURL=whatsapp-appointment.service.js.map