// Academic constants and grading scale rules
// Sabaragamuwa University of Sri Lanka - Software Engineering

export const GRADE_POINTS = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
};

export const YEAR_WEIGHTS = [0.20, 0.20, 0.30, 0.30];

export const UNIVERSITY_EMAIL_DOMAIN = 'ms.sab.ac.lk';

/**
 * Validates that an email strictly ends with @ms.sab.ac.lk
 */
export const isValidUniversityEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9._%+-]+@ms\.sab\.ac\.lk$/i;
  return regex.test(email.trim());
};

/**
 * Suggests/derives student registration number from email
 * e.g. "22cse0373@ms.sab.ac.lk" -> "22CSE0373"
 */
export const deriveRegNoFromEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  const username = email.split('@')[0].trim();
  // Check if username looks like a registration number e.g., 22cse0373 or 20apse4852
  const regRegex = /^([0-9]{2}[a-zA-Z]{2,5}[0-9]{3,5})$/i;
  if (regRegex.test(username)) {
    return username.toUpperCase();
  }
  return null;
};
