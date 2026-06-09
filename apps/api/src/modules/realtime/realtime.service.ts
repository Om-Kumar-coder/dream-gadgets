import { Injectable, Logger } from '@nestjs/common';
import {
  DomainEventEmitter,
  SaleCreatedPayload,
  SaleVoidedPayload,
  InventoryUpdatedPayload,
  InventoryLockedPayload,
  InventoryUnlockedPayload,
  OrderCreatedPayload,
  OrderStatusChangedPayload,
  PaymentConfirmedPayload,
  TransferReceivedPayload,
  TransferUpdatedPayload,
  NotificationNewPayload,
  DashboardRefreshPayload,
} from '../../common/events/domain-events';

@Injectable()
export class RealtimeService implements DomainEventEmitter {
  private readonly logger = new Logger(RealtimeService.name);
  private server: any = null;

  // Called by the gateway to register the Socket.io server
  setServer(server: any): void {
    this.server = server;
  }

  // ─── Core emit method ─────────────────────────────────────────────────────────

  emit(room: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.debug(`[Realtime] No server — skipping emit: ${event} → ${room}`);
      return;
    }
    try {
      this.server.to(room).emit(event, data);
      this.logger.debug(`[Realtime] Emitted ${event} → ${room}`);
    } catch (err: any) {
      this.logger.warn(`[Realtime] Emit failed: ${err?.message}`);
    }
  }

  // ─── Sales events ────────────────────────────────────────────────────────────

  emitSaleCreated(branchId: string, data: SaleCreatedPayload): void {
    this.emit(`branch:${branchId}`, 'sale.created', data);
    this.emit('admin', 'sale.created', data);
  }

  emitSaleVoided(branchId: string, data: SaleVoidedPayload): void {
    this.emit(`branch:${branchId}`, 'sale.voided', data);
    this.emit('admin', 'sale.voided', data);
  }

  // ─── Inventory events ────────────────────────────────────────────────────────

  emitInventoryUpdated(branchId: string, data: InventoryUpdatedPayload): void {
    this.emit(`branch:${branchId}`, 'inventory.updated', data);
  }

  emitInventoryLocked(branchId: string, data: InventoryLockedPayload): void {
    this.emit(`branch:${branchId}`, 'inventory.locked', data);
  }

  emitInventoryUnlocked(branchId: string, data: InventoryUnlockedPayload): void {
    this.emit(`branch:${branchId}`, 'inventory.unlocked', data);
  }

  // ─── Order events ────────────────────────────────────────────────────────────

  emitOrderCreated(branchId: string, data: OrderCreatedPayload): void {
    this.emit(`branch:${branchId}`, 'order.created', data);
    this.emit('admin', 'order.created', data);
  }

  emitOrderStatusChanged(data: OrderStatusChangedPayload): void {
    this.emit('admin', 'order.status_changed', data);
    if (data.branchId) {
      this.emit(`branch:${data.branchId}`, 'order.status_changed', data);
    }
  }

  // ─── Payment events ──────────────────────────────────────────────────────────

  emitPaymentConfirmed(data: PaymentConfirmedPayload): void {
    this.emit('admin', 'payment.confirmed', data);
  }

  // ─── Transfer events ─────────────────────────────────────────────────────────

  emitTransferCreated(fromBranchId: string, data: TransferUpdatedPayload): void {
    // Notify source branch, destination branch, and admin room
    this.emit(`branch:${fromBranchId}`, 'stock.transfer.created', data);
    if (data.toBranchId && data.toBranchId !== data.branchId) {
      this.emit(`branch:${data.toBranchId}`, 'stock.transfer.created', data);
    }
    this.emit('admin', 'stock.transfer.created', data);
  }

  emitTransferReceived(branchId: string, data: TransferReceivedPayload): void {
    this.emit(`branch:${branchId}`, 'stock.transfer.received', data);
  }

  emitTransferUpdated(branchId: string, data: TransferUpdatedPayload): void {
    this.emit(`branch:${branchId}`, 'stock.transfer.updated', data);
    this.emit('admin', 'stock.transfer.updated', data);
  }

  // ─── Return events ────────────────────────────────────────────────────────────

  emitReturnCreated(branchId: string, data: any): void {
    this.emit(`branch:${branchId}`, 'return.created', data);
    this.emit('admin', 'return.created', data);
  }

  // ─── Notification events ─────────────────────────────────────────────────────

  emitNotificationNew(userId: string, data: NotificationNewPayload): void {
    this.emit(`user:${userId}`, 'notification.new', data);
  }

  // ─── Dashboard events ────────────────────────────────────────────────────────

  emitDashboardRefresh(branchId?: string): void {
    const room = branchId ? `branch:${branchId}` : 'admin';
    this.emit(room, 'dashboard.refresh', { timestamp: new Date().toISOString() } as DashboardRefreshPayload);
  }
}
