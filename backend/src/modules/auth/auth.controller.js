import { authService } from './auth.service.js';
import { successResponse } from '../../utils/responseHelper.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token || req.body.token);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const result = await authService.resendVerification(req.body.email);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Logged in successfully.', 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = {
        id: req.user.id,
        fullName: req.user.full_name,
        email: req.user.university_email,
        regNo: req.user.student_reg_no,
        role: req.user.role,
        isVerified: !!req.user.is_verified,
        flaggedForReview: !!req.user.flagged_for_review
      };
      return successResponse(res, { user }, 'Profile loaded.', 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return successResponse(res, null, 'Logged out successfully.', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
