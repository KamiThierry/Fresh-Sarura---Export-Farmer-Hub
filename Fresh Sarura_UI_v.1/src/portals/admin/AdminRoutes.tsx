import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import MasterData from './pages/MasterData';
import EventLogs from './pages/EventLogs';
import AdminSettings from './pages/AdminSettings';
import Reports from './pages/Reports';

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
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
    </Routes>
);

export default AdminRoutes;
