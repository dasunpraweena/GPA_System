import { curriculumRepository } from './curriculum.repository.js';
import { AppError } from '../../utils/AppError.js';

export class CurriculumService {
  async getAllSubjectsGroupedBySemester() {
    const subjects = await curriculumRepository.getAllSubjects();
    
    // Group by semester 1..8
    const semesters = Array.from({ length: 8 }, (_, i) => []);
    subjects.forEach((s) => {
      const semIndex = s.semester_no - 1;
      if (semIndex >= 0 && semIndex < 8) {
        semesters[semIndex].push({
          id: s.id,
          name: s.subject_name,
          code: s.subject_code,
          credits: s.credits,
          gpa: !!s.is_gpa,
          elective: !!s.is_elective,
          included: !!s.default_included,
          yearNo: s.year_no,
          semesterNo: s.semester_no
        });
      }
    });

    return { subjects, semesters };
  }

  async updateSubjectSettings(id, { credits, isGpa, reason }, adminUser) {
    if (adminUser.role !== 'admin') {
      throw new AppError('Forbidden: Only administrators can update subject credits or GPA type.', 403);
    }

    const creditNum = Number(credits);
    if (!creditNum || creditNum < 1 || creditNum > 30) {
      throw new AppError('Credits must be an integer between 1 and 30.', 400);
    }

    const updated = await curriculumRepository.updateSubjectSettings(id, {
      credits: creditNum,
      isGpa: Boolean(isGpa),
      reason,
      changedBy: adminUser.id
    });

    return {
      subject: updated,
      message: `Subject ${updated.subject_code} updated successfully. Credits: ${creditNum}, Type: ${isGpa ? 'GPA' : 'Non-GPA'}.`
    };
  }

  async getCurriculumAuditHistory(subjectId) {
    return await curriculumRepository.getAuditHistory(subjectId);
  }
}

export const curriculumService = new CurriculumService();
