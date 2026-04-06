import { useState } from 'react';
import { Truck, Scale, Plane, FileWarning, Plus } from 'lucide-react';
import ActiveFleetTracker from '../components/ActiveFleetTracker';
import ActionCenter from '../components/ActionCenter';
import UpcomingDepartures from '../components/UpcomingDepartures';
import ShipmentBuilderModal from '../components/ShipmentBuilderModal';

const Dashboard = () => {
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg flex flex-col justify-between gap-4">
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Truck className="h-8 w-8 text-green-100" />
                                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Thierry</h1>
                            </div>
                            <p className="text-green-100 text-base md:text-lg opacity-90 max-w-2xl">
                                Monitor active collections, export shipments, and fleet status in real-time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorators */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl pointer-events-none"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Weekly Volume */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Volume</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18.5 <span className="text-lg text-gray-500">Tons</span></h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                        <Scale size={24} />
                    </div>
                </div>

                {/* Active Collections */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Collections</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4 Trucks</h3>
                        <p className="text-xs text-green-600 font-medium">En Route</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
                        <Truck size={24} />
                    </div>
                </div>

                {/* Export Shipments */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Export Shipments</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3 Departed</h3>
                        <p className="text-xs text-orange-600 font-medium">2 Pending</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                        <Plane size={24} />
                    </div>
                </div>

                {/* Pending Docs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Docs</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">5 Invoices</h3>
                        <p className="text-xs text-amber-600 font-medium">Action Required</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-600">
                        <FileWarning size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3) - Fleet Map */}
                <div className="lg:col-span-2">
                    <ActiveFleetTracker />
                </div>

                {/* Right Column (1/3) - Action Center */}
                <div>
                    <ActionCenter />
                </div>

                {/* Bottom Row - Full Width */}
                <div className="lg:col-span-3">
                    <UpcomingDepartures />
                </div>
            </div>

            {/* Modals */}
            <ShipmentBuilderModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
