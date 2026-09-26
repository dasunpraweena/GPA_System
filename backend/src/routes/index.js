import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Domain-specific routes will be registered here, e.g.:
// router.use('/auth', authRoutes);
// router.use('/students', studentRoutes);
// router.use('/courses', courseRoutes);
// router.use('/grades', gradeRoutes);

export default router;
