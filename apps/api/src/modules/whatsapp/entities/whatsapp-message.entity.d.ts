import { WhatsappConversation } from './whatsapp-conversation.entity';
export declare class WhatsappMessage {
    id: string;
    conversationId: string;
    conversation: WhatsappConversation;
    direction: string;
    fromNumber: string;
    toNumber: string;
    content: string | null;
    contentType: string;
    mediaUrl: string | null;
    mediaMimeType: string | null;
    mediaFilename: string | null;
    status: string;
    providerMessageId: string | null;
    errorMessage: string | null;
    metadata: object | null;
    createdAt: Date;
}
//# sourceMappingURL=whatsapp-message.entity.d.ts.map