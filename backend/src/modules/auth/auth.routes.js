import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.get('/verify', authController.verifyEmail);
router.post('/verify', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;
