import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { WhatsappAppointment } from './entities/whatsapp-appointment.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WhatsappAppointmentService {
  private readonly logger = new Logger(WhatsappAppointmentService.name);

  constructor(
    @InjectRepository(WhatsappAppointment)
    private appointmentRepo: Repository<WhatsappAppointment>,
    private notificationService: NotificationService,
  ) {}

  async create(dto: {
    phone: string;
    name?: string;
    type: string;
    scheduledAt: Date;
    clientId?: string;
    notes?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<WhatsappAppointment> {
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

  async getAppointments(query: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    phone?: string;
    staffId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ data: WhatsappAppointment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, type, phone, staffId, fromDate, toDate } = query;
    const qb = this.appointmentRepo
      .createQueryBuilder('a')
      .orderBy('a.scheduledAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('a.status = :status', { status });
    if (type) qb.andWhere('a.type = :type', { type });
    if (phone) qb.andWhere('a.phone = :phone', { phone });
    if (staffId) qb.andWhere('a.staffId = :staffId', { staffId });
    if (fromDate) qb.andWhere('a.scheduledAt >= :fromDate', { fromDate: new Date(fromDate) });
    if (toDate) qb.andWhere('a.scheduledAt <= :toDate', { toDate: new Date(toDate) });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getAppointmentById(id: string): Promise<WhatsappAppointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  async updateStatus(id: string, status: string, userId?: string): Promise<WhatsappAppointment> {
    const appointment = await this.getAppointmentById(id);
    const validTransitions: Record<string, string[]> = {
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
    if (userId) appointment.staffId = userId;

    const saved = await this.appointmentRepo.save(appointment);

    // Send status update notification
    await this.sendStatusUpdate(saved);

    return saved;
  }

  async assignStaff(id: string, staffId: string): Promise<WhatsappAppointment> {
    const appointment = await this.getAppointmentById(id);
    appointment.staffId = staffId;
    return this.appointmentRepo.save(appointment);
  }

  async submitFeedback(id: string, rating: number, comment?: string): Promise<WhatsappAppointment> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException({ code: 'INVALID_RATING', message: 'Rating must be between 1 and 5' });
    }
    const appointment = await this.getAppointmentById(id);
    appointment.feedbackRating = rating;
    appointment.feedbackComment = comment ?? null;
    return this.appointmentRepo.save(appointment);
  }

  async processReminders(): Promise<{ sent24h: number; sent2h: number }> {
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
      } catch (err: any) {
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
      } catch (err: any) {
        this.logger.warn(`Failed to send 2h reminder for appointment ${appt.id}: ${err?.message}`);
      }
    }

    return { sent24h, sent2h };
  }

  // ─── Notifications ──────────────────────────────────────────────────────────

  private async sendConfirmation(appointment: WhatsappAppointment): Promise<void> {
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
    }).catch((err: any) =>
      this.logger.warn(`Failed to send appointment confirmation to ${appointment.phone}: ${err?.message}`),
    );
  }

  private async sendStatusUpdate(appointment: WhatsappAppointment): Promise<void> {
    const statusLabels: Record<string, string> = {
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
    }).catch((err: any) =>
      this.logger.warn(`Failed to send appointment status update to ${appointment.phone}: ${err?.message}`),
    );
  }

  private async sendReminder(appointment: WhatsappAppointment, type: '24h' | '2h'): Promise<void> {
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
}
