import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    requestRoom,
    getPendingRoomRequests,
    assignRoom,
    completeBatch,
    getMyBatches,
} from '../controllers/harvestController.js';

const router = express.Router();
router.use(protect);

router.post('/', restrictTo('quality_officer', 'admin'), requestRoom);
router.get('/my', restrictTo('quality_officer', 'admin'), getMyBatches);
router.get('/pending-room', restrictTo('production_manager', 'admin'), getPendingRoomRequests);
router.patch('/:id/assign-room', restrictTo('production_manager', 'admin'), assignRoom);
router.patch('/:id/complete', restrictTo('quality_officer', 'admin'), completeBatch);

export default router;