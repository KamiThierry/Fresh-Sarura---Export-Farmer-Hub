import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import NotFound from './pages/NotFound';
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

// Import other portals as you build them:
// import AdminRoutes from './portals/admin/AdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
  {/* Public Routes */ }
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

  {/* Production Manager Portal */ }
  <Route path="/pm/*" element={<ProductionManagerRoutes />} />

  {/* Farm Manager Portal */ }
  <Route path="/farm-manager/*" element={<FarmManagerRoutes />} />

  {/* Admin Portal */ }
  <Route path="/admin/*" element={<AdminRoutes />} />

  {/* Logistics Officer Portal */ }
  <Route path="/logistics/*" element={<LogisticsRoutes />} />

  {/* QC Officer Portal */ }
  <Route path="/qc/*" element={<QCOfficerRoutes />} />

  {/* Driver Lite Interface */ }
  <Route path="/driver/task/:taskId" element={<DriverTaskView />} />

=======
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Portal routes */}
        <Route path="/pm/*" element={<ProductionManagerRoutes />} />
        <Route path="/farm-manager/*" element={<FarmManagerRoutes />} />

>>>>>>> a5d9669 (updated FM portal version)
  {/* 404 */ }
  <Route path="*" element={<NotFound />} />
      </Routes >
    </BrowserRouter >
  );
}

export default App;