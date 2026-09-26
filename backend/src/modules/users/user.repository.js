import pool from '../../config/db.js';

export class UserRepository {
  async getAllUsers(search = '') {
    let query = `
      SELECT id, full_name, university_email, student_reg_no, role, is_verified, flagged_for_review, flag_reason, created_at 
      FROM users
    `;
    const params = [];
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` WHERE full_name LIKE ? OR university_email LIKE ? OR student_reg_no LIKE ?`;
      params.push(term, term, term);
    }
    query += ` ORDER BY role ASC, student_reg_no ASC, created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getUserById(id) {
    const [rows] = await pool.query(
      `SELECT id, full_name, university_email, student_reg_no, role, is_verified, flagged_for_review, flag_reason, created_at 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async flagUserForReview(id, flagReason) {
    await pool.query(
      'UPDATE users SET flagged_for_review = TRUE, flag_reason = ? WHERE id = ?',
      [flagReason, id]
    );
  }

  async unflagUser(id) {
    await pool.query(
      'UPDATE users SET flagged_for_review = FALSE, flag_reason = NULL WHERE id = ?',
      [id]
    );
  }
}

export const userRepository = new UserRepository();
