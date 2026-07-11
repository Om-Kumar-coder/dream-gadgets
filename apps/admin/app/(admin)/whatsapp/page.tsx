'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCheck,
  Clock,
  User,
  Tag,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Conversation {
  id: string;
  customerPhone: string;
  customerName: string | null;
  type: string;
  status: string;
  assignedStaffId: string | null;
  priority: string;
  tags: Record<string, string> | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  content: string | null;
  contentType: string;
  status: string;
  createdAt: string;
}

const TYPE_BADGES: Record<string, string> = {
  sales: 'bg-blue-50 text-blue-700 border-blue-200',
  support: 'bg-purple-50 text-purple-700 border-purple-200',
  buyback: 'bg-amber-50 text-amber-700 border-amber-200',
  repair: 'bg-rose-50 text-rose-700 border-rose-200',
  appointment: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  general: 'bg-surface-50 text-surface-600 border-surface-200',
};

const PRIORITY_DOTS: Record<string, string> = {
  high: 'bg-red-500',
  normal: 'bg-blue-500',
  low: 'bg-surface-300',
};

export default function WhatsAppInboxPage() {
  const qc = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversations list
  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ['whatsapp-conversations', statusFilter, typeFilter, search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const { data } = await apiClient.get('/whatsapp/conversations', { params });
      // TransformInterceptor wraps: { status, data: { data: [], total, page, limit } }
      const raw = data?.data ?? data ?? {};
      return Array.isArray(raw) ? raw : (raw.data ?? []) as Conversation[];
    },
    refetchInterval: 10000,
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['whatsapp-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/whatsapp/stats');
      // TransformInterceptor wraps: { status, data: { activeConversations, unreadCount } }
      return (data?.data ?? data) as { activeConversations: number; unreadCount: number };
    },
    refetchInterval: 15000,
  });

  // Messages for selected conversation
  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['whatsapp-messages', selectedConvId],
    queryFn: async () => {
      if (!selectedConvId) return [];
      const { data } = await apiClient.get(`/whatsapp/conversations/${selectedConvId}/messages?limit=100`);
      // TransformInterceptor wraps: { status, data: { data: [...], total } }
      const raw = data?.data ?? data ?? {};
      const messages = Array.isArray(raw) ? raw : (raw.data ?? []);
      return (messages as Message[]).reverse();
    },
    enabled: !!selectedConvId,
    refetchInterval: 5000,
  });

  // Selected conversation details
  const selectedConv = (convData ?? []).find((c) => c.id === selectedConvId);

  // Send message
  const sendMutation = useMutation({
    mutationFn: async ({ to, content, conversationId }: { to: string; content: string; conversationId?: string }) => {
      const { data } = await apiClient.post('/whatsapp/send', { to, content, conversationId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-messages', selectedConvId] });
      qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      setMessageText('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  // Update conversation
  const updateConvMutation = useMutation({
    mutationFn: async ({ id, ...dto }: any) => {
      const { data } = await apiClient.patch(`/whatsapp/conversations/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Conversation updated');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;
    sendMutation.mutate({
      to: selectedConv.customerPhone,
      content: messageText.trim(),
      conversationId: selectedConv.id,
    });
  };

  const handleSelectConv = (id: string) => {
    setSelectedConvId(id);
    setShowMobileList(false);
    // Conversations will re-fetch and reset unread count in 10s via refetchInterval
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversations: Conversation[] = convData ?? [];
  const activeConv = selectedConvId && selectedConv;
  const convMessages: Message[] = messages ?? [];

  return (
    <div className="flex h-[calc(100vh-13rem)] bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
      {/* ─── Conversation List ─── */}
      <div className={`w-full sm:w-80 md:w-96 border-r border-surface-100 flex flex-col ${showMobileList ? 'flex' : 'hidden sm:flex'}`}>
        {/* Search & Filters */}
        <div className="p-3 border-b border-surface-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {[
              { value: 'active', label: 'Active' },
              { value: 'resolved', label: 'Resolved' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface-50 text-surface-500 hover:bg-surface-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="flex gap-3 px-3 py-2 bg-surface-50 border-b border-surface-100 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {stats.activeConversations} active
            </span>
            {stats.unreadCount > 0 && (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {stats.unreadCount} unread
              </span>
            )}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-surface-300 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-surface-400">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">No conversations</p>
              <p className="text-xs">Waiting for incoming messages</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-50">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`w-full text-left p-3 hover:bg-surface-50 transition-colors ${
                    selectedConvId === conv.id ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-emerald-600">
                        {(conv.customerName?.[0] ?? conv.customerPhone[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-surface-900 truncate">
                          {conv.customerName || conv.customerPhone}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                          <span className="text-[10px] text-surface-400">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            PRIORITY_DOTS[conv.priority] ?? 'bg-surface-300'
                          }`}
                        />
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                            TYPE_BADGES[conv.type] ?? TYPE_BADGES.general
                          }`}
                        >
                          {conv.type}
                        </span>
                      </div>
                      <p className="text-xs text-surface-400 truncate mt-0.5">
                        {conv.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Chat Window ─── */}
      <div className={`flex-1 flex flex-col ${!showMobileList ? 'flex' : 'hidden sm:flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-surface-400">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-surface-600 mb-1">WhatsApp Inbox</h3>
            <p className="text-sm max-w-xs text-center">
              Select a conversation from the left to view and reply to messages.
            </p>
            <div className="flex gap-4 mt-6 text-xs text-surface-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Active
              </span>
              <span className="flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Real-time
              </span>
              <span className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> Reply
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 bg-white shrink-0">
              <button
                onClick={() => { setShowMobileList(true); setSelectedConvId(null); }}
                className="sm:hidden p-1 -ml-1 text-surface-500 hover:text-surface-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-emerald-600">
                  {(selectedConv.customerName?.[0] ?? selectedConv.customerPhone[0]).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 truncate">
                  {selectedConv.customerName || selectedConv.customerPhone}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-surface-400">
                  <Phone className="w-3 h-3" />
                  {selectedConv.customerPhone}
                  {selectedConv.customerName && (
                    <>
                      <span className="text-surface-200">·</span>
                      <span className={`px-1.5 py-0.5 rounded-full border font-medium ${
                        TYPE_BADGES[selectedConv.type] ?? TYPE_BADGES.general
                      }`}>
                        {selectedConv.type}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConv.priority === 'high' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    High
                  </span>
                )}
                <button
                  onClick={() => {
                    const newStatus = selectedConv.status === 'active' ? 'resolved' : 'active';
                    updateConvMutation.mutate({ id: selectedConv.id, status: newStatus });
                  }}
                  className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors ${
                    selectedConv.status === 'active'
                      ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      : 'text-surface-400 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {selectedConv.status === 'active' ? 'Resolve' : 'Reopen'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/30">
              {msgsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-surface-300 animate-spin" />
                </div>
              ) : convMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation by sending a message below</p>
                </div>
              ) : (
                convMessages.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const date = new Date(msg.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isInbound
                            ? 'bg-white border border-surface-100 rounded-tl-sm shadow-sm'
                            : 'bg-emerald-500 text-white rounded-tr-sm shadow-sm'
                        }`}
                      >
                        {msg.contentType !== 'text' && msg.contentType !== 'text' && (
                          <p className={`text-xs font-medium mb-1 ${isInbound ? 'text-surface-400' : 'text-emerald-100'}`}>
                            [{msg.contentType}]
                          </p>
                        )}
                        {msg.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          isInbound ? 'text-surface-300' : 'text-emerald-200'
                        }`}>
                          <span className="text-[10px]">{date} {time}</span>
                          {!isInbound && (
                            msg.status === 'sent' ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-surface-100 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  disabled={sendMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
