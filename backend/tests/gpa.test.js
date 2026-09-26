import test from 'node:test';
import assert from 'node:assert/strict';
import { gpaCalculator } from '../src/modules/gpa/gpa.calculator.js';
import { GRADE_POINTS, YEAR_WEIGHTS } from '../src/utils/constants.js';

test('GPA Calculator: Correct grade point mappings', () => {
  assert.strictEqual(GRADE_POINTS['A+'], 4.0);
  assert.strictEqual(GRADE_POINTS['A'], 4.0);
  assert.strictEqual(GRADE_POINTS['A-'], 3.7);
  assert.strictEqual(GRADE_POINTS['B+'], 3.3);
  assert.strictEqual(GRADE_POINTS['B'], 3.0);
  assert.strictEqual(GRADE_POINTS['B-'], 2.7);
  assert.strictEqual(GRADE_POINTS['C+'], 2.3);
  assert.strictEqual(GRADE_POINTS['C'], 2.0);
  assert.strictEqual(GRADE_POINTS['C-'], 1.7);
  assert.strictEqual(GRADE_POINTS['D+'], 1.3);
  assert.strictEqual(GRADE_POINTS['D'], 1.0);
  assert.strictEqual(GRADE_POINTS['F'], 0.0);
});

test('GPA Calculator: Semester GPA calculation with credits', () => {
  // Course 1: 3 credits, grade A (4.0) -> 12 points
  // Course 2: 2 credits, grade B (3.0) -> 6 points
  // Total points = 18, Total credits = 5, GPA = 3.6
  const courses = [
    { credits: 3, isGpa: true, isSelected: true, effectiveGrade: 'A' },
    { credits: 2, isGpa: true, isSelected: true, effectiveGrade: 'B' }
  ];
  const stats = gpaCalculator.calculateStats(courses);
  assert.strictEqual(stats.credits, 5);
  assert.strictEqual(stats.points, 18);
  assert.strictEqual(stats.gpa, 3.6);
  assert.strictEqual(gpaCalculator.formatGpa(stats.gpa), '3.60');
});

test('GPA Calculator: Excludes non-GPA and unselected electives', () => {
  const courses = [
    { credits: 2, isGpa: true, isSelected: true, effectiveGrade: 'A' }, // 8 points, 2 credits
    { credits: 2, isGpa: false, isSelected: true, effectiveGrade: 'A' }, // non-GPA -> excluded
    { credits: 3, isGpa: true, isSelected: false, effectiveGrade: 'A' } // unselected elective -> excluded
  ];
  const stats = gpaCalculator.calculateStats(courses);
  assert.strictEqual(stats.credits, 2);
  assert.strictEqual(stats.points, 8);
  assert.strictEqual(stats.gpa, 4.0);
});

test('GPA Calculator: Includes F grade with 0.0 points and full credits', () => {
  // Course 1: 3 credits, A (4.0) -> 12 points
  // Course 2: 3 credits, F (0.0) -> 0 points
  // Total points = 12, Total credits = 6 -> GPA = 2.00
  const courses = [
    { credits: 3, isGpa: true, isSelected: true, effectiveGrade: 'A' },
    { credits: 3, isGpa: true, isSelected: true, effectiveGrade: 'F' }
  ];
  const stats = gpaCalculator.calculateStats(courses);
  assert.strictEqual(stats.credits, 6);
  assert.strictEqual(stats.points, 12);
  assert.strictEqual(stats.gpa, 2.0);
  assert.strictEqual(gpaCalculator.formatGpa(stats.gpa), '2.00');
});

test('GPA Calculator: AB (Absent) preserves status and flags provisional estimate', () => {
  const courses = [
    { credits: 3, isGpa: true, isSelected: true, effectiveGrade: 'A', semesterNo: 1 },
    { credits: 2, isGpa: true, isSelected: true, effectiveGrade: 'AB', semesterNo: 1 }
  ];
  const summary = gpaCalculator.calculateAll(courses);
  assert.strictEqual(summary.hasAbsentPending, true);
  assert.ok(summary.finalNote.includes('Estimate excludes AB pending confirmation'));
});

test('GPA Calculator: Weighted Final GPA uses year weights 20%, 20%, 30%, 30%', () => {
  // Year 1 (20%): 20 credits, GPA 3.5 -> points = 70. Weighted points = 70 * 0.20 = 14. Weighted credits = 20 * 0.20 = 4.
  // Year 2 (20%): 20 credits, GPA 3.0 -> points = 60. Weighted points = 60 * 0.20 = 12. Weighted credits = 20 * 0.20 = 4.
  // Year 3 (30%): 20 credits, GPA 4.0 -> points = 80. Weighted points = 80 * 0.30 = 24. Weighted credits = 20 * 0.30 = 6.
  // Year 4 (30%): 20 credits, GPA 3.8 -> points = 76. Weighted points = 76 * 0.30 = 22.8. Weighted credits = 20 * 0.30 = 6.
  // Sum weighted points = 14 + 12 + 24 + 22.8 = 72.8
  // Sum weighted credits = 4 + 4 + 6 + 6 = 20
  // Final GPA = 72.8 / 20 = 3.64

  const courses = [
    // Year 1 (Sem 1)
    { credits: 20, isGpa: true, isSelected: true, effectiveGrade: 'A', semesterNo: 1 }, // we simulate with single aggregate course for exact point test
  ];
  // Using multiple courses
  const testCourses = [
    // Year 1 (sem 1, 20 credits, all B+ 3.3) -> points = 66
    { credits: 20, isGpa: true, isSelected: true, effectiveGrade: 'B+', semesterNo: 1 },
    // Year 2 (sem 3, 20 credits, all A 4.0) -> points = 80
    { credits: 20, isGpa: true, isSelected: true, effectiveGrade: 'A', semesterNo: 3 },
    // Year 3 (sem 5, 20 credits, all B 3.0) -> points = 60
    { credits: 20, isGpa: true, isSelected: true, effectiveGrade: 'B', semesterNo: 5 },
    // Year 4 (sem 7, 20 credits, all A- 3.7) -> points = 74
    { credits: 20, isGpa: true, isSelected: true, effectiveGrade: 'A-', semesterNo: 7 }
  ];

  const summary = gpaCalculator.calculateAll(testCourses);
  // Year 1 weight 0.2: points = 66*0.2 = 13.2, credits = 4
  // Year 2 weight 0.2: points = 80*0.2 = 16.0, credits = 4
  // Year 3 weight 0.3: points = 60*0.3 = 18.0, credits = 6
  // Year 4 weight 0.3: points = 74*0.3 = 22.2, credits = 6
  // Total weighted points = 13.2 + 16.0 + 18.0 + 22.2 = 69.4
  // Total weighted credits = 4 + 4 + 6 + 6 = 20
  // Expected final GPA = 69.4 / 20 = 3.47
  assert.strictEqual(Number(summary.finalGpa.toFixed(2)), 3.47);
  assert.strictEqual(gpaCalculator.formatGpa(summary.finalGpa), '3.47');
});

test('GPA Calculator: Returns — when no eligible grades exist', () => {
  const courses = [
    { credits: 2, isGpa: true, isSelected: true, effectiveGrade: '' }
  ];
  const summary = gpaCalculator.calculateAll(courses);
  assert.strictEqual(summary.finalGpa, null);
  assert.strictEqual(gpaCalculator.formatGpa(summary.finalGpa), '—');
});
