import { createPortal } from 'react-dom';
import { X, Bell, AlertTriangle, UserPlus, ShieldAlert } from 'lucide-react';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NOTIFICATIONS = [
    {
        id: 1,
        icon: UserPlus,
        iconColor: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        title: 'New User Registration',
        context: 'Alice Kamana — awaiting role assignment',
        time: '2 min ago',
    },
    {
        id: 2,
        icon: ShieldAlert,
        iconColor: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        title: 'Permission Override Detected',
        context: 'Role "QC Officer" was edited by logistics@sarura.rw',
        time: '18 min ago',
    },
    {
        id: 3,
        icon: AlertTriangle,
        iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        title: 'System Alert',
        context: 'Storage utilisation at 87% — review cold rooms',
        time: '1 hr ago',
    },
];

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/50 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Bell size={18} className="text-green-600 dark:text-green-400" />
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {NOTIFICATIONS.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/40 dark:bg-gray-900/30">
                    {NOTIFICATIONS.map(n => {
                        const Icon = n.icon;
                        return (
                            <div key={n.id} className="p-4 rounded-xl bg-white dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600/50 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2.5 rounded-xl shrink-0 ${n.iconColor}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.context}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="w-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
