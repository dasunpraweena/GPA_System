import { importService } from './import.service.js';
import { successResponse } from '../../utils/responseHelper.js';

export class ImportController {
  async uploadAndReview(req, res, next) {
    try {
      const reviewData = await importService.uploadAndParsePdf(req.file, req.user);
      return successResponse(res, reviewData, 'PDF uploaded and parsed successfully.', 200);
    } catch (error) {
      next(error);
    }
  }

  async applyResults(req, res, next) {
    try {
      const { fileId, subjectCode, subjectId, examDetails, selectedRows } = req.body;
      const result = await importService.applySelectedResults(
        { fileId, subjectCode, subjectId, examDetails, selectedRows },
        req.user
      );
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await importService.getImportHistory();
      return successResponse(res, history, 'Import audit history loaded.', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const importController = new ImportController();
