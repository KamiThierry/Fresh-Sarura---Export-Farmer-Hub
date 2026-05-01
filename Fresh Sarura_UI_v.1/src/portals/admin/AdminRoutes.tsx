import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import MasterData from './pages/MasterData';
import EventLogs from './pages/EventLogs';
import AdminSettings from './pages/AdminSettings';
import Reports from './pages/Reports';

// PM Pages
import PMFarmerManagement from '../production-manager/pages/FarmerManagement';
import PMCropPlanning from '../production-manager/pages/CropPlanning';
import PMInventoryManagement from '../production-manager/pages/InventoryManagement';
import PMTraceability from '../production-manager/pages/Traceability';
import PMRoomManagement from '../production-manager/pages/RoomManagement';
import { PMProvider } from '@/context/PMContext';

// FM Pages
import FMCropPlanning from '../farm-manager/pages/CropPlanning';
import FMYieldForecasting from '../farm-manager/pages/YieldForecasting';

// QC Pages
import QCProcessing from '../qc-officer/pages/Processing';
import QCColdRoom from '../qc-officer/pages/ColdRoom';

// Logistics Pages
import LogPendingPickups from '../logistics-officer/pages/PendingPickups';
import LogShipments from '../logistics-officer/pages/Shipments';
import LogDocuments from '../logistics-officer/pages/Documents';

const AdminRoutes = () => (
    <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="master-data" element={<MasterData />} />
            <Route path="event-logs" element={<EventLogs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* Production Manager Sub-routes */}
            <Route path="pm/farmers" element={<PMProvider><PMFarmerManagement /></PMProvider>} />
            <Route path="pm/crop-planning" element={<PMProvider><PMCropPlanning /></PMProvider>} />
            <Route path="pm/inventory" element={<PMProvider><PMInventoryManagement /></PMProvider>} />
            <Route path="pm/traceability" element={<PMProvider><PMTraceability /></PMProvider>} />
            <Route path="pm/rooms" element={<PMProvider><PMRoomManagement /></PMProvider>} />

            {/* Farm Manager Sub-routes */}
            <Route path="fm/crop-planning" element={<FMCropPlanning />} />
            <Route path="fm/yield-forecast" element={<FMYieldForecasting />} />

            {/* QC Officer Sub-routes */}
            <Route path="qc/processing" element={<QCProcessing />} />
            <Route path="qc/cold-room" element={<QCColdRoom />} />

            {/* Logistics Officer Sub-routes */}
            <Route path="logistics/pickup" element={<LogPendingPickups />} />
            <Route path="logistics/shipments" element={<LogShipments />} />
            <Route path="logistics/documents" element={<LogDocuments />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
    </Routes>
);

export default AdminRoutes;
