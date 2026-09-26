import pool from '../../config/db.js';

export class CurriculumRepository {
  async getAllSubjects() {
    const [rows] = await pool.query(
      'SELECT * FROM curriculum_subjects ORDER BY year_no ASC, semester_no ASC, id ASC'
    );
    return rows;
  }

  async getSubjectById(id) {
    const [rows] = await pool.query('SELECT * FROM curriculum_subjects WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async getSubjectByCode(code) {
    const [rows] = await pool.query('SELECT * FROM curriculum_subjects WHERE subject_code = ?', [code]);
    return rows[0] || null;
  }

  async updateSubjectSettings(id, { credits, isGpa, reason, changedBy }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [current] = await connection.query('SELECT * FROM curriculum_subjects WHERE id = ?', [id]);
      if (current.length === 0) {
        throw new Error('Subject not found');
      }

      const old = current[0];

      // Update subject
      await connection.query(
        'UPDATE curriculum_subjects SET credits = ?, is_gpa = ? WHERE id = ?',
        [credits, isGpa, id]
      );

      // Record audit history
      await connection.query(
        `INSERT INTO curriculum_audit_history 
         (subject_id, changed_by, old_credits, new_credits, old_is_gpa, new_is_gpa, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, changedBy, old.credits, credits, old.is_gpa, isGpa, reason || 'Administrative curriculum update']
      );

      await connection.commit();
      return { ...old, credits, is_gpa: isGpa };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAuditHistory(subjectId = null) {
    let query = `
      SELECT h.*, u.full_name as changed_by_name, s.subject_code, s.subject_name
      FROM curriculum_audit_history h
      JOIN users u ON h.changed_by = u.id
      JOIN curriculum_subjects s ON h.subject_id = s.id
    `;
    const params = [];
    if (subjectId) {
      query += ' WHERE h.subject_id = ?';
      params.push(subjectId);
    }
    query += ' ORDER BY h.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

export const curriculumRepository = new CurriculumRepository();
