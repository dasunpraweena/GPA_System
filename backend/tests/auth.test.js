import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidUniversityEmail, deriveRegNoFromEmail } from '../src/utils/constants.js';

test('Auth: Accepts exact @ms.sab.ac.lk domain and rejects others', () => {
  assert.strictEqual(isValidUniversityEmail('22cse0373@ms.sab.ac.lk'), true);
  assert.strictEqual(isValidUniversityEmail('student@ms.sab.ac.lk'), true);
  assert.strictEqual(isValidUniversityEmail('21cse0174@ms.sab.ac.lk'), true);

  // Rejected emails
  assert.strictEqual(isValidUniversityEmail('student@gmail.com'), false);
  assert.strictEqual(isValidUniversityEmail('22cse0373@sab.ac.lk'), false);
  assert.strictEqual(isValidUniversityEmail('22cse0373@ms.sab.ac.com'), false);
  assert.strictEqual(isValidUniversityEmail('fake@other.lk'), false);
  assert.strictEqual(isValidUniversityEmail(''), false);
  assert.strictEqual(isValidUniversityEmail(null), false);
});

test('Auth: Derives uppercase student registration number correctly', () => {
  assert.strictEqual(deriveRegNoFromEmail('22cse0373@ms.sab.ac.lk'), '22CSE0373');
  assert.strictEqual(deriveRegNoFromEmail('21cse0174@ms.sab.ac.lk'), '21CSE0174');
  assert.strictEqual(deriveRegNoFromEmail('20apse4852@ms.sab.ac.lk'), '20APSE4852');

  // Non-reg number emails (e.g. staff / admin)
  assert.strictEqual(deriveRegNoFromEmail('admin@ms.sab.ac.lk'), null);
  assert.strictEqual(deriveRegNoFromEmail('dean@ms.sab.ac.lk'), null);
});
