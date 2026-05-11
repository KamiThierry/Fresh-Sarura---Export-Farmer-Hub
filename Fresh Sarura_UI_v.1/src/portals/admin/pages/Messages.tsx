import { useState, useEffect } from 'react';
import { Mail, MailOpen, Reply, RefreshCw, Send, X, Clock, Tag, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    type: string;
    message: string;
    status: 'Unread' | 'Read' | 'Replied';
    repliedAt?: string;
    replyNote?: string;
    createdAt: string;
}

const statusStyles = {
    Unread:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Read:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    Replied: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const typeStyles: Record<string, string> = {
    'Export Sourcing':       'bg-blue-50 text-blue-700',
    'Outgrower Partnership': 'bg-purple-50 text-purple-700',
    'Platform Support':      'bg-amber-50 text-amber-700',
    'Export Compliance':     'bg-orange-50 text-orange-700',
    'General Inquiry':       'bg-gray-50 text-gray-600',
};

const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const Messages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Unread' | 'Read' | 'Replied'>('All');
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contact');
            setMessages(res.data || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleSelect = async (msg: ContactMessage) => {
        setSelected(msg);
        setReplyText('');
        if (msg.status === 'Unread') {
            try {
                await api.patch(`/contact/${msg._id}/read`, {});
                setMessages(prev =>
                    prev.map(m => m._id === msg._id ? { ...m, status: 'Read' } : m)
                );
            } catch {}
        }
    };

    const handleReply = async () => {
        if (!selected || !replyText.trim()) return;
        setSending(true);
        try {
            await api.post(`/contact/${selected._id}/reply`, { replyNote: replyText });
            setMessages(prev =>
                prev.map(m => m._id === selected._id
                    ? { ...m, status: 'Replied', replyNote: replyText, repliedAt: new Date().toISOString() }
                    : m
                )
            );
            setSelected(prev => prev ? { ...prev, status: 'Replied', replyNote: replyText } : null);
            setReplyText('');
            showToast('Reply sent successfully.');
        } catch (err) {
            showToast('Failed to send reply. Check your email configuration.');
        } finally {
            setSending(false);
        }
    };

    const unreadCount = messages.filter(m => m.status === 'Unread').length;
    const filtered = messages.filter(m => filterStatus === 'All' || m.status === filterStatus);

    return (
        <div className="p-6 space-y-6">

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Messages
                        {unreadCount > 0 && (
                            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Inquiries received from the FreshSarura landing page.
                    </p>
                </div>
                <button
                    onClick={fetchMessages}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['All', 'Unread', 'Read', 'Replied'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            filterStatus === s
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                        {s}
                        {s === 'Unread' && unreadCount > 0 && (
                            <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: '60vh' }}>

                {/* Left: message list */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Loading messages...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                            <Mail size={36} className="mb-3 opacity-30" />
                            <p className="text-sm">No messages here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto flex-1">
                            {filtered.map(msg => (
                                <button
                                    key={msg._id}
                                    onClick={() => handleSelect(msg)}
                                    className={`w-full text-left px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                                        selected?._id === msg._id ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            {msg.status === 'Unread'
                                                ? <Mail size={14} className="text-red-500 shrink-0" />
                                                : <MailOpen size={14} className="text-gray-400 shrink-0" />
                                            }
                                            <span className={`text-sm font-bold text-gray-900 dark:text-white ${msg.status === 'Unread' ? '' : 'font-medium'}`}>
                                                {msg.name}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-2">{msg.email}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeStyles[msg.type] || 'bg-gray-50 text-gray-500'}`}>
                                            {msg.type}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[msg.status]}`}>
                                            {msg.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: message detail + reply */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    {!selected ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
                            <MailOpen size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Select a message to read</p>
                        </div>
                    ) : (
                        <>
                            {/* Message header */}
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[selected.status]}`}>
                                            {selected.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Mail size={12} /> {selected.email}</span>
                                        <span className="flex items-center gap-1"><Tag size={12} /> {selected.type}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(selected.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Message body */}
                            <div className="px-6 py-5 flex-1 overflow-y-auto space-y-5">
                                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                        {selected.message}
                                    </p>
                                </div>

                                {/* Previous reply */}
                                {selected.status === 'Replied' && selected.replyNote && (
                                    <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Reply size={12} /> Your Reply · {selected.repliedAt ? new Date(selected.repliedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                            {selected.replyNote}
                                        </p>
                                    </div>
                                )}

                                {/* Reply box */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Reply size={12} />
                                        {selected.status === 'Replied' ? 'Send Another Reply' : 'Reply'}
                                        <span className="normal-case font-normal text-gray-400 ml-1">— will be sent to {selected.email}</span>
                                    </p>
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        rows={5}
                                        placeholder="Type your reply here..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30 flex justify-end">
                                <button
                                    onClick={handleReply}
                                    disabled={sending || !replyText.trim()}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                                        sending || !replyText.trim()
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white active:scale-95 shadow-green-900/20'
                                    }`}
                                >
                                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                    {sending ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
