import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    getCropCycles,
    createCropCycle,
    updateCropCycle,
    deleteCropCycle,
    getCropCycleFull,
    closeCropCycle,
    adjustBudget,
    approveBudgetRequest,
    rejectBudgetRequest,
    verifyForecast,
    flagFieldReport,
    getPendingBudgetRequests,
    getPendingForecasts,
    getPendingFieldReports,
    markRequestAsRead,
    markForecastAsRead,
    markReportAsRead,
} from '../controllers/CropCycle.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('production_manager', 'admin'));

// Core CRUD
router.route('/').get(getCropCycles).post(createCropCycle);
router.route('/:id').patch(updateCropCycle).delete(deleteCropCycle);

// Cycle lifecycle
router.get('/:id/full', getCropCycleFull);
router.patch('/:id/close', closeCropCycle);
router.patch('/:id/adjust-budget', adjustBudget);

// Budget requests
router.get('/budget-requests/pending', getPendingBudgetRequests);
router.patch('/budget-requests/:id/approve', approveBudgetRequest);
router.patch('/budget-requests/:id/reject', rejectBudgetRequest);

// Yield forecasts
router.get('/forecasts/pending', getPendingForecasts);
router.patch('/yield-forecasts/:id/verify', verifyForecast);

// Field reports
router.get('/field-reports/pending', getPendingFieldReports);
router.patch('/field-reports/:id/flag', flagFieldReport);

// Read markers for dashboard
router.patch('/budget-requests/:id/read', markRequestAsRead);
router.patch('/yield-forecasts/:id/read', markForecastAsRead);
router.patch('/field-reports/:id/read', markReportAsRead);

export default router;