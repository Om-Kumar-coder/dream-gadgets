'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { Modal } from '@dream-gadgets/ui';
import { Button } from '@dream-gadgets/ui';
import { Form, FormField, FormActions } from '@dream-gadgets/ui';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  initiated: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-yellow-100 text-yellow-700',
  received: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

type Transfer = {
  id: string;
  transferNumber: string;
  fromBranch: {
    name: string;
  };
  toBranch: {
    name: string;
  };
  items: { id: string; itemId: string; imei: string; status: string }[];
  status: string;
  notes: string | null;
  initiatedAt: string;
  createdAt: string;
};

export default function TransfersPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const columns: ColumnDef<Transfer, any>[] = [
    {
      accessorKey: 'transferNumber',
      header: 'Transfer #',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.transferNumber}</span>,
    },
    {
      accessorKey: 'fromBranch',
      header: 'From',
      cell: ({ row }) => <span className="text-sm">{row.original.fromBranch?.name}</span>,
    },
    {
      accessorKey: 'toBranch',
      header: 'To',
      cell: ({ row }) => <span className="text-sm">{row.original.toBranch?.name}</span>,
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => <span>{row.original.items?.length ?? 0}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'initiatedAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {row.original.initiatedAt ? format(new Date(row.original.initiatedAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <TransferActions transfer={row.original} />,
    },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/transfers', data);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      setShowCreate(false);
      toast.success('Transfer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async ({ id, itemIds }: { id: string; itemIds: string[] }) => {
      const { data } = await apiClient.patch(`/transfers/${id}/receive`, { confirmedItemIds: itemIds });
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Transfer received');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to receive transfer');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/transfers/${id}/reject`, { rejectionReason: reason });
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Transfer rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject transfer');
    },
  });

  const TransferActions = ({ transfer }: { transfer: Transfer }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <button
                onClick={() => {
                  setSelectedTransfer(transfer);
                  setShowView(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>
              {transfer.status === 'initiated' && (
                <button
                  onClick={() => {
                    receiveMutation.mutate({ id: transfer.id, itemIds: transfer.items.map(i => i.itemId) });
                    setShowMenu(false);
                  }}
                  disabled={receiveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Receive All
                </button>
              )}
              {transfer.status === 'initiated' && (
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) {
                      rejectMutation.mutate({ id: transfer.id, reason });
                      setShowMenu(false);
                    }
                  }}
                  disabled={rejectMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              <a
                href={`/api/v1/transfers/${transfer.id}/manifest`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <FileText className="w-3.5 h-3.5" /> Manifest PDF
              </a>
            </div>
          </>
        )}
      </div>
    );
  };

  const CreateTransferForm = () => {
    const [fromBranchId, setFromBranchId] = useState('');
    const [toBranchId, setToBranchId] = useState('');
    const [itemIds, setItemIds] = useState('');
    const [notes, setNotes] = useState('');

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate({
            fromBranchId,
            toBranchId,
            itemIds: itemIds.split(',').map(s => s.trim()).filter(Boolean),
            notes: notes || undefined,
          });
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="From Branch" required>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select source branch</option>
                <option value="branch1">Branch 1</option>
                <option value="branch2">Branch 2</option>
              </select>
            </FormField>
            <FormField label="To Branch" required>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select destination branch</option>
                <option value="branch1">Branch 1</option>
                <option value="branch2">Branch 2</option>
              </select>
            </FormField>
          </div>
          <FormField label="Item IDs (comma-separated)" required>
            <input
              type="text"
              value={itemIds}
              onChange={(e) => setItemIds(e.target.value)}
              placeholder="uuid1, uuid2, ..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          <FormField label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>
        </div>
        <FormActions onCancel={() => setShowCreate(false)} submitText="Create Transfer" submitDisabled={createMutation.isPending} />
      </Form>
    );
  };

  const TransferDetails = () => {
    if (!selectedTransfer) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Transfer #</p>
            <p className="font-mono text-sm">{selectedTransfer.transferNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                STATUS_COLORS[selectedTransfer.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {selectedTransfer.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">From</p>
            <p className="text-sm">{selectedTransfer.fromBranch?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">To</p>
            <p className="text-sm">{selectedTransfer.toBranch?.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Items ({selectedTransfer.items?.length})</p>
            <div className="mt-1 space-y-1">
              {selectedTransfer.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs">{item.imei}</span>
                  <span className="text-gray-500 text-xs">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
          {selectedTransfer.notes && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Notes</p>
              <p className="text-sm">{selectedTransfer.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Stock Transfers</h1>
          <p className="text-sm text-gray-500">Move inventory between branches</p>
        </div>
        <Button variant="default" size="md">
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <DataTable<Transfer, any>
        columns={columns}
        queryKey={['transfers']}
        apiEndpoint="/transfers"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Transfer"
        size="lg"
      >
        <CreateTransferForm />
      </Modal>

      <Modal
        isOpen={showView}
        onClose={() => setShowView(false)}
        title="Transfer Details"
        size="lg"
      >
        <TransferDetails />
      </Modal>
    </div>
  );
}
