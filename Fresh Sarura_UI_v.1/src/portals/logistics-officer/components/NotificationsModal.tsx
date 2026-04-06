import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, FileWarning, Clock, Truck, Eye, Upload, ArrowRight, Bell } from 'lucide-react';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NOTIFICATIONS = [
    {
        id: 1,
        title: 'Missing Comm. Invoice',
        context: 'Shipment #SH-205 (Dubai)',
        time: 'Just now',
        priority: 'high',
        icon: FileWarning,
        iconColor: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        action: 'Upload Doc',
        actionIcon: Upload,
        btnColor: 'bg-red-600 hover:bg-red-700 text-white',
        navTarget: null,
    },
    {
        id: 2,
        title: 'Pickup Delayed',
        context: 'Trip #101 is 30m behind schedule',
        time: '5 min ago',
        priority: 'medium',
        icon: Clock,
        iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        action: 'View Trip',
        actionIcon: Eye,
        btnColor: 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        navTarget: '/logistics/collections?focus=trip-101',
    },
    {
        id: 3,
        title: 'New Harvest Ready',
        context: 'Kayonza Farm (1.2 Tons)',
        time: '12 min ago',
        priority: 'info',
        icon: Truck,
        iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        action: 'Assign Truck',
        actionIcon: ArrowRight,
        btnColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        navTarget: '/logistics/collections?action=assign&farm=kayonza',
    },
];

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAction = (navTarget: string | null) => {
        onClose();
        if (navTarget) navigate(navTarget);
    };

    const unreadCount = NOTIFICATIONS.length;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                        <Bell size={18} className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
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
                    {NOTIFICATIONS.map((n) => {
                        const Icon = n.icon;
                        const ActionIcon = n.actionIcon;
                        return (
                            <div
                                key={n.id}
                                className="p-4 rounded-xl bg-white dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600/50 hover:border-gray-200 dark:hover:border-gray-500 transition-all shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2.5 rounded-xl shrink-0 ${n.iconColor}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.context}</p>
                                        <button
                                            onClick={() => handleAction(n.navTarget)}
                                            className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${n.btnColor}`}
                                        >
                                            <ActionIcon size={12} />
                                            {n.action}
                                        </button>
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
