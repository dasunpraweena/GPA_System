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

test('Integration Test: Full Registration -> Verification -> Grade Entry -> Admin Deletion', async () => {
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

  // 2. CRITICAL VERIFICATION CHECK: Without verification, user is NOT in the main users table!
  const [unverifiedInUsers] = await pool.query('SELECT id FROM users WHERE university_email = ?', [email]);
  assert.strictEqual(unverifiedInUsers.length, 0, 'Unverified user must NOT be added to users table yet!');

  // Check pending_verifications table
  const [pendingRow] = await pool.query('SELECT id, verification_token FROM pending_verifications WHERE university_email = ?', [email]);
  assert.strictEqual(pendingRow.length, 1);
  const token = pendingRow[0].verification_token;
  assert.ok(token);

  // 3. User verifies email
  const verifyRes = await authService.verifyEmail(token);
  assert.strictEqual(verifyRes.regNo, regNo);

  // User IS NOW in users table
  const [verifiedInUsers] = await pool.query('SELECT id, is_verified FROM users WHERE university_email = ?', [email]);
  assert.strictEqual(verifiedInUsers.length, 1);
  assert.strictEqual(Boolean(verifiedInUsers[0].is_verified), true);

  // And REMOVED from pending_verifications
  const [clearedPending] = await pool.query('SELECT id FROM pending_verifications WHERE university_email = ?', [email]);
  assert.strictEqual(clearedPending.length, 0);

  // 4. Student Logs In & Enters Grade
  const loginRes = await authService.login({ email, password });
  assert.ok(loginRes.token);
  assert.strictEqual(loginRes.user.role, 'student');
  assert.strictEqual(loginRes.user.isVerified, true);

  const { subjects } = await curriculumService.getAllSubjectsGroupedBySemester();
  assert.ok(subjects.length > 0);
  const firstSubject = subjects[0];

  const academicData = await resultService.updateGrade(loginRes.user, firstSubject.id, 'A');
  assert.ok(academicData.gpaSummary);
  assert.strictEqual(academicData.gpaSummary.semesters[0].gpa, 4.0);

  // 5. Admin Directory & Delete User
  const adminLogin = await authService.login({
    email: 'admin@ms.sab.ac.lk',
    password: process.env.ADMIN_PASSWORD || 'AdminPass123!@#'
  });
  assert.strictEqual(adminLogin.user.role, 'admin');

  const directoryUsers = await userService.getAllUsers(regNo);
  assert.strictEqual(directoryUsers.length, 1);
  assert.strictEqual(directoryUsers[0].id, regNo);

  // Admin removes the student
  const deleteRes = await userService.deleteUser(verifiedInUsers[0].id, adminLogin.user);
  assert.ok(deleteRes.message.includes('successfully removed'));

  // Confirm deleted from users table
  const [deletedCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [verifiedInUsers[0].id]);
  assert.strictEqual(deletedCheck.length, 0);
});
