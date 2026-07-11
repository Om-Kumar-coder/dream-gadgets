'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { Modal } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  templateId: string | null;
  status: string;
  body: string;
  headerValue: string | null;
  footer: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  approved: { label: 'Approved', class: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-200' },
  draft: { label: 'Draft', class: 'bg-surface-50 text-surface-600 border-surface-200' },
};

const CATEGORIES = ['transactional', 'marketing', 'otp', 'authentication', 'utility'];

export default function WhatsAppTemplatesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('transactional');
  const [formLanguage, setFormLanguage] = useState('en');
  const [formBody, setFormBody] = useState('');
  const [formHeader, setFormHeader] = useState('');
  const [formFooter, setFormFooter] = useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates', search, categoryFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await apiClient.get('/whatsapp/templates', { params });
      // TransformInterceptor wraps: { status, data: { data: [], ... } }
      const raw = data?.data ?? data ?? {};
      return Array.isArray(raw) ? raw : (raw.data ?? []) as Template[];
    },
  });

  const templateList: Template[] = templates ?? [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/whatsapp/templates', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      setShowCreate(false);
      resetForm();
      toast.success('Template created');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      await apiClient.patch(`/whatsapp/templates/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      setEditingTemplate(null);
      resetForm();
      toast.success('Template updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update template');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/whatsapp/templates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('Template deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormCategory('transactional');
    setFormLanguage('en');
    setFormBody('');
    setFormHeader('');
    setFormFooter('');
  };

  const openEdit = (t: Template) => {
    setEditingTemplate(t);
    setFormName(t.name);
    setFormCategory(t.category);
    setFormLanguage(t.language);
    setFormBody(t.body);
    setFormHeader(t.headerValue ?? '');
    setFormFooter(t.footer ?? '');
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      category: formCategory,
      language: formLanguage,
      body: formBody,
      headerValue: formHeader || undefined,
      footer: formFooter || undefined,
    };
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-surface-500">{templateList.length} template{templateList.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="default" size="md" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-surface-300 animate-spin" />
        </div>
      ) : templateList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-surface-400">
          <FileText className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium">No templates yet</p>
          <p className="text-xs mb-4">Create your first WhatsApp message template</p>
          <Button variant="default" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templateList.map((tpl) => {
            const statusInfo = STATUS_BADGES[tpl.status] ?? STATUS_BADGES.draft;
            return (
              <div
                key={tpl.id}
                className="bg-white border border-surface-100 rounded-2xl p-5 hover:shadow-elevation-2 hover:border-surface-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-surface-900 truncate">{tpl.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-surface-400">
                      <span className="px-1.5 py-0.5 bg-surface-50 rounded font-medium capitalize">{tpl.category}</span>
                      <span>{tpl.language.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-50 rounded-xl p-3 mb-3 max-h-24 overflow-y-auto">
                  <p className="text-xs text-surface-600 whitespace-pre-wrap line-clamp-4">
                    {tpl.body || 'No body content'}
                  </p>
                </div>

                {tpl.footer && (
                  <p className="text-[10px] text-surface-400 mb-3 truncate">{tpl.footer}</p>
                )}

                {tpl.rejectionReason && (
                  <div className="flex items-start gap-1.5 mb-3 text-[10px] text-red-600 bg-red-50 rounded-lg px-2 py-1.5">
                    <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{tpl.rejectionReason}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <span className="text-[10px] text-surface-400">
                    Updated {new Date(tpl.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingTemplate(tpl)}
                      className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(tpl)}
                      className="p-1.5 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete template "${tpl.name}"?`)) {
                          deleteMutation.mutate(tpl.id);
                        }
                      }}
                      className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create/Edit Modal ─── */}
      <Modal
        isOpen={showCreate || !!editingTemplate}
        onClose={() => { setShowCreate(false); setEditingTemplate(null); resetForm(); }}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Template Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                placeholder="order_confirmation"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Header (optional)</label>
            <input
              type="text"
              value={formHeader}
              onChange={(e) => setFormHeader(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              placeholder="Your order has been confirmed!"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Body *</label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
              rows={5}
              placeholder="Dear {{name}}, your order {{orderNumber}} has been confirmed!"
              required
            />
            <p className="text-[10px] text-surface-400 mt-1">
              Use {'{{variable}}'} for dynamic values
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Footer (optional)</label>
            <input
              type="text"
              value={formFooter}
              onChange={(e) => setFormFooter(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              placeholder="— Dream Gadgets Team"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
            <button
              type="button"
              onClick={() => { setShowCreate(false); setEditingTemplate(null); resetForm(); }}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!formName.trim() || !formBody.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── View Modal ─── */}
      <Modal
        isOpen={!!viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        title={viewingTemplate?.name ?? ''}
        size="lg"
      >
        {viewingTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-surface-400">Category</p>
                <p className="text-sm font-medium capitalize">{viewingTemplate.category}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400">Language</p>
                <p className="text-sm font-medium">{viewingTemplate.language.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400">Status</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                  STATUS_BADGES[viewingTemplate.status]?.class ?? ''
                }`}>
                  {viewingTemplate.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-surface-400">Template ID</p>
                <p className="text-sm font-mono">{viewingTemplate.templateId || 'Not submitted'}</p>
              </div>
            </div>
            {viewingTemplate.headerValue && (
              <div>
                <p className="text-xs text-surface-400 mb-1">Header</p>
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-sm font-medium">{viewingTemplate.headerValue}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-surface-400 mb-1">Body</p>
              <div className="bg-surface-50 rounded-xl p-3 max-h-48 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{viewingTemplate.body}</p>
              </div>
            </div>
            {viewingTemplate.footer && (
              <div>
                <p className="text-xs text-surface-400 mb-1">Footer</p>
                <p className="text-sm text-surface-500">{viewingTemplate.footer}</p>
              </div>
            )}
            {viewingTemplate.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{viewingTemplate.rejectionReason}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-surface-100 text-[10px] text-surface-400">
              <span>Created: {new Date(viewingTemplate.createdAt).toLocaleString('en-IN')}</span>
              <span>Updated: {new Date(viewingTemplate.updatedAt).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
