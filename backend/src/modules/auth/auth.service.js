import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { authRepository } from './auth.repository.js';
import { isValidUniversityEmail, deriveRegNoFromEmail } from '../../utils/constants.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/mailer.js';

export class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.university_email,
        role: user.role,
        regNo: user.student_reg_no
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register({ fullName, email, password, confirmPassword }) {
    if (!fullName || !email || !password || !confirmPassword) {
      throw new AppError('Please provide full name, university email, password, and confirmation.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Enforce strict university domain
    if (!isValidUniversityEmail(trimmedEmail)) {
      throw new AppError('Accept student emails only when their exact domain is ms.sab.ac.lk (e.g. 22cse0373@ms.sab.ac.lk).', 400);
    }

    // 2. Validate passwords match & length
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match. Please verify and try again.', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    // 3. Derive student registration number
    const regNo = deriveRegNoFromEmail(trimmedEmail);
    if (!regNo) {
      throw new AppError('Invalid email format: Could not determine your student registration number from the email address.', 400);
    }

    // 4. Check if email already registered
    const existingEmail = await authRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new AppError('An account with this university email already exists.', 409);
    }

    // 5. Check if registration number already registered
    const existingReg = await authRepository.findByRegNo(regNo);
    if (existingReg) {
      throw new AppError(`Registration number ${regNo} is already linked to another account. Exception flagged for administrator review.`, 409);
    }

    // 6. Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Generate single-use verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userId = await authRepository.createStudent({
      fullName: fullName.trim(),
      email: trimmedEmail,
      regNo,
      passwordHash,
      verificationToken,
      verificationExpires
    });

    // 8. Dispatch email
    const verifyUrl = await sendVerificationEmail(trimmedEmail, verificationToken);

    return {
      userId,
      email: trimmedEmail,
      regNo,
      message: 'Account created successfully. A verification link has been sent to your university mailbox.',
      // In development or when SMTP not set, expose the verify link for automated or interactive ease
      verifyUrl: config.nodeEnv === 'development' || !config.email.host ? verifyUrl : undefined
    };
  }

  async verifyEmail(token) {
    if (!token) {
      throw new AppError('Verification token is required.', 400);
    }

    const user = await authRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Verification link is invalid or has expired. Please request a new verification link.', 400);
    }

    await authRepository.verifyUser(user.id);

    // Link any pending exam branch results imported prior to registration
    if (user.student_reg_no) {
      await authRepository.linkExistingExamResults(user.id, user.student_reg_no);
    }

    return {
      email: user.university_email,
      regNo: user.student_reg_no,
      message: 'University email successfully verified. You may now log in to access your results.'
    };
  }

  async resendVerification(email) {
    if (!email) {
      throw new AppError('Please provide your university email.', 400);
    }

    const user = await authRepository.findByEmail(email.trim());
    if (!user) {
      // Generic message to avoid email enumeration
      return { message: 'If an unverified account exists, a new verification link has been sent.' };
    }

    if (user.is_verified) {
      throw new AppError('This account is already verified. Please log in directly.', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepository.setResetToken(user.id, verificationToken, verificationExpires);
    const verifyUrl = await sendVerificationEmail(user.university_email, verificationToken);

    return {
      message: 'A new verification link has been sent to your email.',
      verifyUrl: config.nodeEnv === 'development' || !config.email.host ? verifyUrl : undefined
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Please provide university email and password.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(trimmedEmail);

    // Generic error to prevent enumeration
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Prevent unverified accounts from accessing student data
    if (!user.is_verified && user.role !== 'admin') {
      throw new AppError('Your university email is not verified yet. Please check your inbox or click resend verification.', 403);
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.university_email,
        regNo: user.student_reg_no,
        role: user.role,
        isVerified: !!user.is_verified
      }
    };
  }

  async forgotPassword(email) {
    if (!email) {
      throw new AppError('Please provide your university email address.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(trimmedEmail);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await authRepository.setResetToken(user.id, resetToken, resetExpires);
      const resetUrl = await sendPasswordResetEmail(trimmedEmail, resetToken);

      return {
        message: 'If an account exists with this email, a password reset link has been dispatched.',
        resetUrl: config.nodeEnv === 'development' || !config.email.host ? resetUrl : undefined
      };
    }

    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.'
    };
  }

  async resetPassword({ token, newPassword, confirmPassword }) {
    if (!token || !newPassword || !confirmPassword) {
      throw new AppError('Token and matching passwords are required.', 400);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('Passwords do not match.', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    const user = await authRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Password reset link is invalid or has expired.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await authRepository.updatePassword(user.id, passwordHash);

    return {
      message: 'Password updated successfully. You can now log in with your new password.'
    };
  }
}

export const authService = new AuthService();
