import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { parseCurriculumData } from './curriculumData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  console.log('[Migration] Running database schema migration...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema DDL
  const connection = await pool.getConnection();
  try {
    await connection.query(sql);
    console.log('[Migration] Tables created / verified successfully.');

    // Seed curriculum if empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM curriculum_subjects');
    if (rows[0].count === 0) {
      console.log('[Migration] Seeding initial curriculum subjects...');
      const subjects = parseCurriculumData();
      for (const s of subjects) {
        await connection.query(
          `INSERT INTO curriculum_subjects 
           (year_no, semester_no, subject_code, subject_name, credits, is_gpa, is_elective, default_included)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.year_no, s.semester_no, s.subject_code, s.subject_name, s.credits, s.is_gpa, s.is_elective, s.default_included]
        );
      }
      console.log(`[Migration] Successfully seeded ${subjects.length} curriculum subjects.`);
    } else {
      console.log(`[Migration] Curriculum subjects already exist (${rows[0].count} subjects).`);
    }
  } finally {
    connection.release();
  }
};

// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}
