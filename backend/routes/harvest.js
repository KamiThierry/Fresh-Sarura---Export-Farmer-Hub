import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    declareHarvest,
    getHarvestDeclarations,
    logPickup,
} from '../controllers/harvestController.js';

const router = express.Router();
router.use(protect);

router.post('/', restrictTo('farm_manager'), declareHarvest);
router.get('/', restrictTo('logistics_officer', 'production_manager', 'admin'), getHarvestDeclarations);
router.patch('/:id/pickup', restrictTo('logistics_officer'), logPickup);

export default router;