import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Intake from './pages/Intake';
import Inspection from './pages/Inspection';
import ColdRoom from './pages/ColdRoom';
import Settings from './pages/Settings';

const QCOfficerRoutes = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                {/* Redirect root /qc → /qc/home */}
                <Route path="/" element={<Navigate to="/qc/home" replace />} />

                <Route path="home" element={<Home />} />
                <Route path="intake" element={<Intake />} />
                <Route path="inspection" element={<Inspection />} />
                <Route path="cold-room" element={<ColdRoom />} />
                <Route path="settings" element={<Settings />} />

                {/* Catch-all — absolute path prevents infinite redirect loop */}
                <Route path="*" element={<Navigate to="/qc/home" replace />} />
            </Route>
        </Routes>
    );
};

export default QCOfficerRoutes;
