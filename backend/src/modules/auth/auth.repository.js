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

  // --- Pending Registrations (Without verification, do not add to users table) ---
  async savePendingRegistration({ fullName, email, regNo, passwordHash, verificationToken, expiresAt }) {
    await pool.query(
      `INSERT INTO pending_verifications 
       (full_name, university_email, student_reg_no, password_hash, verification_token, expires_at)
       VALUES (?, LOWER(?), UPPER(?), ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         full_name = VALUES(full_name),
         student_reg_no = VALUES(student_reg_no),
         password_hash = VALUES(password_hash),
         verification_token = VALUES(verification_token),
         expires_at = VALUES(expires_at),
         created_at = CURRENT_TIMESTAMP`,
      [fullName, email, regNo, passwordHash, verificationToken, expiresAt]
    );
  }

  async findPendingByToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM pending_verifications WHERE verification_token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0] || null;
  }

  async findPendingByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM pending_verifications WHERE LOWER(university_email) = LOWER(?)',
      [email]
    );
    return rows[0] || null;
  }

  async createVerifiedUserFromPending(pending) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO users 
         (full_name, university_email, student_reg_no, password_hash, role, is_verified)
         VALUES (?, LOWER(?), UPPER(?), ?, 'student', TRUE)`,
        [pending.full_name, pending.university_email, pending.student_reg_no, pending.password_hash]
      );

      const newUserId = result.insertId;

      // Link any prior exam branch results
      await connection.query(
        'UPDATE exam_results SET user_id = ? WHERE UPPER(student_reg_no) = UPPER(?) AND user_id IS NULL',
        [newUserId, pending.student_reg_no]
      );

      // Remove from pending_verifications
      await connection.query('DELETE FROM pending_verifications WHERE id = ?', [pending.id]);

      await connection.commit();
      return newUserId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // --- Password Reset & Verification Fallbacks ---
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
}

export const authRepository = new AuthRepository();
