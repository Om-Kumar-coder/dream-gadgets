import { User } from '../../auth/entities/user.entity';
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    clientId: string;
    type: string;
    channel: string;
    subject: string | null;
    body: string | null;
    status: string;
    sentAt: Date | null;
    metadata: object | null;
    isRead: boolean;
    readAt: Date | null;
    attempts: number;
    providerMessageId: string | null;
    errorMessage: string | null;
    target: string | null;
    lastAttemptAt: Date | null;
    createdAt: Date;
}
//# sourceMappingURL=notification.entity.d.ts.map