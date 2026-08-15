'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  role: {
    name: string;
  };
  isActive: boolean;
};

type Role = { id: string; name: string };
type Branch = { id: string; name: string; code: string };

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  roleId: '',
  branchId: '',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Reset the form whenever the modal opens
  useEffect(() => {
    if (showModal) setForm(EMPTY_FORM);
  }, [showModal]);

  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/roles');
      return ((data?.data ?? data ?? []) as Role[]).filter((r) => r.name !== 'employee');
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/branches');
      return (data?.data ?? data ?? []) as Branch[];
    },
  });

  const createUser = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post('/admin/users', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      setShowModal(false);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to create user'));
    },
  });

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.phone.trim() || !form.password) {
      toast.error('First name, phone and password are required');
      return;
    }
    if (!form.roleId) {
      toast.error('Please select a role');
      return;
    }
    createUser.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      password: form.password,
      roleId: form.roleId,
      branchId: form.branchId || undefined,
    });
  };

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.firstName} {row.original.lastName}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm">{row.original.email ?? '—'}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <span className="text-sm">{row.original.role?.name ?? '—'}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.isActive ? 'active' : 'inactive';
        return (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.isActive) {
          return (
            <button
              onClick={() => deactivateMutation.mutate(row.original.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Deactivate
            </button>
          );
        }
        return null;
      },
    },
  ];

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}`, { isActive: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const inputCls = 'input w-full text-sm';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Users & Employees</h1>
          <p className="text-sm text-surface-500">Manage admin users</p>
        </div>
        <Button variant="default" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <DataTable<User, any>
        columns={columns}
        queryKey={['admin-users']}
        apiEndpoint="/admin/users"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h3 className="text-base font-semibold text-surface-900">Add User</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className={inputCls}
                    placeholder="Rahul"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Last name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className={inputCls}
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={inputCls}
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                    placeholder="user@dreamgadgets.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputCls}
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select role...</option>
                    {(roles ?? []).map((r) => (
                      <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Branch</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">All branches</option>
                    {(branches ?? []).map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-surface-100 bg-surface-50/50">
              <Button variant="outline" size="md" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="md"
                onClick={handleSubmit}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
