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
};
//# sourceMappingURL=domain-events.js.map