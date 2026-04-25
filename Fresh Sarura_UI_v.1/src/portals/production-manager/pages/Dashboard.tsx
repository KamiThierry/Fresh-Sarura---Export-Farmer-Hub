import DashboardStats from '../components/DashboardStats';
import QuickActionsGrid from '../components/QuickActionsGrid';
import LogIntakeModal from '../components/LogIntakeModal';
import FindBatchModal from '../components/FindBatchModal';
import ExportTrendsChart from '../components/ExportTrendsChart';
import CropCyclesOverview from '../components/CropCyclesOverview';
import LossAnalyticsChart from '../components/LossAnalyticsChart';
import RecentActivityTable from '../components/RecentActivityTable';
import { usePMContext } from '@/context/PMContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DashboardProps {
    currentIntake: number;
    qualityGrade: string;
    scheduledExports: number;
    pendingRoomRequestsCount?: number;
    isIntakeOpen: boolean;
    isTraceabilityOpen: boolean;
    onLogIntake: () => void;
    onRegisterFarmer: () => void;
    onCreateCycle: () => void;
    onFindBatch: () => void;
    onCloseIntake: () => void;
    onIntakeSubmit: (weight: number) => void;
    onCloseTraceability: () => void;
}

const Dashboard = ({
    currentIntake,
    qualityGrade,
    scheduledExports,
    isIntakeOpen,
    isTraceabilityOpen,
    onLogIntake,
    onRegisterFarmer,
    onCreateCycle,
    onFindBatch,
    onCloseIntake,
    onIntakeSubmit,
    onCloseTraceability
}: DashboardProps) => {
    const { cycles, pendingRoomRequests, shipments, stock } = usePMContext();
    const activeCyclesCount = cycles.filter(c => c.status !== 'completed').length;
    const pendingRoomRequestsCount = (pendingRoomRequests || []).length;
    const [userName, setUserName] = useState<string>('Production Manager');

    const coldRoomStockKg = (stock || []).reduce(
        (sum: number, b: any) => sum + ((b.processedWeightKg || 0) - (b.rejectedWeightKg || 0)), 0
    );
    const coldRoomStockDisplay = `${(coldRoomStockKg / 1000).toFixed(1)} Tons`;

    const scheduledShipments = (shipments || []).filter(s =>
        s.status === 'PackingListGenerated'
    );

    const scheduledShipmentsWeightKg = scheduledShipments.reduce(
        (sum: number, s: any) => sum + (s.totalWeightKg || 0), 0
    );

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Try getting from localStorage first for instant display
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.name) setUserName(user.name);
                }

                // But also fetch from API to be 100% sure it's correct from DB
                const res = await api.get('/auth/me');
                if (res.user && res.user.name) {
                    setUserName(res.user.name);
                } else if (res.name) {
                    setUserName(res.name);
                }
            } catch (err) {
                console.error('Failed to fetch user name:', err);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="p-6">
            {/* Summary Cards */}
            <div className="mb-6">
                <DashboardStats
                    todaysIntake={`${currentIntake.toLocaleString()} kg`}
                    coldRoomStock={coldRoomStockDisplay}
                    activeCyclesCount={activeCyclesCount}
                    scheduledExports={`${(scheduledShipmentsWeightKg / 1000).toFixed(1)} Tons`}
                    pendingRoomRequestsCount={pendingRoomRequestsCount}
                    userName={userName}
                    scheduledShipments={scheduledShipments}
                />
            </div>

            {/* Quick Actions Grid */}
            <QuickActionsGrid
                onLogIntake={onLogIntake}
                onRegisterFarmer={onRegisterFarmer}
                onCreateCycle={onCreateCycle}
                onFindBatch={onFindBatch}
            />

            {/* Log Intake Modal */}
            <LogIntakeModal
                isOpen={isIntakeOpen}
                onClose={onCloseIntake}
                onSubmit={onIntakeSubmit}
            />

            {/* Find Batch Modal */}
            <FindBatchModal
                isOpen={isTraceabilityOpen}
                onClose={onCloseTraceability}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <ExportTrendsChart />
                </div>
                <div className="col-span-1">
                    <CropCyclesOverview />
                </div>
            </div>

            {/* Loss Analytics and Recent Activity */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="col-span-1">
                    <LossAnalyticsChart />
                </div>
                <div className="col-span-2">
                    <RecentActivityTable />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
