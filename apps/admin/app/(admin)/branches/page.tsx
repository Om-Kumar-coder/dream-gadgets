'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowRight, Store, Loader2, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  workingHours?: string;
  isActive?: boolean;
}

export default function BranchesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/branches');
      return (data?.data ?? []) as Branch[];
    },
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Stores &amp; Branches</h1>
          <p className="text-sm text-surface-500 mt-1">
            View each store&apos;s location details and its product inventory
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="card p-12 flex flex-col items-center gap-3 text-surface-400">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm">Loading stores...</span>
        </div>
      )}

      {isError && (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <Store className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-900">Failed to load stores</h3>
          <p className="text-surface-500 text-sm mt-1">Check your connection and try again</p>
          <button onClick={() => refetch()} className="btn-outline btn-sm mt-4">
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(data ?? []).map((branch) => (
            <div
              key={branch.id}
              className="card p-6 flex flex-col hover:shadow-elevation-3 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-surface-900 leading-tight">{branch.name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      {branch.code}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                    branch.isActive !== false
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-surface-100 text-surface-400'
                  }`}
                >
                  {branch.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-surface-500 flex-1 mb-5">
                {branch.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-surface-300" />
                    <span>
                      {branch.address}
                      {branch.city ? `, ${branch.city}` : ''}
                      {branch.pincode ? ` — ${branch.pincode}` : ''}
                    </span>
                  </p>
                )}
                {branch.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-surface-300" />
                    <span>+91 {branch.phone}</span>
                  </p>
                )}
                {branch.workingHours && (
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-surface-300" />
                    <span>{branch.workingHours}</span>
                  </p>
                )}
              </div>

              <Link
                href={`/branches/${branch.id}`}
                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
              >
                View Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {(data ?? []).length === 0 && (
            <div className="card p-12 text-center col-span-full">
              <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-surface-500 font-medium">No branches found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
