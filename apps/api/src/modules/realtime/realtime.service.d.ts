import { DomainEventEmitter, SaleCreatedPayload, SaleVoidedPayload, InventoryUpdatedPayload, InventoryLockedPayload, InventoryUnlockedPayload, OrderCreatedPayload, OrderStatusChangedPayload, PaymentConfirmedPayload, TransferReceivedPayload, TransferUpdatedPayload, NotificationNewPayload } from '../../common/events/domain-events';
export declare class RealtimeService implements DomainEventEmitter {
    private readonly logger;
    private server;
    setServer(server: any): void;
    emit(room: string, event: string, data: any): void;
    emitSaleCreated(branchId: string, data: SaleCreatedPayload): void;
    emitSaleVoided(branchId: string, data: SaleVoidedPayload): void;
    emitInventoryUpdated(branchId: string, data: InventoryUpdatedPayload): void;
    emitInventoryLocked(branchId: string, data: InventoryLockedPayload): void;
    emitInventoryUnlocked(branchId: string, data: InventoryUnlockedPayload): void;
    emitOrderCreated(branchId: string, data: OrderCreatedPayload): void;
    emitOrderStatusChanged(data: OrderStatusChangedPayload): void;
    emitPaymentConfirmed(data: PaymentConfirmedPayload): void;
    emitTransferCreated(fromBranchId: string, data: TransferUpdatedPayload): void;
    emitTransferReceived(branchId: string, data: TransferReceivedPayload): void;
    emitTransferUpdated(branchId: string, data: TransferUpdatedPayload): void;
    emitReturnCreated(branchId: string, data: any): void;
    emitNotificationNew(userId: string, data: NotificationNewPayload): void;
    emitDashboardRefresh(branchId?: string): void;
}
//# sourceMappingURL=realtime.service.d.ts.map