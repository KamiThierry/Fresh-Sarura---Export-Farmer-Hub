import express from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import farmerRoutes from './farmers.js';

const router = express.Router();

// API version prefix
const apiVersion = '/api/v1';

/**
 * Health Check Routes
 */
router.use(`${apiVersion}/health`, healthRoutes);

/**
 * Auth Routes
 */
router.use(`${apiVersion}/auth`, authRoutes);

/**
 * Example: Add more routes here as needed
 * router.use(`${apiVersion}/users`, userRoutes);
 * router.use(`${apiVersion}/products`, productRoutes);
 */

router.use(`${apiVersion}/farmers`, farmerRoutes);

export default router;