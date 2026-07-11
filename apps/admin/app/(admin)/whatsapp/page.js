'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Send, Phone, AlertCircle, Loader2, CheckCheck, Clock, ArrowLeft, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
const TYPE_BADGES = {
    sales: 'bg-blue-50 text-blue-700 border-blue-200',
    support: 'bg-purple-50 text-purple-700 border-purple-200',
    buyback: 'bg-amber-50 text-amber-700 border-amber-200',
    repair: 'bg-rose-50 text-rose-700 border-rose-200',
    appointment: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivery: 'bg-orange-50 text-orange-700 border-orange-200',
    general: 'bg-surface-50 text-surface-600 border-surface-200',
};
const PRIORITY_DOTS = {
    high: 'bg-red-500',
    normal: 'bg-blue-500',
    low: 'bg-surface-300',
};
export default function WhatsAppInboxPage() {
    const qc = useQueryClient();
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [typeFilter, setTypeFilter] = useState('');
    const [messageText, setMessageText] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const messagesEndRef = useRef(null);
    // Conversations list
    const { data: convData, isLoading: convsLoading } = useQuery({
        queryKey: ['whatsapp-conversations', statusFilter, typeFilter, search],
        queryFn: async () => {
            const params = { limit: '50' };
            if (statusFilter)
                params.status = statusFilter;
            if (typeFilter)
                params.type = typeFilter;
            if (search)
                params.search = search;
            const { data } = await apiClient.get('/whatsapp/conversations', { params });
            // TransformInterceptor wraps: { status, data: { data: [], total, page, limit } }
            const raw = data?.data ?? data ?? {};
            return Array.isArray(raw) ? raw : (raw.data ?? []);
        },
        refetchInterval: 10000,
    });
    // Stats
    const { data: stats } = useQuery({
        queryKey: ['whatsapp-stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/whatsapp/stats');
            // TransformInterceptor wraps: { status, data: { activeConversations, unreadCount } }
            return (data?.data ?? data);
        },
        refetchInterval: 15000,
    });
    // Messages for selected conversation
    const { data: messages, isLoading: msgsLoading } = useQuery({
        queryKey: ['whatsapp-messages', selectedConvId],
        queryFn: async () => {
            if (!selectedConvId)
                return [];
            const { data } = await apiClient.get(`/whatsapp/conversations/${selectedConvId}/messages?limit=100`);
            // TransformInterceptor wraps: { status, data: { data: [...], total } }
            const raw = data?.data ?? data ?? {};
            const messages = Array.isArray(raw) ? raw : (raw.data ?? []);
            return messages.reverse();
        },
        enabled: !!selectedConvId,
        refetchInterval: 5000,
    });
    // Selected conversation details
    const selectedConv = (convData ?? []).find((c) => c.id === selectedConvId);
    // Send message
    const sendMutation = useMutation({
        mutationFn: async ({ to, content, conversationId }) => {
            const { data } = await apiClient.post('/whatsapp/send', { to, content, conversationId });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-messages', selectedConvId] });
            qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
            setMessageText('');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to send message');
        },
    });
    // Update conversation
    const updateConvMutation = useMutation({
        mutationFn: async ({ id, ...dto }) => {
            const { data } = await apiClient.patch(`/whatsapp/conversations/${id}`, dto);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
            toast.success('Conversation updated');
        },
    });
    const handleSend = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConv)
            return;
        sendMutation.mutate({
            to: selectedConv.customerPhone,
            content: messageText.trim(),
            conversationId: selectedConv.id,
        });
    };
    const handleSelectConv = (id) => {
        setSelectedConvId(id);
        setShowMobileList(false);
        // Conversations will re-fetch and reset unread count in 10s via refetchInterval
    };
    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const conversations = convData ?? [];
    const activeConv = selectedConvId && selectedConv;
    const convMessages = messages ?? [];
    return (_jsxs("div", { className: "flex h-[calc(100vh-13rem)] bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden", children: [_jsxs("div", { className: `w-full sm:w-80 md:w-96 border-r border-surface-100 flex flex-col ${showMobileList ? 'flex' : 'hidden sm:flex'}`, children: [_jsxs("div", { className: "p-3 border-b border-surface-100 space-y-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search conversations\u2026", className: "w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" })] }), _jsx("div", { className: "flex gap-1.5", children: [
                                    { value: 'active', label: 'Active' },
                                    { value: 'resolved', label: 'Resolved' },
                                ].map((f) => (_jsx("button", { onClick: () => setStatusFilter(f.value), className: `px-3 py-1 text-xs rounded-full font-medium transition-all ${statusFilter === f.value
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-surface-50 text-surface-500 hover:bg-surface-100'}`, children: f.label }, f.value))) })] }), stats && (_jsxs("div", { className: "flex gap-3 px-3 py-2 bg-surface-50 border-b border-surface-100 text-xs text-surface-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full" }), stats.activeConversations, " active"] }), stats.unreadCount > 0 && (_jsxs("span", { className: "flex items-center gap-1 font-medium text-emerald-600", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" }), stats.unreadCount, " unread"] }))] })), _jsx("div", { className: "flex-1 overflow-y-auto", children: convsLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-5 h-5 text-surface-300 animate-spin" }) })) : conversations.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-surface-400", children: [_jsx(MessageSquare, { className: "w-8 h-8 mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "No conversations" }), _jsx("p", { className: "text-xs", children: "Waiting for incoming messages" })] })) : (_jsx("div", { className: "divide-y divide-surface-50", children: conversations.map((conv) => (_jsx("button", { onClick: () => handleSelectConv(conv.id), className: `w-full text-left p-3 hover:bg-surface-50 transition-colors ${selectedConvId === conv.id ? 'bg-emerald-50/50' : ''}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-sm font-bold text-emerald-600", children: (conv.customerName?.[0] ?? conv.customerPhone[0]).toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm font-semibold text-surface-900 truncate", children: conv.customerName || conv.customerPhone }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [conv.unreadCount > 0 && (_jsx("span", { className: "w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center", children: conv.unreadCount })), _jsx("span", { className: "text-[10px] text-surface-400", children: conv.lastMessageAt
                                                                        ? new Date(conv.lastMessageAt).toLocaleTimeString('en-IN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })
                                                                        : '' })] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsx("span", { className: `inline-block w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[conv.priority] ?? 'bg-surface-300'}` }), _jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${TYPE_BADGES[conv.type] ?? TYPE_BADGES.general}`, children: conv.type })] }), _jsx("p", { className: "text-xs text-surface-400 truncate mt-0.5", children: conv.lastMessagePreview || 'No messages yet' })] })] }) }, conv.id))) })) })] }), _jsx("div", { className: `flex-1 flex flex-col ${!showMobileList ? 'flex' : 'hidden sm:flex'}`, children: !activeConv ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-surface-400", children: [_jsx("div", { className: "w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4", children: _jsx(MessageSquare, { className: "w-10 h-10 text-emerald-300" }) }), _jsx("h3", { className: "text-lg font-semibold text-surface-600 mb-1", children: "WhatsApp Inbox" }), _jsx("p", { className: "text-sm max-w-xs text-center", children: "Select a conversation from the left to view and reply to messages." }), _jsxs("div", { className: "flex gap-4 mt-6 text-xs text-surface-400", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full" }), " Active"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(CheckCheck, { className: "w-3.5 h-3.5" }), " Real-time"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), " Reply"] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-surface-100 bg-white shrink-0", children: [_jsx("button", { onClick: () => { setShowMobileList(true); setSelectedConvId(null); }, className: "sm:hidden p-1 -ml-1 text-surface-500 hover:text-surface-700", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsx("div", { className: "w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-sm font-bold text-emerald-600", children: (selectedConv.customerName?.[0] ?? selectedConv.customerPhone[0]).toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-surface-900 truncate", children: selectedConv.customerName || selectedConv.customerPhone }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] text-surface-400", children: [_jsx(Phone, { className: "w-3 h-3" }), selectedConv.customerPhone, selectedConv.customerName && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-surface-200", children: "\u00B7" }), _jsx("span", { className: `px-1.5 py-0.5 rounded-full border font-medium ${TYPE_BADGES[selectedConv.type] ?? TYPE_BADGES.general}`, children: selectedConv.type })] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [selectedConv.priority === 'high' && (_jsxs("span", { className: "flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), "High"] })), _jsx("button", { onClick: () => {
                                                const newStatus = selectedConv.status === 'active' ? 'resolved' : 'active';
                                                updateConvMutation.mutate({ id: selectedConv.id, status: newStatus });
                                            }, className: `text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors ${selectedConv.status === 'active'
                                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                                : 'text-surface-400 border-surface-200 hover:bg-surface-50'}`, children: selectedConv.status === 'active' ? 'Resolve' : 'Reopen' })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/30", children: [msgsLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-5 h-5 text-surface-300 animate-spin" }) })) : convMessages.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-surface-400", children: [_jsx(MessageSquare, { className: "w-8 h-8 mb-2" }), _jsx("p", { className: "text-sm", children: "No messages yet" }), _jsx("p", { className: "text-xs", children: "Start the conversation by sending a message below" })] })) : (convMessages.map((msg) => {
                                    const isInbound = msg.direction === 'inbound';
                                    const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                    const date = new Date(msg.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                    });
                                    return (_jsx("div", { className: `flex ${isInbound ? 'justify-start' : 'justify-end'}`, children: _jsxs("div", { className: `max-w-[75%] rounded-2xl px-4 py-2.5 ${isInbound
                                                ? 'bg-white border border-surface-100 rounded-tl-sm shadow-sm'
                                                : 'bg-emerald-500 text-white rounded-tr-sm shadow-sm'}`, children: [msg.contentType !== 'text' && msg.contentType !== 'text' && (_jsxs("p", { className: `text-xs font-medium mb-1 ${isInbound ? 'text-surface-400' : 'text-emerald-100'}`, children: ["[", msg.contentType, "]"] })), msg.content && (_jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: msg.content })), _jsxs("div", { className: `flex items-center justify-end gap-1 mt-1 ${isInbound ? 'text-surface-300' : 'text-emerald-200'}`, children: [_jsxs("span", { className: "text-[10px]", children: [date, " ", time] }), !isInbound && (msg.status === 'sent' ? (_jsx(CheckCheck, { className: "w-3 h-3" })) : (_jsx(Clock, { className: "w-3 h-3" })))] })] }) }, msg.id));
                                })), _jsx("div", { ref: messagesEndRef })] }), _jsx("form", { onSubmit: handleSend, className: "p-3 border-t border-surface-100 bg-white shrink-0", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: messageText, onChange: (e) => setMessageText(e.target.value), placeholder: "Type a message\u2026", className: "flex-1 px-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", disabled: sendMutation.isPending }), _jsx("button", { type: "submit", disabled: !messageText.trim() || sendMutation.isPending, className: "px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-1.5", children: sendMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline text-sm font-medium", children: "Send" })] })) })] }) })] })) })] }));
}
//# sourceMappingURL=page.js.map