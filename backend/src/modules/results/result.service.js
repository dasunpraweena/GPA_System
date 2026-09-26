import { resultRepository } from './result.repository.js';
import { curriculumRepository } from '../curriculum/curriculum.repository.js';
import { gpaCalculator } from '../gpa/gpa.calculator.js';
import { GRADE_POINTS } from '../../utils/constants.js';
import { AppError } from '../../utils/AppError.js';

export class ResultService {
  async getStudentAcademicData(user) {
    const results = await resultRepository.getStudentResultsWithSubjects(user.id, user.student_reg_no);
    const gpaSummary = gpaCalculator.calculateAll(results);

    // Group subjects into semesters (1 to 8)
    const semesters = Array.from({ length: 8 }, () => []);
    results.forEach((item) => {
      const semIdx = item.semesterNo - 1;
      if (semIdx >= 0 && semIdx < 8) {
        semesters[semIdx].push(item);
      }
    });

    return {
      semesters,
      allResults: results,
      gpaSummary
    };
  }

  async updateGrade(user, subjectId, grade) {
    // 1. Validate subject exists
    const subject = await curriculumRepository.getSubjectById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found.', 404);
    }

    // 2. Validate grade value if provided
    const trimmedGrade = grade ? grade.trim().toUpperCase() : '';
    if (trimmedGrade !== '' && trimmedGrade !== 'AB' && !Object.prototype.hasOwnProperty.call(GRADE_POINTS, trimmedGrade)) {
      throw new AppError(`Invalid grade '${grade}'. Allowed grades: ${Object.keys(GRADE_POINTS).join(', ')}, AB`, 400);
    }

    // 3. Students must NOT overwrite exam-branch results
    const examResult = await resultRepository.hasExamBranchResult(
      user.id,
      user.student_reg_no,
      subjectId,
      subject.subject_code
    );
    if (examResult) {
      throw new AppError('This subject already has an official exam-branch result recorded. Student-entered overrides are not permitted.', 403);
    }

    // 4. Save student grade
    await resultRepository.setStudentGrade(user.id, subjectId, trimmedGrade);

    // 5. Return updated academic data & authoritative GPA
    return await this.getStudentAcademicData(user);
  }

  async updateElectiveSelection(user, subjectId, isSelected) {
    const subject = await curriculumRepository.getSubjectById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found.', 404);
    }

    // Core subjects cannot be deselected
    if (!subject.is_elective && !isSelected) {
      throw new AppError('Required core subjects cannot be deselected.', 400);
    }

    await resultRepository.setElectiveSelection(user.id, subjectId, Boolean(isSelected));
    return await this.getStudentAcademicData(user);
  }
}

export const resultService = new ResultService();
