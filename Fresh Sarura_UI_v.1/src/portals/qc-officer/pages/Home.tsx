import { useState } from 'react';
import { Truck, ClipboardList, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import LogRawIntakeModal from '../components/LogRawIntakeModal';
import RecordQCModal, { QCInspectionData } from '../components/RecordQCModal';

// --- KPI Card Data ---
const kpiCards = [
    {
        label: 'Pending Intake',
        value: '3 Trucks',
        sub: 'Awaiting receiving log',
        icon: Truck,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
        label: 'Pending QC',
        value: '5 Batches',
        sub: 'Queued for inspection',
        icon: ClipboardList,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        label: 'Passed Today',
        value: '2,400 kg',
        sub: 'Cleared for cold storage',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
        label: 'Rejection Rate',
        value: '4.2%',
        sub: 'Top defect: Bruising',
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
    },
];

// --- Priority Inspection Queue Data ---
type InspectionStatus = 'Awaiting QC';

interface PriorityInspection {
    id: string;
    crop: string;
    arrivalTime: string;
    status: InspectionStatus;
    supplier: string;
    grossWeight: number;
}

const priorityInspections: PriorityInspection[] = [
    { id: 'INT-001', crop: 'French Beans', arrivalTime: '08:30 AM', status: 'Awaiting QC', supplier: 'Kinvest Farm', grossWeight: 1200 },
    { id: 'INT-002', crop: 'Avocados (Hass)', arrivalTime: '09:15 AM', status: 'Awaiting QC', supplier: 'Simbi Farm A', grossWeight: 880 },
];

const statusStyles: Record<InspectionStatus, string> = {
    'Awaiting QC': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// --- Home Dashboard ---
const Home = () => {
    const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
    const [qcModalData, setQcModalData] = useState<QCInspectionData | null>(null);

    return (
        <>
            <div className="p-6 space-y-6">

                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-1">Welcome back, QC Inspector.</h1>
                        <p className="text-green-100 text-base opacity-90">
                            Monitor today's intake, pending inspections, and packhouse floor status.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl"></div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {kpiCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-theme flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{card.label}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg}`}>
                                    <card.icon className={`${card.color}`} size={24} />
                                </div>
                            </div>
                            <p className={`text-sm font-medium ${card.color} dark:text-gray-300`}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Action & Activity Area */}
                <div className="grid grid-cols-3 gap-6">

                    {/* Left: Priority Inspections */}
                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-theme overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Priority Inspections</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Immediate queue requiring your attention</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intake ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crop</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arrival Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {priorityInspections.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{row.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.crop}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.arrivalTime}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setQcModalData({ intakeId: row.id, crop: row.crop, supplier: row.supplier, grossWeight: row.grossWeight })}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm">
                                                    Start Inspection <ArrowRight size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-theme overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Common tasks at a glance</p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <button
                                onClick={() => setIsIntakeModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm shadow-green-900/20"
                            >
                                <span className="text-lg leading-none">+</span>
                                Log Raw Intake
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 font-semibold text-sm hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-[0.98] transition-all">
                                View Cold Room Stock
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Log Raw Intake Modal */}
            <LogRawIntakeModal
                isOpen={isIntakeModalOpen}
                onClose={() => setIsIntakeModalOpen(false)}
            />

            {/* Record QC Modal */}
            <RecordQCModal
                isOpen={!!qcModalData}
                onClose={() => setQcModalData(null)}
                data={qcModalData}
                onSubmit={(res) => console.log("QC Submitted:", res)}
            />
        </>
    );
};

export default Home;
