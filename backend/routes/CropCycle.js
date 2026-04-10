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
router.patch('/budget-requests/:id/approve', approveBudgetRequest);
router.patch('/budget-requests/:id/reject', rejectBudgetRequest);

// Yield forecasts
router.patch('/yield-forecasts/:id/verify', verifyForecast);

// Field reports
router.patch('/field-reports/:id/flag', flagFieldReport);

export default router;