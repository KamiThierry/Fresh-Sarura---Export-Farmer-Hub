import express from 'express';
import healthRoutes from './health.js';

const router = express.Router();

// API version prefix
const apiVersion = '/api/v1';

/**
 * Health Check Routes
 */
router.use(`${apiVersion}/health`, healthRoutes);

/**
 * Example: Add more routes here as needed
 * router.use(`${apiVersion}/users`, userRoutes);
 * router.use(`${apiVersion}/products`, productRoutes);
 */

export default router;
