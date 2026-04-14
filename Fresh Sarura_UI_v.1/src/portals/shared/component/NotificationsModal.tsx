import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, FileWarning, Clock, Truck, Eye, Upload, ArrowRight, Bell, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface Notification {
    _id: string;
    type: 'BUDGET_REQUEST' | 'BUDGET_APPROVED' | 'BUDGET_REJECTED' | 'REPORT_FLAGGED' | 'FORECAST_VERIFIED';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const typeConfig = {
    BUDGET_REQUEST: {
        icon: Bell,
        iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        action: 'View Request',
        actionIcon: Eye,
        btnColor: 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    BUDGET_APPROVED: {
        icon: CheckCircle2,
        iconColor: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        action: 'View Budget',
        actionIcon: ArrowRight,
        btnColor: 'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    BUDGET_REJECTED: {
        icon: AlertCircle,
        iconColor: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        action: 'View Note',
        actionIcon: Eye,
        btnColor: 'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    REPORT_FLAGGED: {
        icon: FileWarning,
        iconColor: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        action: 'Fix Report',
        actionIcon: ArrowRight,
        btnColor: 'bg-red-600 hover:bg-red-700 text-white',
    },
    FORECAST_VERIFIED: {
        icon: TrendingUp,
        iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        action: 'View Forecast',
        actionIcon: Eye,
        btnColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
};

const NotificationsModal = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }: NotificationsModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAction = (id: string, navTarget?: string) => {
        onMarkAsRead(id);
        if (navTarget) navigate(navTarget);
        onClose();
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/50 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Bell size={18} className="text-green-600 dark:text-green-400" />
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h2>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/40 dark:bg-gray-900/30">
                    {notifications.length === 0 ? (
                        <div className="py-20 text-center">
                            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm font-medium text-gray-500">All caught up!</p>
                            <p className="text-xs text-gray-400">No new notifications.</p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const config = typeConfig[n.type] || typeConfig.BUDGET_REQUEST;
                            const Icon = config.icon;
                            const ActionIcon = config.actionIcon;
                            return (
                                <div
                                    key={n._id}
                                    className={`p-4 rounded-xl border transition-all shadow-sm ${n.isRead ? 'bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700' : 'bg-white dark:bg-gray-700 border-green-100 dark:border-green-900/30 font-bold shadow-md'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2.5 rounded-xl shrink-0 ${config.iconColor}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm text-gray-900 dark:text-white ${n.isRead ? 'font-medium' : 'font-bold'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-green-600 shrink-0 mt-1" title="Unread" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                                                <button
                                                    onClick={() => handleAction(n._id, n.link)}
                                                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all ${config.btnColor}`}
                                                >
                                                    <ActionIcon size={12} />
                                                    {config.action}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/50">
                    <button
                        onClick={onMarkAllAsRead}
                        disabled={notifications.every(n => n.isRead)}
                        className="w-full text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-40"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NotificationsModal;
