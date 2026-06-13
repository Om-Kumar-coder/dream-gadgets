'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, X, Phone, CheckCircle, XCircle, MoreHorizontal, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['pending', 'contacted', 'completed', 'rejected'];

type BuybackLead = {
  id: string;
  brand: string;
  modelName: string;
  phone: string;
  deviceType: string;
  status: string;
  screenCondition: string | null;
  bodyCondition: string | null;
  batteryHealth: string | null;
  functionalIssues: string | null;
  photos?: Array<{ id: string; url: string }>;
  notes: string | null;
  createdAt: string;
};

function LeadDetailModal({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const { data: leadData, isLoading } = useQuery({
    queryKey: ['buyback-lead', leadId],
    queryFn: () => apiClient.get(`/buyback/leads/${leadId}`).then((r) => r.data?.data ?? r.data),
  });
  const lead: BuybackLead | null = leadData ?? null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-8 text-center">
          <p className="text-sm text-gray-500">Lead not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">Lead Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Brand</p>
              <p className="font-medium">{lead.brand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Model</p>
              <p className="font-medium">{lead.modelName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <p className="font-mono text-sm">{lead.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Device Type</p>
              <p className="capitalize">{lead.deviceType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${
                  STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {lead.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Submitted</p>
              <p className="text-sm text-gray-600">
                {lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy, h:mm a') : '—'}
              </p>
            </div>
          </div>

          {lead.screenCondition || lead.bodyCondition || lead.batteryHealth ? (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Assessment
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Screen</p>
                  <p className="text-sm font-medium">{lead.screenCondition || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Body</p>
                  <p className="text-sm font-medium">{lead.bodyCondition || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Battery</p>
                  <p className="text-sm font-medium">{lead.batteryHealth || '—'}</p>
                </div>
              </div>
            </div>
          ) : null}

          {lead.functionalIssues ? (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Functional Issues
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lead.functionalIssues.split(',').map((issue, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-700 font-medium"
                  >
                    {issue.trim()}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {lead.photos && lead.photos.length > 0 ? (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Device Photos ({lead.photos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {lead.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt="Device photo"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {lead.notes || 'No notes'}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusUpdateMenu({
  lead,
  onUpdate,
  onClose,
}: {
  lead: BuybackLead;
  onUpdate: (status: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
        <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Set Status
        </p>
        {STATUS_OPTIONS.filter((s) => s !== lead.status).map((status) => (
          <button
            key={status}
            onClick={() => {
              onUpdate(status);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left capitalize"
          >
            {status === 'contacted' && <Phone className="w-3.5 h-3.5 text-blue-500" />}
            {status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
            {status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
            {status === 'pending' && <MessageSquare className="w-3.5 h-3.5 text-yellow-500" />}
            {status}
          </button>
        ))}
      </div>
    </>
  );
}

export default function BuybackLeadsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/buyback/leads/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buyback-leads'] });
      toast.success('Lead status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const columns: ColumnDef<BuybackLead, any>[] = [
    {
      accessorKey: 'device',
      header: 'Device',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.brand} <span className="font-normal">{row.original.modelName}</span>
          </p>
          <p className="text-xs text-gray-400 capitalize">{row.original.deviceType}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phone}`}
          className="font-mono text-xs text-blue-600 hover:underline"
        >
          {row.original.phone}
        </a>
      ),
    },
    {
      accessorKey: 'assessment',
      header: 'Condition',
      cell: ({ row }) => {
        const { screenCondition, bodyCondition, batteryHealth } = row.original;
        if (!screenCondition && !bodyCondition && !batteryHealth) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {screenCondition && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium whitespace-nowrap" title="Screen">
                {screenCondition}
              </span>
            )}
            {bodyCondition && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium whitespace-nowrap" title="Body">
                {bodyCondition}
              </span>
            )}
            {batteryHealth && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium whitespace-nowrap" title="Battery">
                {batteryHealth}
              </span>
            )}
          </div>
        );
      },
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
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const [showMenu, setShowMenu] = useState(false);
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedLeadId(row.original.id)}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title="Update status"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {showMenu && (
                <StatusUpdateMenu
                  lead={row.original}
                  onUpdate={(status) => updateStatus.mutate({ id: row.original.id, status })}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Buyback Leads</h1>
          <p className="text-sm text-gray-500">
            Customer sell/buyback requests submitted from the website
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['', ...STATUS_OPTIONS].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      <DataTable<BuybackLead, any>
        columns={columns}
        queryKey={['buyback-leads', statusFilter]}
        apiEndpoint="/buyback/leads"
        enableSorting={true}
        enableFilters={false}
        enablePagination={true}
        pageSize={20}
        renderNoResults={() => (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500">No buyback leads found</p>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Clear status filter
              </button>
            )}
          </div>
        )}
      />

      {/* Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
}
