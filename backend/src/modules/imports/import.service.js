import { importParser } from './import.parser.js';
import { importRepository } from './import.repository.js';
import { curriculumRepository } from '../curriculum/curriculum.repository.js';
import { AppError } from '../../utils/AppError.js';

export class ImportService {
  async uploadAndParsePdf(file, adminUser) {
    if (!file) {
      throw new AppError('No PDF file uploaded. Please select a valid exam result PDF.', 400);
    }

    // 1. Parse PDF
    const parsedData = await importParser.parseResultPdf(file.path);

    // 2. Lookup subject in curriculum
    const subject = await curriculumRepository.getSubjectByCode(parsedData.subjectCode);

    // 3. Save file metadata
    const fileId = await importRepository.recordImportedFile({
      filename: file.filename,
      originalName: file.originalname,
      storagePath: file.path,
      fileSize: file.size,
      uploadedBy: adminUser.id,
      subjectCode: parsedData.subjectCode,
      examDetails: parsedData.examDetails,
      totalRows: parsedData.rows.length
    });

    // 4. Perform student matching and conflict analysis
    const regNumbers = [...new Set(parsedData.rows.map(r => r.studentRegNo))];
    const matchedUsers = await importRepository.findUsersByRegNumbers(regNumbers);
    const existingResults = await importRepository.findExistingExamResults(parsedData.subjectCode, regNumbers);

    const userMap = new Map();
    matchedUsers.forEach(u => userMap.set(u.student_reg_no.toUpperCase(), u));

    const existingMap = new Map();
    existingResults.forEach(r => existingMap.set(r.student_reg_no.toUpperCase(), r));

    // 5. Categorize each candidate row
    const reviewRows = parsedData.rows.map((row, index) => {
      const user = userMap.get(row.studentRegNo);
      const existing = existingMap.get(row.studentRegNo);

      let status = 'Ready';
      let selected = true;
      let existingGrade = existing ? existing.grade : null;

      if (!user) {
        status = 'Unmatched';
        selected = false;
      } else if (row.grade === 'AB') {
        status = 'Absent · review';
        selected = false;
      } else if (row.attemptGroup && row.attemptGroup.toLowerCase().includes('attempt')) {
        status = 'Repeat attempt · review';
        selected = false;
      } else if (existing) {
        if (existing.grade !== row.grade) {
          status = 'Conflict';
          selected = false; // Requires explicit admin authorization to replace
        } else {
          status = 'Duplicate';
          selected = false;
        }
      }

      return {
        rowIndex: index,
        studentRegNo: row.studentRegNo,
        grade: row.grade,
        attemptGroup: row.attemptGroup,
        matchedUser: user ? { id: user.id, name: user.full_name, email: user.university_email } : null,
        existingGrade,
        status,
        selected
      };
    });

    const conflictCount = reviewRows.filter(r => r.status === 'Conflict').length;
    const readyCount = reviewRows.filter(r => r.status === 'Ready').length;
    const unmatchedCount = reviewRows.filter(r => r.status === 'Unmatched').length;
    const heldCount = reviewRows.filter(r => ['Unmatched', 'Absent · review', 'Repeat attempt · review', 'Duplicate'].includes(r.status)).length;

    return {
      fileId,
      fileName: file.originalname,
      subjectCode: parsedData.subjectCode,
      subjectName: subject ? subject.subject_name : parsedData.subjectName,
      subjectId: subject ? subject.id : null,
      examDetails: parsedData.examDetails,
      isProvisional: parsedData.isProvisional,
      summary: {
        totalRows: reviewRows.length,
        matchedCount: matchedUsers.length,
        conflictCount,
        readyCount,
        unmatchedCount,
        heldCount
      },
      reviewRows
    };
  }

  async applySelectedResults({ fileId, subjectCode, subjectId, examDetails, selectedRows }, adminUser) {
    if (!selectedRows || !Array.isArray(selectedRows) || selectedRows.length === 0) {
      throw new AppError('No rows selected to apply.', 400);
    }

    const rowsToApply = [];
    const regNumbers = selectedRows.map(r => r.studentRegNo);
    const matchedUsers = await importRepository.findUsersByRegNumbers(regNumbers);
    const userMap = new Map();
    matchedUsers.forEach(u => userMap.set(u.student_reg_no.toUpperCase(), u));

    for (const row of selectedRows) {
      const user = userMap.get(row.studentRegNo.toUpperCase());
      const isConflict = Boolean(row.existingGrade && row.existingGrade !== row.grade);

      rowsToApply.push({
        studentRegNo: row.studentRegNo,
        grade: row.grade,
        attemptGroup: row.attemptGroup || 'Main group',
        userId: user ? user.id : null,
        previousGrade: row.existingGrade || null,
        actionType: isConflict ? 'update_conflict' : 'insert'
      });
    }

    const appliedHistory = await importRepository.applySelectedResults({
      fileId,
      subjectCode,
      subjectId,
      examDetails,
      rowsToApply,
      adminId: adminUser.id
    });

    return {
      appliedCount: appliedHistory.length,
      appliedHistory,
      message: `Successfully applied ${appliedHistory.length} student result(s). GPAs have been updated.`
    };
  }

  async getImportHistory() {
    return await importRepository.getImportHistory();
  }
}

export const importService = new ImportService();
