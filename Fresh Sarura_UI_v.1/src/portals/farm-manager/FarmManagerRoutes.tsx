import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import FarmDashboard from './pages/FarmDashboard';
import CropPlanning from './pages/CropPlanning';
import YieldForecasting from './pages/YieldForecasting';
import Performance from './pages/Performance';
import Settings from './pages/Settings';

const FarmManagerRoutes = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<FarmDashboard />} />

                {/* New Requested Routes */}
                <Route path="crop-planning" element={<CropPlanning />} />
                <Route path="yield-forecast" element={<YieldForecasting />} />
                <Route path="performance" element={<Performance />} />
                <Route path="analytics" element={<div className="p-6">Analytics (Coming Soon)</div>} />
                <Route path="communication" element={<div className="p-6">Communication (Coming Soon)</div>} />
                <Route path="settings" element={<Settings />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default FarmManagerRoutes;
