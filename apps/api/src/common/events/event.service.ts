import { Injectable, Logger } from '@nestjs/common';
import { RealtimeService } from '../../modules/realtime/realtime.service';
import {
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
} from './domain-events';

/**
 * EventService — central event emitter that ALL business services use.
 *
 * This decouples business logic from the transport layer (Socket.io).
 * If the transport changes (e.g., to WebSockets, Server-Sent Events, or a message queue),
 * only this service needs to change.
 */
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly realtime: RealtimeService) {}

  // ─── Sales ────────────────────────────────────────────────────────────────────

  emitSaleCreated(branchId: string, data: SaleCreatedPayload): void {
    this.logger.debug(`[Event] sale.created: branch=${branchId} sale=${data.saleId}`);
    this.realtime.emitSaleCreated(branchId, data);
  }

  emitSaleVoided(branchId: string, data: SaleVoidedPayload): void {
    this.logger.debug(`[Event] sale.voided: branch=${branchId} sale=${data.saleId}`);
    this.realtime.emitSaleVoided(branchId, data);
  }

  // ─── Inventory ────────────────────────────────────────────────────────────────

  emitInventoryUpdated(branchId: string, data: InventoryUpdatedPayload): void {
    this.logger.debug(`[Event] inventory.updated: branch=${branchId} item=${data.itemId}`);
    this.realtime.emitInventoryUpdated(branchId, data);
  }

  emitInventoryLocked(branchId: string, data: InventoryLockedPayload): void {
    this.logger.debug(`[Event] inventory.locked: branch=${branchId} item=${data.itemId}`);
    this.realtime.emitInventoryLocked(branchId, data);
  }

  emitInventoryUnlocked(branchId: string, data: InventoryUnlockedPayload): void {
    this.logger.debug(`[Event] inventory.unlocked: branch=${branchId} item=${data.itemId}`);
    this.realtime.emitInventoryUnlocked(branchId, data);
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  emitOrderCreated(branchId: string, data: OrderCreatedPayload): void {
    this.logger.debug(`[Event] order.created: branch=${branchId} order=${data.orderId}`);
    this.realtime.emitOrderCreated(branchId, data);
  }

  emitOrderStatusChanged(data: OrderStatusChangedPayload): void {
    this.logger.debug(`[Event] order.status_changed: order=${data.orderId} status=${data.status}`);
    this.realtime.emitOrderStatusChanged(data);
  }

  // ─── Payments ─────────────────────────────────────────────────────────────────

  emitPaymentConfirmed(data: PaymentConfirmedPayload): void {
    this.logger.debug(`[Event] payment.confirmed: order=${data.orderId} payment=${data.paymentId}`);
    this.realtime.emitPaymentConfirmed(data);
  }

  // ─── Transfers ────────────────────────────────────────────────────────────────

  emitTransferCreated(fromBranchId: string, data: TransferUpdatedPayload): void {
    this.logger.debug(`[Event] stock.transfer.created: fromBranch=${fromBranchId} transfer=${data.transferId}`);
    this.realtime.emitTransferCreated(fromBranchId, data);
  }

  emitTransferReceived(branchId: string, data: TransferReceivedPayload): void {
    this.logger.debug(`[Event] stock.transfer.received: branch=${branchId} transfer=${data.transferId}`);
    this.realtime.emitTransferReceived(branchId, data);
  }

  emitTransferUpdated(branchId: string, data: TransferUpdatedPayload): void {
    this.logger.debug(`[Event] stock.transfer.updated: branch=${branchId} transfer=${data.transferId}`);
    this.realtime.emitTransferUpdated(branchId, data);
  }

  // ─── Returns ──────────────────────────────────────────────────────────────────

  emitReturnCreated(branchId: string, data: any): void {
    this.logger.debug(`[Event] return.created: branch=${branchId} returnId=${data.returnId}`);
    this.realtime.emitReturnCreated(branchId, data);
  }

  // ─── Notifications ────────────────────────────────────────────────────────────

  emitNotificationNew(userId: string, data: NotificationNewPayload): void {
    this.logger.debug(`[Event] notification.new: user=${userId} type=${data.type}`);
    this.realtime.emitNotificationNew(userId, data);
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────────

  emitDashboardRefresh(branchId?: string): void {
    this.logger.debug(`[Event] dashboard.refresh${branchId ? `: branch=${branchId}` : ': admin'}`);
    this.realtime.emitDashboardRefresh(branchId);
  }
}
