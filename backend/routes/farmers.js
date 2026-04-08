import express from 'express';
import { getFarmers, registerFarmer, deleteFarmer } from '../controllers/farmerController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected — PM and Admin only
router.use(protect);
router.use(restrictTo('production_manager', 'admin'));

router.get('/', getFarmers);
router.post('/', registerFarmer);
router.delete('/:id', deleteFarmer);

export default router;