import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    requestRoom,
    getPendingRoomRequests,
    assignRoom,
    completeBatch,
} from '../controllers/harvestController.js';

const router = express.Router();
router.use(protect);

router.post('/', restrictTo('qc_officer'), requestRoom);
router.get('/pending-room', restrictTo('production_manager', 'admin'), getPendingRoomRequests);
router.patch('/:id/assign-room', restrictTo('production_manager', 'admin'), assignRoom);
router.patch('/:id/complete', restrictTo('qc_officer'), completeBatch);

export default router;