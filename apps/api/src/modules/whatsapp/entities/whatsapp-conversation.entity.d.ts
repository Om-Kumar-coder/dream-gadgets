import { WhatsappMessage } from './whatsapp-message.entity';
export declare class WhatsappConversation {
    id: string;
    customerPhone: string;
    customerName: string | null;
    type: string;
    status: string;
    assignedStaffId: string | null;
    priority: string;
    tags: object | null;
    lastMessageAt: Date | null;
    lastMessagePreview: string | null;
    unreadCount: number;
    metadata: object | null;
    createdAt: Date;
    updatedAt: Date;
    messages: WhatsappMessage[];
}
//# sourceMappingURL=whatsapp-conversation.entity.d.ts.map