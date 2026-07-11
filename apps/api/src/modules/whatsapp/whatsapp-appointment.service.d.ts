import { Repository } from 'typeorm';
import { WhatsappAppointment } from './entities/whatsapp-appointment.entity';
import { NotificationService } from '../notification/notification.service';
export declare class WhatsappAppointmentService {
    private appointmentRepo;
    private notificationService;
    private readonly logger;
    constructor(appointmentRepo: Repository<WhatsappAppointment>, notificationService: NotificationService);
    create(dto: {
        phone: string;
        name?: string;
        type: string;
        scheduledAt: Date;
        clientId?: string;
        notes?: string;
        metadata?: Record<string, any>;
        createdBy?: string;
    }): Promise<WhatsappAppointment>;
    getAppointments(query: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        phone?: string;
        staffId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        data: WhatsappAppointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAppointmentById(id: string): Promise<WhatsappAppointment>;
    updateStatus(id: string, status: string, userId?: string): Promise<WhatsappAppointment>;
    assignStaff(id: string, staffId: string): Promise<WhatsappAppointment>;
    submitFeedback(id: string, rating: number, comment?: string): Promise<WhatsappAppointment>;
    processReminders(): Promise<{
        sent24h: number;
        sent2h: number;
    }>;
    private sendConfirmation;
    private sendStatusUpdate;
    private sendReminder;
}
//# sourceMappingURL=whatsapp-appointment.service.d.ts.map