-- Database Schema for GPA Management System
-- Sabaragamuwa University of Sri Lanka (Software Engineering)

CREATE DATABASE IF NOT EXISTS gpa_system_db;
USE gpa_system_db;

-- 1. Users Table (Verified Active Users Only)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  university_email VARCHAR(150) NOT NULL UNIQUE,
  student_reg_no VARCHAR(50) UNIQUE NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  verification_token VARCHAR(255) NULL,
  verification_expires DATETIME NULL,
  reset_token VARCHAR(255) NULL,
  reset_expires DATETIME NULL,
  flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Pending Registrations Table (Users waiting for email verification)
-- Unverified accounts reside here and DO NOT enter the main users table until verified
CREATE TABLE IF NOT EXISTS pending_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  university_email VARCHAR(150) NOT NULL UNIQUE,
  student_reg_no VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Curriculum Subjects Table
CREATE TABLE IF NOT EXISTS curriculum_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_no INT NOT NULL,
  semester_no INT NOT NULL,
  subject_code VARCHAR(50) NOT NULL UNIQUE,
  subject_name VARCHAR(200) NOT NULL,
  credits INT NOT NULL DEFAULT 2,
  is_gpa BOOLEAN NOT NULL DEFAULT TRUE,
  is_elective BOOLEAN NOT NULL DEFAULT FALSE,
  default_included BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Student Course Enrollments (Personal Elective Selections & Student-entered Grades)
CREATE TABLE IF NOT EXISTS student_course_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT TRUE,
  student_grade VARCHAR(10) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_subject (user_id, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES curriculum_subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Uploaded Result PDF Files Metadata
CREATE TABLE IF NOT EXISTS imported_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT NOT NULL,
  subject_code VARCHAR(50) NULL,
  examination_details VARCHAR(255) NULL,
  total_rows INT DEFAULT 0,
  applied_rows INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Exam Branch Results (Authoritative, takes precedence in calculations)
CREATE TABLE IF NOT EXISTS exam_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  student_reg_no VARCHAR(50) NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  subject_id INT NULL,
  grade VARCHAR(10) NOT NULL,
  attempt_group VARCHAR(100) NOT NULL DEFAULT 'Main group',
  is_provisional BOOLEAN NOT NULL DEFAULT TRUE,
  exam_details VARCHAR(255) NULL,
  import_file_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_subject_attempt (student_reg_no, subject_code, attempt_group),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES curriculum_subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (import_file_id) REFERENCES imported_files(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Import Audit History (Record previous vs new result values)
CREATE TABLE IF NOT EXISTS import_audit_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  import_file_id INT NULL,
  student_reg_no VARCHAR(50) NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  previous_grade VARCHAR(10) NULL,
  new_grade VARCHAR(10) NOT NULL,
  attempt_group VARCHAR(100) NULL,
  action_type ENUM('insert', 'update_conflict', 'held') NOT NULL,
  performed_by INT NOT NULL,
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_file_id) REFERENCES imported_files(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Curriculum Audit History (Admin changes to credits or GPA status)
CREATE TABLE IF NOT EXISTS curriculum_audit_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  changed_by INT NOT NULL,
  old_credits INT NOT NULL,
  new_credits INT NOT NULL,
  old_is_gpa BOOLEAN NOT NULL,
  new_is_gpa BOOLEAN NOT NULL,
  reason VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES curriculum_subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
