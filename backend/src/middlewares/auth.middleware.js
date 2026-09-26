import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, university_email, student_reg_no, role, is_verified, flagged_for_review FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: Administrator privileges required to access this resource.', 403));
  }
  next();
};

export const requireVerified = (req, res, next) => {
  if (!req.user || (!req.user.is_verified && req.user.role !== 'admin')) {
    return next(new AppError('Account not verified. Please verify your university email before accessing academic records.', 403));
  }
  next();
};
