import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserDetails);
router.patch('/:id/flag', authenticate, requireAdmin, userController.flagUser);
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

export default router;
