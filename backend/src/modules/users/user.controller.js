import { userService } from './user.service.js';
import { successResponse } from '../../utils/responseHelper.js';

export class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { search } = req.query;
      const users = await userService.getAllUsers(search);
      return successResponse(res, users, 'Users retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userService.getUserDetails(id, req.user);
      return successResponse(res, data, 'User details retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  }

  async flagUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await userService.flagUser(id, reason);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id, req.user);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
