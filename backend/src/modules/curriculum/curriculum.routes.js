import { Router } from 'express';
import { curriculumController } from './curriculum.controller.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Everyone logged in can view the curriculum
router.get('/', authenticate, curriculumController.getCurriculum);

// Only admin can update subject settings & view audit history
router.put('/subjects/:id', authenticate, requireAdmin, curriculumController.updateSubject);
router.get('/audit-history', authenticate, requireAdmin, curriculumController.getAuditHistory);

export default router;
