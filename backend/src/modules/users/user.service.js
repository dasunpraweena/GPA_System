import { userRepository } from './user.repository.js';
import { resultRepository } from '../results/result.repository.js';
import { gpaCalculator } from '../gpa/gpa.calculator.js';
import { AppError } from '../../utils/AppError.js';

export class UserService {
  async getAllUsers(search = '') {
    const users = await userRepository.getAllUsers(search);
    return users.map(u => ({
      id: u.student_reg_no || `USR-${u.id}`,
      dbId: u.id,
      name: u.full_name,
      email: u.university_email,
      role: u.role === 'admin' ? 'Administrator' : 'Student',
      verified: !!u.is_verified,
      flagged: !!u.flagged_for_review,
      flagReason: u.flag_reason,
      createdAt: u.created_at
    }));
  }

  async getUserDetails(userId, requestingUser) {
    // If student, can only view self
    if (requestingUser.role !== 'admin' && requestingUser.id !== Number(userId)) {
      throw new AppError('Forbidden: You can only view your own academic profile.', 403);
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Get all subjects and student results
    const results = await resultRepository.getStudentResultsWithSubjects(user.id, user.student_reg_no);
    const gpaSummary = gpaCalculator.calculateAll(results);

    return {
      profile: {
        id: user.student_reg_no || `USR-${user.id}`,
        dbId: user.id,
        name: user.full_name,
        email: user.university_email,
        role: user.role === 'admin' ? 'Administrator' : 'Student',
        verified: !!user.is_verified,
        degree: 'Software Engineering',
        batch: user.student_reg_no ? `20${user.student_reg_no.substring(0, 2)} Batch` : 'N/A',
        flagged: !!user.flagged_for_review,
        flagReason: user.flag_reason
      },
      results,
      gpaSummary
    };
  }

  async flagUser(userId, reason) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new AppError('User not found.', 404);
    await userRepository.flagUserForReview(userId, reason || 'Flagged by administrator');
    return { message: 'Student account flagged for administrative review.' };
  }

  async deleteUser(userId, adminUser) {
    if (adminUser.role !== 'admin') {
      throw new AppError('Forbidden: Only administrators can remove users.', 403);
    }

    if (adminUser.id === Number(userId)) {
      throw new AppError('You cannot delete your own administrator account.', 400);
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    await userRepository.deleteUser(userId);
    return {
      message: `User ${user.full_name} (${user.student_reg_no || user.university_email}) was successfully removed from the system.`
    };
  }
}

export const userService = new UserService();
