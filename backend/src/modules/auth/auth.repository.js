import pool from '../../config/db.js';

export class AuthRepository {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(university_email) = LOWER(?)',
      [email]
    );
    return rows[0] || null;
  }

  async findByRegNo(regNo) {
    if (!regNo) return null;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE UPPER(student_reg_no) = UPPER(?)',
      [regNo]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, university_email, student_reg_no, role, is_verified, flagged_for_review, flag_reason, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async createStudent({ fullName, email, regNo, passwordHash, verificationToken, verificationExpires }) {
    const [result] = await pool.query(
      `INSERT INTO users 
       (full_name, university_email, student_reg_no, password_hash, role, is_verified, verification_token, verification_expires)
       VALUES (?, ?, ?, ?, 'student', FALSE, ?, ?)`,
      [fullName, email.toLowerCase(), regNo ? regNo.toUpperCase() : null, passwordHash, verificationToken, verificationExpires]
    );
    return result.insertId;
  }

  async findByVerificationToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  }

  async verifyUser(id) {
    await pool.query(
      `UPDATE users 
       SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL 
       WHERE id = ?`,
      [id]
    );
  }

  async findByResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  }

  async setResetToken(id, token, expires) {
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, expires, id]
    );
  }

  async updatePassword(id, passwordHash) {
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [passwordHash, id]
    );
  }

  async linkExistingExamResults(userId, regNo) {
    if (!regNo) return;
    await pool.query(
      'UPDATE exam_results SET user_id = ? WHERE UPPER(student_reg_no) = UPPER(?) AND user_id IS NULL',
      [userId, regNo]
    );
  }
}

export const authRepository = new AuthRepository();
