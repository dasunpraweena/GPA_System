import { GRADE_POINTS, YEAR_WEIGHTS } from '../../utils/constants.js';

export class GpaCalculator {
  /**
   * Calculates metrics for a specific subset of course rows (e.g. a semester or year)
   * @param {Array} rows - array of course/result objects:
   *   { credits, isGpa, isSelected, effectiveGrade }
   */
  calculateStats(rows = []) {
    // Filter to selected GPA courses
    const selectedGpaCourses = rows.filter(
      (c) => c.isSelected !== false && (c.isGpa ?? c.gpa) === true
    );

    // Filter to courses that have a valid awarded grade (including F)
    const gradedCourses = selectedGpaCourses.filter(
      (c) => c.effectiveGrade && Object.prototype.hasOwnProperty.call(GRADE_POINTS, c.effectiveGrade)
    );

    const gradedCredits = gradedCourses.reduce((sum, c) => sum + Number(c.credits), 0);
    const totalPoints = gradedCourses.reduce(
      (sum, c) => sum + Number(c.credits) * GRADE_POINTS[c.effectiveGrade],
      0
    );

    const totalSelectedGpaCredits = selectedGpaCourses.reduce(
      (sum, c) => sum + Number(c.credits),
      0
    );

    const gpa = gradedCredits > 0 ? totalPoints / gradedCredits : null;

    const hasAbsentPending = selectedGpaCourses.some(
      (c) => c.effectiveGrade === 'AB'
    );

    const isComplete =
      selectedGpaCourses.length > 0 &&
      selectedGpaCourses.length === gradedCourses.length;

    return {
      credits: gradedCredits,
      points: totalPoints,
      gpa,
      totalCredits: totalSelectedGpaCredits,
      gradedCount: gradedCourses.length,
      totalCount: selectedGpaCourses.length,
      isComplete,
      hasAbsentPending
    };
  }

  /**
   * Calculates comprehensive GPA metrics:
   * - Semester GPAs (1 to 8)
   * - Yearly GPAs (Year 1 to 4)
   * - Cumulative GPA
   * - Weighted Final GPA
   */
  calculateAll(subjectsWithResults = []) {
    // 1. Group by 8 semesters
    const semesterBuckets = Array.from({ length: 8 }, () => []);
    subjectsWithResults.forEach((item) => {
      const semIdx = item.semesterNo - 1;
      if (semIdx >= 0 && semIdx < 8) {
        semesterBuckets[semIdx].push(item);
      }
    });

    const semesterStats = semesterBuckets.map((semRows) => this.calculateStats(semRows));

    // 2. Yearly stats (Year 1: sem 1+2, Year 2: sem 3+4, Year 3: sem 5+6, Year 4: sem 7+8)
    const yearStats = YEAR_WEIGHTS.map((_, i) => {
      const yearRows = semesterBuckets.slice(i * 2, i * 2 + 2).flat();
      return this.calculateStats(yearRows);
    });

    // 3. Overall cumulative stats across all 8 semesters
    const allRows = semesterBuckets.flat();
    const cumulativeStats = this.calculateStats(allRows);

    // 4. Weighted Final GPA:
    // sum(year weight * yearly credits * yearly GPA) / sum(year weight * yearly credits)
    // Note: yearly credits * yearly GPA = yearly points!
    // denominator = sum(year weight * yearly credits)
    const weightedPointsSum = yearStats.reduce(
      (sum, y, i) => sum + (y.gpa !== null ? y.points * YEAR_WEIGHTS[i] : 0),
      0
    );

    const weightedCreditsDenominator = yearStats.reduce(
      (sum, y, i) => sum + (y.gpa !== null ? y.credits * YEAR_WEIGHTS[i] : 0),
      0
    );

    const finalGpa =
      weightedCreditsDenominator > 0 ? weightedPointsSum / weightedCreditsDenominator : null;

    const allComplete = semesterStats.every((s) => s.isComplete);
    const hasAnyAbsent = allRows.some(
      (c) => c.isSelected !== false && (c.isGpa ?? c.gpa) === true && c.effectiveGrade === 'AB'
    );

    // Note texts matching visual design requirements
    let finalNote = 'Add your first grade to get started.';
    let finalLabel = 'Weighted final GPA estimate';

    if (finalGpa !== null) {
      if (allComplete) {
        finalLabel = 'Final GPA · selected courses';
        finalNote = 'All selected GPA subjects have grades.';
      } else if (hasAnyAbsent) {
        finalNote = 'Estimate excludes AB pending confirmation of the absence rule.';
      } else {
        finalNote = 'Based on entered grades; incomplete results are an estimate.';
      }
    }

    return {
      semesters: semesterStats,
      years: yearStats,
      cumulative: cumulativeStats,
      finalGpa,
      isFinalComplete: allComplete,
      hasAbsentPending: hasAnyAbsent,
      finalLabel,
      finalNote
    };
  }

  formatGpa(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '—';
    }
    return Number(value).toFixed(2);
  }
}

export const gpaCalculator = new GpaCalculator();
