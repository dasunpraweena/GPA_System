import pool from '../../config/db.js';

export class ResultRepository {
  /**
   * Retrieves all curriculum subjects for a student with their enrollment status
   * and merges any exam branch results (which take precedence).
   */
  async getStudentResultsWithSubjects(userId, studentRegNo) {
    const query = `
      SELECT 
        s.id AS subjectId,
        s.year_no AS yearNo,
        s.semester_no AS semesterNo,
        s.subject_code AS subjectCode,
        s.subject_name AS subjectName,
        s.credits,
        s.is_gpa AS isGpa,
        s.is_elective AS isElective,
        s.default_included AS defaultIncluded,
        e.is_selected AS isSelected,
        e.student_grade AS studentGrade,
        er.grade AS examBranchGrade,
        er.attempt_group AS examAttemptGroup,
        er.is_provisional AS isExamProvisional,
        er.exam_details AS examDetails
      FROM curriculum_subjects s
      LEFT JOIN student_course_enrollments e 
        ON s.id = e.subject_id AND e.user_id = ?
      LEFT JOIN exam_results er 
        ON (er.user_id = ? OR (er.student_reg_no = ? AND er.student_reg_no IS NOT NULL))
        AND (er.subject_id = s.id OR UPPER(er.subject_code) = UPPER(s.subject_code))
      ORDER BY s.year_no ASC, s.semester_no ASC, s.id ASC
    `;

    const [rows] = await pool.query(query, [userId, userId, studentRegNo]);

    return rows.map((r) => {
      // If student has no enrollment record yet, default to defaultIncluded (i.e. True for core, False for elective)
      const isSelected = r.isSelected !== null ? Boolean(r.isSelected) : Boolean(r.defaultIncluded);
      
      // Precedence: Exam branch grade takes precedence if available
      const hasExamResult = Boolean(r.examBranchGrade);
      const effectiveGrade = hasExamResult ? r.examBranchGrade : (r.studentGrade || '');
      const source = hasExamResult ? 'exam_branch' : (r.studentGrade ? 'student_entered' : 'none');

      return {
        id: r.subjectId,
        name: r.subjectName,
        code: r.subjectCode,
        credits: r.credits,
        yearNo: r.yearNo,
        semesterNo: r.semesterNo,
        gpa: Boolean(r.isGpa),
        isGpa: Boolean(r.isGpa),
        elective: Boolean(r.isElective),
        isElective: Boolean(r.isElective),
        included: isSelected,
        isSelected,
        studentGrade: r.studentGrade || '',
        examGrade: r.examBranchGrade || null,
        effectiveGrade,
        source,
        examAttemptGroup: r.examAttemptGroup || null,
        isExamProvisional: r.isExamProvisional ? Boolean(r.isExamProvisional) : false,
        examDetails: r.examDetails || null
      };
    });
  }

  async setElectiveSelection(userId, subjectId, isSelected) {
    await pool.query(
      `INSERT INTO student_course_enrollments (user_id, subject_id, is_selected)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_selected = VALUES(is_selected)`,
      [userId, subjectId, isSelected]
    );
  }

  async setStudentGrade(userId, subjectId, grade) {
    await pool.query(
      `INSERT INTO student_course_enrollments (user_id, subject_id, student_grade)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE student_grade = VALUES(student_grade)`,
      [userId, subjectId, grade || null]
    );
  }

  async hasExamBranchResult(userId, studentRegNo, subjectId, subjectCode) {
    const [rows] = await pool.query(
      `SELECT id, grade FROM exam_results 
       WHERE (user_id = ? OR UPPER(student_reg_no) = UPPER(?))
         AND (subject_id = ? OR UPPER(subject_code) = UPPER(?))`,
      [userId, studentRegNo, subjectId, subjectCode]
    );
    return rows[0] || null;
  }
}

export const resultRepository = new ResultRepository();
