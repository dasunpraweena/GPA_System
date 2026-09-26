import { Router } from 'express';
import { importController } from './import.controller.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';
import { uploadPdf } from '../../middlewares/upload.middleware.js';

const router = Router();

// All import routes are strictly restricted to administrators
router.post('/upload', authenticate, requireAdmin, uploadPdf.single('file'), importController.uploadAndReview);
router.post('/apply', authenticate, requireAdmin, importController.applyResults);
router.get('/history', authenticate, requireAdmin, importController.getHistory);

export default router;
