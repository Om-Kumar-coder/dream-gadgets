'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clients/${id}`);
      return data.data;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['client-history', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clients/${id}/history`);
      return data.data;
    },
  });

  const verifyEkyc = useMutation({
    mutationFn: () => apiClient.patch(`/clients/${id}/ekyc/verify`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', id] }),
  });    if (isLoading) {
    return <div className="text-surface-400 py-8 text-center">Loading…</div>;
  }

  const client = clientData;

  return (
    <div className="max-w-4xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="heading-sm text-surface-900">
            {client?.firstName} {client?.lastName}
          </h1>
          <p className="text-sm text-surface-500">{client?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <h2 className="font-medium text-surface-800">Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['First Name', client?.firstName],
              ['Last Name', client?.lastName],
              ['Phone', client?.phone],
              ['Alt Phone', client?.alternatePhone ?? '—'],
              ['Email', client?.email ?? '—'],
              ['Gender', client?.gender ?? '—'],
              ['Date of Birth', client?.dateOfBirth ? format(new Date(client.dateOfBirth), 'dd MMM yyyy') : '—'],
              ['Customer Type', client?.customerType ?? '—'],
              ['ID Proof', client?.idProofType ? `${client.idProofType}: ${client.idProofNumber}` : '—'],
              ['Branch', client?.branch?.name ?? '—'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-surface-500">{label}</p>
                <p className="font-medium text-surface-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          {client?.address && (
            <div>
              <p className="text-xs text-surface-500">Address</p>
              <p className="text-sm text-surface-800 mt-0.5">{client.address}</p>
            </div>
          )}
        </div>

        {/* EKYC */}
        <div className="card p-5 space-y-4">
          <h2 className="font-medium text-surface-800">EKYC Status</h2>
          <div className={`text-sm px-3 py-2 rounded-lg font-medium ${
            client?.ekycStatus === 'verified'
              ? 'badge-success'
              : client?.ekycStatus === 'pending'
                ? 'badge-warning'
                : 'badge-neutral'
          }`}>
            {client?.ekycStatus ?? 'Not submitted'}
          </div>

          {client?.ekycStatus === 'pending' && (
            <button
              onClick={() => verifyEkyc.mutate()}
              disabled={verifyEkyc.isPending}
              className="w-full btn-primary btn-md"
            >
              <CheckCircle className="w-4 h-4" />
              {verifyEkyc.isPending ? 'Verifying…' : 'Verify EKYC'}
            </button>
          )}

          {(!client?.ekycStatus || client?.ekycStatus === 'rejected') && (
            <label className="flex items-center gap-2 border-2 border-dashed border-surface-200 rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-4 h-4 text-surface-400" />
              <span className="text-xs text-surface-500">Upload ID documents</span>
              <input type="file" accept="image/*,.pdf" multiple className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card p-5 space-y-4">
        <h2 className="font-medium text-surface-800">Transaction History</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Sales', historyData?.sales?.length ?? 0],
            ['Purchases', historyData?.purchases?.length ?? 0],
            ['Exchanges', historyData?.exchanges?.length ?? 0],
            ['Returns', historyData?.returns?.length ?? 0],
          ].map(([label, count]) => (
            <div key={label as string} className="bg-surface-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-surface-900">{count}</p>
              <p className="text-xs text-surface-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {historyData?.sales?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-surface-700 mb-2">Recent Sales</h3>
            <div className="space-y-2">
              {historyData.sales.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-surface-100 last:border-0">
                  <span className="font-mono text-xs text-surface-500">{s.invoiceNumber}</span>
                  <span className="font-medium">₹{Number(s.totalAmount).toLocaleString()}</span>
                  <span className="text-xs text-surface-400">
                    {s.saleDate ? format(new Date(s.saleDate), 'dd MMM yyyy') : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
