import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RealtimeService {
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
    } catch (err: any) {
      this.logger.warn(`[Realtime] Emit failed: ${err?.message}`);
    }
  }

  // ─── 17.3 Domain event emitters ──────────────────────────────────────────────

  emitSaleCreated(branchId: string, data: { saleId: string; amount: number; branchId: string }): void {
    this.emit(`branch:${branchId}`, 'sale.created', data);
  }

  emitInventoryUpdated(branchId: string, data: { itemId: string; status: string; branchId: string }): void {
    this.emit(`branch:${branchId}`, 'inventory.updated', data);
  }

  emitOrderStatusChanged(data: { orderId: string; status: string }): void {
    this.emit('admin', 'order.status_changed', data);
  }

  emitTransferReceived(branchId: string, data: { transferId: string; branchId: string }): void {
    this.emit(`branch:${branchId}`, 'transfer.received', data);
  }

  emitNotificationNew(userId: string, data: { notificationId: string; type: string; subject: string }): void {
    this.emit(`user:${userId}`, 'notification.new', data);
  }

  emitDashboardRefresh(branchId?: string): void {
    const room = branchId ? `branch:${branchId}` : 'admin';
    this.emit(room, 'dashboard.refresh', { timestamp: new Date().toISOString() });
  }

  emitPaymentConfirmed(data: { orderId: string; paymentId: string; amount: number }): void {
    this.emit('admin', 'payment.confirmed', data);
  }

  // ─── 17.4 POS item lock/unlock ────────────────────────────────────────────────

  emitInventoryLocked(branchId: string, data: { itemId: string; imei: string; lockedBy: string }): void {
    this.emit(`branch:${branchId}`, 'inventory.locked', data);
  }

  emitInventoryUnlocked(branchId: string, data: { itemId: string; imei: string }): void {
    this.emit(`branch:${branchId}`, 'inventory.unlocked', data);
  }
}
