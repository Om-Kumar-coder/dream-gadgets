import { NotificationService } from './notification.service';
import { JwtPayload } from '@dream-gadgets/shared-types';
export declare class NotificationsController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(user: JwtPayload): Promise<{
        notifications: import("./entities/notification.entity").Notification[];
        unreadCount: number;
    }>;
    markRead(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
    markAllRead(user: JwtPayload): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notification.controller.d.ts.map