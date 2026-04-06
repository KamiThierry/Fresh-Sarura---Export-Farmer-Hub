import { useState } from 'react';
import {
    TrendingUp, ShieldCheck, Clock, Package,
    CheckCircle2, XCircle, FileText, Camera
} from 'lucide-react';
import Pagination from '../../shared/component/Pagination';

const Performance = () => {
    const [activeTab, setActiveTab] = useState<'harvests' | 'tasks'>('harvests');
    const [harvestPage, setHarvestPage] = useState(1);
    const [taskPage, setTaskPage] = useState(1);
    const itemsPerPage = 3;

    // Mock Data: Harvest Logs
    const HARVEST_LOGS = [
        { id: 'H-001', date: 'Oct 12, 2025', batchId: 'B-2025-001', crop: 'Avocado - Hass', quantity: '500 kg', status: 'Accepted' },
        { id: 'H-002', date: 'Oct 05, 2025', batchId: 'B-2025-002', crop: 'Chili - Birdseye', quantity: '200 kg', status: 'Accepted' },
        { id: 'H-003', date: 'Sep 28, 2025', batchId: 'B-2025-003', crop: 'Avocado - Fuerte', quantity: '450 kg', status: 'Rejected' },
    ];

    // Mock Data: Task History
    const TASK_HISTORY = [
        { id: 'T-101', task: 'Copper Fungicide Spray', dueDate: 'Oct 15', completedDate: 'Oct 14', status: 'Compliant' },
        { id: 'T-102', task: 'Pruning - Block A', dueDate: 'Oct 10', completedDate: 'Oct 10', status: 'Compliant' },
        { id: 'T-103', task: 'Fertilizer Application', dueDate: 'Oct 01', completedDate: 'Oct 02', status: 'Late' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Performance History</h1>
                <p className="text-gray-500 dark:text-gray-400">Track your yield, quality, and compliance records.</p>
            </div>

            {/* Top Stats Row (The Scorecard) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Yield */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Yield</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12,450 <span className="text-base font-medium text-gray-500">kg</span></h3>
                        <p className="text-xs text-green-600 font-medium mt-1">This Season</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
                        <TrendingUp size={24} />
                    </div>
                </div>

                {/* Quality Score */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quality Score</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">94% <span className="text-base font-medium text-gray-500">Grade A</span></h3>
                        <p className="text-xs text-green-600 font-medium mt-1">Based on QC Logs</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                        <ShieldCheck size={24} />
                    </div>
                </div>

                {/* Reliability */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reliability</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">98%</h3>
                        <p className="text-xs text-green-600 font-medium mt-1">On-Time Tasks</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Main Section: Digital Logbook */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => { setActiveTab('harvests'); setHarvestPage(1); }}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'harvests'
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50 dark:bg-green-900/10'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Package size={16} /> Harvest Logs
                        </span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('tasks'); setTaskPage(1); }}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'tasks'
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50 dark:bg-green-900/10'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Task History
                        </span>
                    </button>
                </div>

                {/* Tab Content: Harvest Logs */}
                {activeTab === 'harvests' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Batch ID</th>
                                    <th className="px-6 py-4">Crop</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {HARVEST_LOGS.length > 0 ? (
                                    HARVEST_LOGS.slice((harvestPage - 1) * itemsPerPage, harvestPage * itemsPerPage).map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{log.date}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-sm font-mono text-green-600 hover:underline flex items-center gap-1">
                                                    <FileText size={14} />
                                                    {log.batchId}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{log.crop}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">{log.quantity}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'Accepted'
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {log.status === 'Accepted' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <Package size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>No harvest records found for this season.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination currentPage={harvestPage} totalItems={HARVEST_LOGS.length} itemsPerPage={itemsPerPage} onPageChange={setHarvestPage} />
                    </div>
                )}

                {/* Tab Content: Task History */}
                {activeTab === 'tasks' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Task</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Completed</th>
                                    <th className="px-6 py-4">Evidence</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {TASK_HISTORY.slice((taskPage - 1) * itemsPerPage, taskPage * itemsPerPage).map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{task.task}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{task.dueDate}</td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-medium flex items-center gap-1.5">
                                            <CheckCircle2 size={14} />
                                            {task.completedDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-gray-400 hover:text-green-600 transition-colors">
                                                <Camera size={18} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${task.status === 'Compliant'
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination currentPage={taskPage} totalItems={TASK_HISTORY.length} itemsPerPage={itemsPerPage} onPageChange={setTaskPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Performance;
