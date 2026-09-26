import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import curriculumRoutes from '../modules/curriculum/curriculum.routes.js';
import resultRoutes from '../modules/results/result.routes.js';
import importRoutes from '../modules/imports/import.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'GPA System Backend - Sabaragamuwa University of Sri Lanka',
    timestamp: new Date().toISOString()
  });
});

// Domain-specific routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/curriculum', curriculumRoutes);
router.use('/results', resultRoutes);
router.use('/imports', importRoutes);

export default router;
