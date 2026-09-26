import { curriculumService } from './curriculum.service.js';
import { successResponse } from '../../utils/responseHelper.js';

export class CurriculumController {
  async getCurriculum(req, res, next) {
    try {
      const data = await curriculumService.getAllSubjectsGroupedBySemester();
      return successResponse(res, data, 'Curriculum loaded successfully.', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const { id } = req.params;
      const { credits, isGpa, reason } = req.body;
      const result = await curriculumService.updateSubjectSettings(id, { credits, isGpa, reason }, req.user);
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAuditHistory(req, res, next) {
    try {
      const { subjectId } = req.query;
      const history = await curriculumService.getCurriculumAuditHistory(subjectId);
      return successResponse(res, history, 'Curriculum audit history loaded.', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const curriculumController = new CurriculumController();
