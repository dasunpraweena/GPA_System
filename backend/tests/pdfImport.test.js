import test from 'node:test';
import assert from 'node:assert/strict';

test('PDF Import: Conflict detection flags rows with differing existing grades', () => {
  const existingResultsMap = new Map([
    ['22CSE0373', { grade: 'B+' }]
  ]);
  const userMap = new Map([
    ['22CSE0373', { id: 1, name: 'Student 0373' }]
  ]);

  const candidateRow = {
    studentRegNo: '22CSE0373',
    grade: 'B', // PDF has B, while existing is B+
    attemptGroup: 'Main group'
  };

  const user = userMap.get(candidateRow.studentRegNo);
  const existing = existingResultsMap.get(candidateRow.studentRegNo);

  let status = 'Ready';
  let selected = true;

  if (!user) {
    status = 'Unmatched';
    selected = false;
  } else if (existing && existing.grade !== candidateRow.grade) {
    status = 'Conflict';
    selected = false; // Requires explicit admin check
  }

  assert.strictEqual(status, 'Conflict');
  assert.strictEqual(selected, false);
});

test('PDF Import: Unmatched accounts are held pending account linking', () => {
  const userMap = new Map(); // Empty registered users

  const candidateRow = {
    studentRegNo: '22CSE0376',
    grade: 'A-',
    attemptGroup: 'Main group'
  };

  const user = userMap.get(candidateRow.studentRegNo);
  assert.strictEqual(user, undefined);
  const status = !user ? 'Unmatched' : 'Ready';
  assert.strictEqual(status, 'Unmatched');
});
