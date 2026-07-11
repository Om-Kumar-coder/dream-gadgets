import { NotificationService } from './notification.service';
export declare class AdminNotificationsController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(page?: string, limit?: string, status?: string, channel?: string, userId?: string): Promise<{
        data: import("./entities/notification.entity").Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    getFailed(): Promise<{
        data: import("./entities/notification.entity").Notification[];
        total: number;
    }>;
    retry(id: string): Promise<{
        message: string;
        data: import("./entities/notification.entity").Notification;
    }>;
    retryAll(): Promise<{
        message: string;
        data: {
            retried: number;
        };
    }>;
}
//# sourceMappingURL=admin-notifications.controller.d.ts.map