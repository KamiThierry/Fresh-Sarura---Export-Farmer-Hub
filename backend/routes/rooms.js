import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getRooms, createRoom, updateRoom } from '../controllers/roomController.js';

const router = express.Router();
router.use(protect);

router.get('/', restrictTo('production_manager', 'quality_officer', 'admin'), getRooms);
router.post('/', restrictTo('production_manager', 'admin'), createRoom);
router.patch('/:id', restrictTo('production_manager', 'admin'), updateRoom);

export default router;
