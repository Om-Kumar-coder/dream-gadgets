'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Plus,
  Search,
  Send,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Target,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { Modal } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  templateId: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  clickCount: number;
  conversionCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  clickRate: number;
  conversionRate: number;
}

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-surface-50 text-surface-600 border-surface-200' },
  scheduled: { label: 'Scheduled', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  sending: { label: 'Sending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  sent: { label: 'Sent', class: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', class: 'bg-red-50 text-red-700 border-red-200' },
};

const CAMPAIGN_TYPES = ['broadcast', 'segmented', 'triggered', 'ab_test'];

export default function WhatsAppCampaignsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('broadcast');
  const [formTemplateId, setFormTemplateId] = useState('');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['whatsapp-campaigns', search, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await apiClient.get('/whatsapp/campaigns', { params });
      // TransformInterceptor wraps: { status, data: { data: [], ... } }
      const raw = data?.data ?? data ?? {};
      return Array.isArray(raw) ? raw : (raw.data ?? []) as Campaign[];
    },
  });

  const { data: templatesData } = useQuery({
    queryKey: ['whatsapp-templates-select'],
    queryFn: async () => {
      const { data } = await apiClient.get('/whatsapp/templates', { params: { limit: '100' } });
      const raw = data?.data ?? data ?? {};
      return (Array.isArray(raw) ? raw : (raw.data ?? [])) as Array<{ id: string; name: string }>;
    },
  });

  const campaignList: Campaign[] = campaigns ?? [];
  const templates: Array<{ id: string; name: string }> = templatesData ?? [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/whatsapp/campaigns', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      setShowCreate(false);
      setFormName('');
      setFormDesc('');
      toast.success('Campaign created');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create campaign');
    },
  });

  // Launch mutation
  const launchMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/whatsapp/campaigns/${id}/launch`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      toast.success('Campaign launched!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to launch campaign');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/whatsapp/campaigns/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      toast.success('Campaign deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete campaign');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    createMutation.mutate({
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      type: formType,
      templateId: formTemplateId || undefined,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-surface-500">{campaignList.length} campaign{campaignList.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="default" size="md" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
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
            placeholder="Search campaigns…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-surface-300 animate-spin" />
        </div>
      ) : campaignList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-surface-400">
          <BarChart3 className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium">No campaigns yet</p>
          <p className="text-xs mb-4">Create your first WhatsApp marketing campaign</p>
          <Button variant="default" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaignList.map((camp) => {
            const statusInfo = STATUS_BADGES[camp.status] ?? STATUS_BADGES.draft;
            const isDraft = camp.status === 'draft';
            const deliveryRate = camp.totalRecipients > 0
              ? Math.round((camp.deliveredCount / camp.totalRecipients) * 100)
              : 0;
            const readRate = camp.deliveredCount > 0
              ? Math.round((camp.readCount / camp.deliveredCount) * 100)
              : 0;

            return (
              <div
                key={camp.id}
                className="bg-white border border-surface-100 rounded-2xl p-5 hover:shadow-elevation-2 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-surface-900 truncate">{camp.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px] text-surface-400 capitalize px-1.5 py-0.5 bg-surface-50 rounded">
                        {camp.type}
                      </span>
                    </div>
                    {camp.description && (
                      <p className="text-xs text-surface-400 truncate">{camp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isDraft && (
                      <button
                        onClick={() => launchMutation.mutate(camp.id)}
                        disabled={launchMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all active:scale-[0.97]"
                      >
                        <Play className="w-3 h-3" />
                        Launch
                      </button>
                    )}
                    <button
                      onClick={() => setViewingCampaign(camp)}
                      className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-lg transition-all"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isDraft && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete campaign "${camp.name}"?`)) {
                            deleteMutation.mutate(camp.id);
                          }
                        }}
                        className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Campaign Analytics Bar */}
                {!isDraft && camp.totalRecipients > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: 'Sent', value: camp.sentCount, total: camp.totalRecipients, color: 'bg-blue-500' },
                        { label: 'Delivered', value: camp.deliveredCount, total: camp.totalRecipients, color: 'bg-emerald-500' },
                        { label: 'Read', value: camp.readCount, total: camp.deliveredCount || 1, color: 'bg-violet-500' },
                        { label: 'Clicked', value: camp.clickCount, total: camp.sentCount || 1, color: 'bg-amber-500' },
                        { label: 'Converted', value: camp.conversionCount, total: camp.clickCount || 1, color: 'bg-rose-500' },
                      ].map((m) => {
                        const pct = Math.round((m.value / m.total) * 100);
                        return (
                          <div key={m.label} className="text-center">
                            <p className="text-lg font-extrabold text-surface-900">{pct}%</p>
                            <p className="text-[10px] text-surface-400">{m.label}</p>
                            <div className="mt-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.color} transition-all duration-500`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-surface-400 mt-0.5">
                              {m.value}/{m.total}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-surface-400 pt-2 border-t border-surface-100">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {camp.totalRecipients} recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {deliveryRate}% delivery rate
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {readRate}% read rate
                      </span>
                      {camp.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Scheduled: {new Date(camp.scheduledAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {isDraft && (
                  <div className="flex items-center gap-2 text-[10px] text-surface-400">
                    <Users className="w-3 h-3" />
                    Ready to launch
                    <span className="text-surface-200">·</span>
                    Created {new Date(camp.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Campaign Modal ─── */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Campaign"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Campaign Name *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              placeholder="Summer Sale 2026"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Description</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
              rows={2}
              placeholder="Promotional campaign for summer clearance"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              >
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Template</label>
              <select
                value={formTemplateId}
                onChange={(e) => setFormTemplateId(e.target.value)}
                className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              >
                <option value="">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!formName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── View Campaign Modal ─── */}
      <Modal
        isOpen={!!viewingCampaign}
        onClose={() => setViewingCampaign(null)}
        title={viewingCampaign?.name ?? 'Campaign Details'}
        size="lg"
      >
        {viewingCampaign && (
          <div className="space-y-5">
            {/* Status & Type */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-surface-400">Status</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                  STATUS_BADGES[viewingCampaign.status]?.class ?? ''
                }`}>
                  {viewingCampaign.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-surface-400">Type</p>
                <p className="text-sm font-medium capitalize">{viewingCampaign.type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400">Created</p>
                <p className="text-sm">{new Date(viewingCampaign.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {viewingCampaign.description && (
              <div>
                <p className="text-xs text-surface-400 mb-1">Description</p>
                <p className="text-sm">{viewingCampaign.description}</p>
              </div>
            )}

            {/* Full Analytics */}
            {viewingCampaign.totalRecipients > 0 && (
              <>
                <div>
                  <p className="text-xs font-semibold text-surface-500 mb-3 uppercase tracking-wider">Campaign Performance</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Recipients', value: viewingCampaign.totalRecipients, icon: Users, color: 'bg-surface-500' },
                      { label: 'Sent', value: viewingCampaign.sentCount, icon: Send, color: 'bg-blue-500' },
                      { label: 'Delivered', value: viewingCampaign.deliveredCount, icon: CheckCircle, color: 'bg-emerald-500' },
                      { label: 'Read', value: viewingCampaign.readCount, icon: Eye, color: 'bg-violet-500' },
                      { label: 'Clicked', value: viewingCampaign.clickCount, icon: TrendingUp, color: 'bg-amber-500' },
                      { label: 'Converted', value: viewingCampaign.conversionCount, icon: Target, color: 'bg-rose-500' },
                      { label: 'Failed', value: viewingCampaign.failedCount, icon: XCircle, color: 'bg-red-500' },
                      { label: 'Delivery Rate', value: `${Math.round((viewingCampaign.deliveredCount / viewingCampaign.totalRecipients) * 100)}%`, icon: BarChart3, color: 'bg-teal-500' },
                    ].map((s) => (
                      <div key={s.label} className="card p-3 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${s.color}`}>
                          <s.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-surface-900">{s.value}</p>
                          <p className="text-[10px] text-surface-400">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funnel visualization */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 mb-3 uppercase tracking-wider">Conversion Funnel</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Sent', value: viewingCampaign.sentCount, total: viewingCampaign.totalRecipients, color: 'bg-blue-500' },
                      { label: 'Delivered', value: viewingCampaign.deliveredCount, total: viewingCampaign.totalRecipients, color: 'bg-emerald-500' },
                      { label: 'Read', value: viewingCampaign.readCount, total: viewingCampaign.deliveredCount || 1, color: 'bg-violet-500' },
                      { label: 'Clicked', value: viewingCampaign.clickCount, total: viewingCampaign.sentCount || 1, color: 'bg-amber-500' },
                      { label: 'Converted', value: viewingCampaign.conversionCount, total: viewingCampaign.clickCount || 1, color: 'bg-rose-500' },
                    ].map((step) => {
                      const pct = step.total > 0 ? (step.value / step.total) * 100 : 0;
                      return (
                        <div key={step.label} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-surface-600 w-20 shrink-0">{step.label}</span>
                          <div className="flex-1 h-6 bg-surface-100 rounded-lg overflow-hidden">
                            <div
                              className={`h-full rounded-lg ${step.color} transition-all duration-500 flex items-center justify-end px-2`}
                              style={{ width: `${Math.min(pct, 100)}%`, minWidth: step.value > 0 ? '3rem' : '0' }}
                            >
                              <span className="text-[10px] font-bold text-white">
                                {Math.round(pct)}%
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-surface-900 w-16 text-right">
                            {step.value}/{step.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {viewingCampaign.totalRecipients === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-surface-400">
                <BarChart3 className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">No analytics yet</p>
                <p className="text-xs">Launch the campaign to see performance data</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-surface-100">
              {viewingCampaign.status === 'draft' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    launchMutation.mutate(viewingCampaign.id);
                    setViewingCampaign(null);
                  }}
                  disabled={launchMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Launch Campaign
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
