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

    // 4. Check if ALREADY VERIFIED in the active system (users table)
    const existingActiveUser = await authRepository.findByEmail(trimmedEmail);
    if (existingActiveUser) {
      throw new AppError('An account with this university email is already registered and active. Please log in directly.', 409);
    }

    const existingReg = await authRepository.findByRegNo(regNo);
    if (existingReg) {
      throw new AppError(`Registration number ${regNo} is already linked to an active account. Exception flagged for administrator review.`, 409);
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Generate single-use verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 7. Save into pending_verifications ONLY - DO NOT add to users table until verified!
    await authRepository.savePendingRegistration({
      fullName: fullName.trim(),
      email: trimmedEmail,
      regNo,
      passwordHash,
      verificationToken,
      expiresAt
    });

    // 8. Dispatch verification email
    const verifyUrl = await sendVerificationEmail(trimmedEmail, verificationToken);

    return {
      email: trimmedEmail,
      regNo,
      message: 'A verification link has been sent to your university mailbox. Your account will be added to the system upon email verification.',
      verifyUrl: config.nodeEnv === 'development' || !config.email.host ? verifyUrl : undefined
    };
  }

  async verifyEmail(token) {
    if (!token) {
      throw new AppError('Verification token is required.', 400);
    }

    // 1. Check pending_verifications
    const pending = await authRepository.findPendingByToken(token);
    if (pending) {
      // Create user in main users table now that email ownership is verified!
      const newUserId = await authRepository.createVerifiedUserFromPending(pending);
      return {
        userId: newUserId,
        email: pending.university_email,
        regNo: pending.student_reg_no,
        message: 'University email confirmed! Your account has been created and verified. You may now log in.'
      };
    }

    // 2. Check if user was already verified earlier
    throw new AppError('Verification link is invalid or has expired. If you already verified, please log in. Otherwise, please register again.', 400);
  }

  async resendVerification(email) {
    if (!email) {
      throw new AppError('Please provide your university email.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if already active user
    const active = await authRepository.findByEmail(trimmedEmail);
    if (active) {
      throw new AppError('This account is already registered and verified. Please log in directly.', 400);
    }

    // Check pending
    const pending = await authRepository.findPendingByEmail(trimmedEmail);
    if (!pending) {
      return { message: 'If a pending registration exists, a verification link has been sent.' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepository.savePendingRegistration({
      fullName: pending.full_name,
      email: pending.university_email,
      regNo: pending.student_reg_no,
      passwordHash: pending.password_hash,
      verificationToken,
      expiresAt
    });

    const verifyUrl = await sendVerificationEmail(trimmedEmail, verificationToken);

    return {
      message: 'A new verification link has been dispatched to your email.',
      verifyUrl: config.nodeEnv === 'development' || !config.email.host ? verifyUrl : undefined
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Please provide university email and password.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(trimmedEmail);

    // If not in active users, check if there is a pending unverified registration
    if (!user) {
      const pending = await authRepository.findPendingByEmail(trimmedEmail);
      if (pending) {
        // Send fresh verification link
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await authRepository.savePendingRegistration({
          fullName: pending.full_name,
          email: pending.university_email,
          regNo: pending.student_reg_no,
          passwordHash: pending.password_hash,
          verificationToken,
          expiresAt
        });
        const verifyUrl = await sendVerificationEmail(trimmedEmail, verificationToken);

        const err = new AppError('Your account is pending email verification. A fresh verification link has been dispatched.', 403);
        err.data = {
          unverified: true,
          email: trimmedEmail,
          verifyUrl: config.nodeEnv === 'development' || !config.email.host ? verifyUrl : undefined
        };
        throw err;
      }

      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
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
