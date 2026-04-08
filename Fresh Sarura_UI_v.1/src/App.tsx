import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductionManagerRoutes from './portals/production-manager/ProductionManagerRoutes';
import FarmManagerRoutes from './portals/farm-manager/FarmManagerRoutes';
import LogisticsRoutes from './portals/logistics-officer/LogisticsRoutes';
import AdminRoutes from './portals/admin/AdminRoutes';
import DriverTaskView from './portals/driver/pages/DriverTaskView';
import QCOfficerRoutes from './portals/qc-officer/QCOfficerRoutes';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import LandingPage from './pages/Index';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Production Manager Portal */}
        <Route path="/pm/*" element={<ProductionManagerRoutes />} />

        {/* Farm Manager Portal */}
        <Route path="/farm-manager/*" element={<FarmManagerRoutes />} />

        {/* Admin Portal */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Logistics Officer Portal */}
        <Route path="/logistics/*" element={<LogisticsRoutes />} />

        {/* QC Officer Portal */}
        <Route path="/qc/*" element={<QCOfficerRoutes />} />

        {/* Driver Lite Interface */}
        <Route path="/driver/task/:taskId" element={<DriverTaskView />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;