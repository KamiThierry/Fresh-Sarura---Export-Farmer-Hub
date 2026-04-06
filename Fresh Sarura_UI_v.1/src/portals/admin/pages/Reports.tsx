import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { month: 'Oct', shipments: 14, users: 42 },
    { month: 'Nov', shipments: 18, users: 44 },
    { month: 'Dec', shipments: 22, users: 44 },
    { month: 'Jan', shipments: 17, users: 45 },
    { month: 'Feb', shipments: 25, users: 47 },
];

const Reports = () => (
    <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                <BarChart3 size={22} />
            </div>
            <div>
                <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Reports &amp; Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Platform usage and operational metrics</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Monthly Shipments vs Active Users</h2>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Bar dataKey="shipments" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Shipments" />
                    <Bar dataKey="users" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Active Users" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default Reports;
