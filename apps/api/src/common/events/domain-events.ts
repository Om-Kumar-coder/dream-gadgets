/**
 * Domain event names — single source of truth for all realtime events.
 * Every event emitted via Socket.io uses these constants.
 */
export const DomainEvents = {
  SALE_CREATED: 'sale.created',
  SALE_VOIDED: 'sale.voided',
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_LOCKED: 'inventory.locked',
  INVENTORY_UNLOCKED: 'inventory.unlocked',
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  STOCK_TRANSFER_CREATED: 'stock.transfer.created',
  STOCK_TRANSFER_UPDATED: 'stock.transfer.updated',
  NOTIFICATION_CREATED: 'notification.created',
  DASHBOARD_REFRESH: 'dashboard.refresh',
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];

// ─── Event payload types ────────────────────────────────────────────────────

export interface SaleCreatedPayload {
  saleId: string;
  invoiceNumber: string;
  amount: number;
  branchId: string;
  timestamp: string;
}

export interface SaleVoidedPayload {
  saleId: string;
  invoiceNumber: string;
  branchId: string;
  timestamp: string;
}

export interface InventoryUpdatedPayload {
  itemId: string;
  imei: string;
  status: string;
  branchId: string;
  timestamp: string;
}

export interface InventoryLockedPayload {
  itemId: string;
  imei: string;
  lockedBy: string;
  branchId: string;
  timestamp: string;
}

export interface InventoryUnlockedPayload {
  itemId: string;
  imei: string;
  branchId: string;
  timestamp: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  branchId: string;
  timestamp: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatus: string;
  branchId?: string;
  timestamp: string;
}

export interface PaymentConfirmedPayload {
  orderId: string;
  paymentId: string;
  amount: number;
  timestamp: string;
}

export interface TransferReceivedPayload {
  transferId: string;
  transferNumber: string;
  status: string;
  fromBranchId: string;
  toBranchId: string;
  branchId: string;
  timestamp: string;
}

export interface TransferUpdatedPayload {
  transferId: string;
  transferNumber: string;
  status: string;
  fromBranchId: string;
  toBranchId: string;
  branchId: string;
  timestamp: string;
}

export interface NotificationNewPayload {
  notificationId: string;
  type: string;
  subject: string;
  body?: string;
  createdAt: string;
}

export interface DashboardRefreshPayload {
  timestamp: string;
}

// ─── Emitter interface (for type-safe injection) ─────────────────────────────

export interface DomainEventEmitter {
  emitSaleCreated(branchId: string, data: SaleCreatedPayload): void;
  emitSaleVoided(branchId: string, data: SaleVoidedPayload): void;
  emitInventoryUpdated(branchId: string, data: InventoryUpdatedPayload): void;
  emitInventoryLocked(branchId: string, data: InventoryLockedPayload): void;
  emitInventoryUnlocked(branchId: string, data: InventoryUnlockedPayload): void;
  emitOrderCreated(branchId: string, data: OrderCreatedPayload): void;
  emitOrderStatusChanged(data: OrderStatusChangedPayload): void;
  emitPaymentConfirmed(data: PaymentConfirmedPayload): void;
  emitTransferReceived(branchId: string, data: TransferReceivedPayload): void;
  emitTransferUpdated(branchId: string, data: TransferUpdatedPayload): void;
  emitNotificationNew(userId: string, data: NotificationNewPayload): void;
  emitDashboardRefresh(branchId?: string): void;
}
