import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    getCropCycles,
    createCropCycle,
    updateCropCycle,
    deleteCropCycle,
} from '../controllers/CropCycle.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('production_manager', 'admin'));

router.route('/').get(getCropCycles).post(createCropCycle);
router.route('/:id').patch(updateCropCycle).delete(deleteCropCycle);

export default router;