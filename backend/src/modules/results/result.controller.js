import { resultService } from './result.service.js';
import { successResponse } from '../../utils/responseHelper.js';

export class ResultController {
  async getMyResults(req, res, next) {
    try {
      const data = await resultService.getStudentAcademicData(req.user);
      return successResponse(res, data, 'Results and GPA loaded.', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateGrade(req, res, next) {
    try {
      const { subjectId } = req.params;
      const { grade } = req.body;
      const data = await resultService.updateGrade(req.user, subjectId, grade);
      return successResponse(res, data, 'Grade updated and GPA recalculated.', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateElective(req, res, next) {
    try {
      const { subjectId } = req.params;
      const { isSelected } = req.body;
      const data = await resultService.updateElectiveSelection(req.user, subjectId, isSelected);
      return successResponse(res, data, 'Elective selection updated.', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const resultController = new ResultController();
