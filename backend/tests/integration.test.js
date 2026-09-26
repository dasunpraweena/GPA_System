import test from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/modules/auth/auth.service.js';
import { resultService } from '../src/modules/results/result.service.js';
import { curriculumService } from '../src/modules/curriculum/curriculum.service.js';
import { importService } from '../src/modules/imports/import.service.js';
import { userService } from '../src/modules/users/user.service.js';
import { gpaCalculator } from '../src/modules/gpa/gpa.calculator.js';
import pool from '../src/config/db.js';
import path from 'path';

test.after(async () => {
  await pool.end();
});

test('Integration Test: Full Registration -> Verification -> Grade Entry -> GPA Calculation', async () => {
  const uniqueId = Math.floor(Math.random() * 9000 + 1000);
  const email = `22cse${uniqueId}@ms.sab.ac.lk`;
  const regNo = `22CSE${uniqueId}`;
  const password = 'StrongPassword123!';

  // 1. Register Student
  const regResult = await authService.register({
    fullName: `Test Student ${uniqueId}`,
    email,
    password,
    confirmPassword: password
  });
  assert.strictEqual(regResult.email, email);
  assert.strictEqual(regResult.regNo, regNo);

  // 2. Fetch token from DB & Verify Email
  const [userRow] = await pool.query('SELECT id, verification_token, is_verified FROM users WHERE university_email = ?', [email]);
  assert.strictEqual(userRow.length, 1);
  const token = userRow[0].verification_token;
  assert.ok(token);

  const verifyRes = await authService.verifyEmail(token);
  assert.strictEqual(verifyRes.regNo, regNo);

  // 3. Login
  const loginRes = await authService.login({ email, password });
  assert.ok(loginRes.token);
  assert.strictEqual(loginRes.user.role, 'student');
  assert.strictEqual(loginRes.user.isVerified, true);

  // 4. Fetch Curriculum & Enter a Grade
  const { subjects } = await curriculumService.getAllSubjectsGroupedBySemester();
  assert.ok(subjects.length > 0);
  const firstSubject = subjects[0]; // e.g. SE1101

  const academicData = await resultService.updateGrade(loginRes.user, firstSubject.id, 'A');
  assert.ok(academicData.gpaSummary);
  assert.strictEqual(academicData.gpaSummary.semesters[0].gradedCount, 1);
  assert.strictEqual(academicData.gpaSummary.semesters[0].gpa, 4.0);
  assert.strictEqual(gpaCalculator.formatGpa(academicData.gpaSummary.semesters[0].gpa), '4.00');

  // 5. Test Admin Login & Student Directory Search
  const adminLogin = await authService.login({
    email: 'admin@ms.sab.ac.lk',
    password: process.env.ADMIN_PASSWORD || 'AdminPass123!@#'
  });
  assert.strictEqual(adminLogin.user.role, 'admin');

  const directoryUsers = await userService.getAllUsers(regNo);
  assert.strictEqual(directoryUsers.length, 1);
  assert.strictEqual(directoryUsers[0].id, regNo);

  // 6. Test PDF Upload & Review
  const samplePdfPath = path.resolve(process.cwd(), 'sample_data/SE3104.pdf');
  const fileObj = {
    path: samplePdfPath,
    filename: 'SE3104.pdf',
    originalname: 'SE3104.pdf',
    size: 2048
  };

  const reviewData = await importService.uploadAndParsePdf(fileObj, adminLogin.user);
  assert.strictEqual(reviewData.subjectCode, 'SE3104');
  assert.ok(reviewData.reviewRows.length >= 7);

  // Clean up created student
  await pool.query('DELETE FROM users WHERE id = ?', [userRow[0].id]);
});
