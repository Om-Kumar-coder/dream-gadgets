'use client';

/**
 * Shared inventory row actions (Phase 6/18): Edit, Change Selling Price, Delete.
 * Used by both the Inventory page and the Store Details page so behaviour and
 * authorization UX stay identical in the two entry points.
 *
 * - Edit / Change Price update the EXISTING inventory record in place — the
 *   backend never deletes/recreates, so IMEI + inventory identity are preserved.
 * - Delete is a soft-delete (archive) with a confirmation dialog; the server
 *   refuses units that participate in sales/transfer history.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, IndianRupee, Trash2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/auth.store';

export interface InventoryRow {
  id: string;
  imei: string;
  itemName?: string | null;
  colour?: string | null;
  storage?: string | null;
  condition?: string;
  status: string;
  sellingPrice?: number | string | null;
  purchasePrice?: number | string | null;
}

function errText(err: any, fallback: string): string {
  return (
    err?.response?.data?.error?.message ??
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="card w-full max-w-md p-5 space-y-4 bg-surface-0 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-surface-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Change Selling Price ─────────────────────────────────────────────────────

export function ChangePriceDialog({
  item,
  onClose,
}: {
  item: InventoryRow;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [price, setPrice] = useState(
    item.sellingPrice != null ? String(item.sellingPrice) : '',
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch(`/inventory/${item.id}/selling-price`, {
        sellingPrice: Number(price),
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Price updated for ${item.imei}`);
      onClose();
    },
    onError: (error: any) => toast.error(errText(error, 'Failed to update price')),
  });

  return (
    <Modal title="Change Selling Price" onClose={onClose}>
      <p className="text-sm text-surface-500">
        {item.itemName ?? item.imei}
        {item.colour ? ` · ${item.colour}` : ''}
        {item.storage ? ` · ${item.storage}` : ''}
      </p>
      <div>
        <label className="block text-xs font-medium text-surface-600 mb-1">
          New selling price (₹)
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input"
          autoFocus
        />
        <p className="text-[11px] text-surface-400 mt-1.5">
          Updates this inventory unit in place. Historical sales keep their original price.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          isLoading={mutation.isPending}
          disabled={price === '' || Number.isNaN(Number(price))}
          onClick={() => mutation.mutate()}
        >
          Update Price
        </Button>
      </div>
    </Modal>
  );
}

// ─── Delete (soft) ────────────────────────────────────────────────────────────

export function DeleteDialog({ item, onClose }: { item: InventoryRow; onClose: () => void }) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete(`/inventory/${item.id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Inventory item ${item.imei} deleted`);
      onClose();
    },
    onError: (error: any) => toast.error(errText(error, 'Failed to delete item')),
  });

  return (
    <Modal title="Delete this inventory item?" onClose={onClose}>
      <p className="text-sm text-surface-600">
        <span className="font-mono">{item.imei}</span>
        {item.itemName ? ` — ${item.itemName}` : ''} will be removed from active inventory.
      </p>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Sold or transferred items are protected by the server and cannot be deleted.
        Historical records are never altered.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white"
          isLoading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function EditDialog({ item, onClose }: { item: InventoryRow; onClose: () => void }) {
  const qc = useQueryClient();
  const [purchasePrice, setPurchasePrice] = useState(
    item.purchasePrice != null ? String(item.purchasePrice) : '',
  );
  const [colour, setColour] = useState(item.colour ?? '');
  const [storage, setStorage] = useState(item.storage ?? '');
  const [condition, setCondition] = useState(item.condition ?? 'good');

  const mutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        colour: colour || undefined,
        storage: storage || undefined,
        condition,
      };
      if (purchasePrice !== '' && !Number.isNaN(Number(purchasePrice))) {
        body.purchasePrice = Number(purchasePrice);
      }
      const { data } = await apiClient.patch(`/inventory/${item.id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Inventory item ${item.imei} updated`);
      onClose();
    },
    onError: (error: any) => toast.error(errText(error, 'Failed to update item')),
  });

  return (
    <Modal title="Edit Inventory Item" onClose={onClose}>
      <p className="text-sm text-surface-500">
        IMEI <span className="font-mono">{item.imei}</span> and product identity remain unchanged.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Purchase price (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="select">
            <option value="sealed_pack">Sealed Pack</option>
            <option value="open_box">Open Box</option>
            <option value="super_mint">Super Mint</option>
            <option value="mint">Mint</option>
            <option value="good">Good</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Colour</label>
          <input value={colour} onChange={(e) => setColour(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Storage</label>
          <input value={storage} onChange={(e) => setStorage(e.target.value)} className="input" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

// ─── Actions dropdown wiring ──────────────────────────────────────────────────

export function useInventoryActions() {
  const [editItem, setEditItem] = useState<InventoryRow | null>(null);
  const [priceItem, setPriceItem] = useState<InventoryRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryRow | null>(null);
  const hasEditPermission = useAdminAuthStore((s) => s.hasPermission('inventory.edit'));
  const hasDeletePermission = useAdminAuthStore((s) => s.hasPermission('inventory.delete'));

  const dialogs = (
    <>
      {editItem && <EditDialog item={editItem} onClose={() => setEditItem(null)} />}
      {priceItem && <ChangePriceDialog item={priceItem} onClose={() => setPriceItem(null)} />}
      {deleteItem && <DeleteDialog item={deleteItem} onClose={() => setDeleteItem(null)} />}
    </>
  );

  const buildActions = () => {
    if (!hasEditPermission) return [];
    const editable = (row: InventoryRow) => row.status !== 'sold' && row.status !== 'transferred';
    const actions = [
      {
        label: 'Edit',
        icon: <Pencil className="w-4 h-4" />,
        onClick: (row: InventoryRow) => setEditItem(row),
        visible: editable,
      },
      {
        label: 'Change Selling Price',
        icon: <IndianRupee className="w-4 h-4" />,
        onClick: (row: InventoryRow) => setPriceItem(row),
        visible: editable,
      },
    ];
    // Deletion is a separate, stronger permission — the server enforces
    // inventory.delete authoritatively; the UI gate just hides a button the
    // caller could not use anyway.
    if (hasDeletePermission) {
      actions.push({
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4 text-red-400" />,
        onClick: (row: InventoryRow) => setDeleteItem(row),
        visible: editable,
      });
    }
    return actions;
  };

  return { dialogs, buildActions };
}
