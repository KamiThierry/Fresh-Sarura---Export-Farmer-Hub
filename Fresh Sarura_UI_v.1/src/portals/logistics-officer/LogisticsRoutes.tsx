import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import Shipments from './pages/Shipments';
import Fleet from './pages/Fleet';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

const LogisticsRoutes = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="collections" element={<Collections />} />
                <Route path="shipments" element={<Shipments />} />
                <Route path="fleet" element={<Fleet />} />
                <Route path="documents" element={<Documents />} />
                <Route path="settings" element={<Settings />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default LogisticsRoutes;
