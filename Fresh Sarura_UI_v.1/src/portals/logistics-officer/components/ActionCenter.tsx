import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, FileWarning, ArrowRight, Truck, Upload, Eye } from 'lucide-react';
import NotificationsModal from './NotificationsModal';

const ActionCenter = () => {
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const ALERTS = [
        {
            id: 1,
            title: 'Missing Comm. Invoice',
            context: 'Shipment #SH-205 (Dubai)',
            priority: 'High',
            icon: FileWarning,
            color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
            action: 'Upload Doc',
            actionIcon: Upload,
            btnColor: 'bg-red-600 hover:bg-red-700 text-white',
            navTarget: null,
        },
        {
            id: 2,
            title: 'Pickup Delayed',
            context: 'Trip #101 is 30m behind schedule.',
            priority: 'Medium',
            icon: Clock,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
            action: 'View Trip',
            actionIcon: Eye,
            btnColor: 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
            navTarget: '/logistics/collections?focus=trip-101',
        },
        {
            id: 3,
            title: 'New Harvest Ready',
            context: 'Kayonza Farm (1.2 Tons)',
            priority: 'Info',
            icon: Truck,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
            action: 'Assign Truck',
            actionIcon: ArrowRight,
            btnColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            navTarget: '/logistics/collections?action=assign&farm=kayonza',
        },
    ];

    const handleAlertAction = (navTarget: string | null) => {
        if (navTarget) navigate(navTarget);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" />
                        Action Required
                    </h3>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        3 Pending
                    </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {ALERTS.map((alert) => {
                        const Icon = alert.icon;
                        const ActionIcon = alert.actionIcon;
                        return (
                            <div key={alert.id} className="group">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${alert.color}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{alert.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{alert.context}</p>

                                        <button
                                            onClick={() => handleAlertAction(alert.navTarget)}
                                            className={`mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${alert.btnColor}`}
                                        >
                                            <ActionIcon size={14} />
                                            {alert.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="w-full text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    >
                        View All Notifications
                    </button>
                </div>
            </div>

            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </>
    );
};

export default ActionCenter;
