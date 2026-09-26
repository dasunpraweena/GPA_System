import pool from '../../config/db.js';

export class ImportRepository {
  async recordImportedFile({ filename, originalName, storagePath, fileSize, uploadedBy, subjectCode, examDetails, totalRows }) {
    const [result] = await pool.query(
      `INSERT INTO imported_files 
       (filename, original_name, storage_path, file_size, uploaded_by, subject_code, examination_details, total_rows)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [filename, originalName, storagePath, fileSize, uploadedBy, subjectCode, examDetails, totalRows]
    );
    return result.insertId;
  }

  async getImportedFileById(id) {
    const [rows] = await pool.query('SELECT * FROM imported_files WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findUsersByRegNumbers(regNumbers = []) {
    if (regNumbers.length === 0) return [];
    const placeholders = regNumbers.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT id, student_reg_no, full_name, university_email, is_verified 
       FROM users 
       WHERE UPPER(student_reg_no) IN (${placeholders})`,
      regNumbers.map(r => r.toUpperCase())
    );
    return rows;
  }

  async findExistingExamResults(subjectCode, regNumbers = []) {
    if (regNumbers.length === 0) return [];
    const placeholders = regNumbers.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT id, student_reg_no, subject_code, grade, attempt_group, user_id 
       FROM exam_results 
       WHERE UPPER(subject_code) = UPPER(?) 
         AND UPPER(student_reg_no) IN (${placeholders})`,
      [subjectCode, ...regNumbers.map(r => r.toUpperCase())]
    );
    return rows;
  }

  async applySelectedResults({ fileId, subjectCode, subjectId, examDetails, rowsToApply, adminId }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const appliedAudits = [];

      for (const item of rowsToApply) {
        const { studentRegNo, grade, attemptGroup, userId, previousGrade, actionType } = item;

        // 1. Insert or Update exam_results
        await connection.query(
          `INSERT INTO exam_results 
           (user_id, student_reg_no, subject_code, subject_id, grade, attempt_group, is_provisional, exam_details, import_file_id)
           VALUES (?, UPPER(?), UPPER(?), ?, ?, ?, TRUE, ?, ?)
           ON DUPLICATE KEY UPDATE 
             user_id = VALUES(user_id),
             grade = VALUES(grade),
             is_provisional = VALUES(is_provisional),
             exam_details = VALUES(exam_details),
             import_file_id = VALUES(import_file_id)`,
          [userId || null, studentRegNo, subjectCode, subjectId || null, grade, attemptGroup || 'Main group', examDetails, fileId || null]
        );

        // 2. Insert into import_audit_history
        await connection.query(
          `INSERT INTO import_audit_history 
           (import_file_id, student_reg_no, subject_code, previous_grade, new_grade, attempt_group, action_type, performed_by)
           VALUES (?, UPPER(?), UPPER(?), ?, ?, ?, ?, ?)`,
          [fileId || null, studentRegNo, subjectCode, previousGrade || null, grade, attemptGroup || 'Main group', actionType || 'insert', adminId]
        );

        appliedAudits.push({
          id: studentRegNo,
          old: previousGrade,
          grade,
          attempt: attemptGroup || 'Main group'
        });
      }

      // Update applied_rows count in imported_files
      if (fileId) {
        await connection.query(
          'UPDATE imported_files SET applied_rows = applied_rows + ? WHERE id = ?',
          [rowsToApply.length, fileId]
        );
      }

      await connection.commit();
      return appliedAudits;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getImportHistory() {
    const [rows] = await pool.query(
      `SELECT h.*, u.full_name as admin_name, f.original_name as file_name
       FROM import_audit_history h
       JOIN users u ON h.performed_by = u.id
       LEFT JOIN imported_files f ON h.import_file_id = f.id
       ORDER BY h.performed_at DESC
       LIMIT 100`
    );
    return rows;
  }
}

export const importRepository = new ImportRepository();
