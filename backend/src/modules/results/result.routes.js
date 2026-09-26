import { Router } from 'express';
import { resultController } from './result.controller.js';
import { authenticate, requireVerified } from '../../middlewares/auth.middleware.js';

const router = Router();

// Student must be logged in and verified to view/modify results
router.get('/my-results', authenticate, requireVerified, resultController.getMyResults);
router.put('/grade/:subjectId', authenticate, requireVerified, resultController.updateGrade);
router.put('/elective/:subjectId', authenticate, requireVerified, resultController.updateElective);

export default router;
