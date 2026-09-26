import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const seedAdmin = async (
  email = process.env.ADMIN_EMAIL || 'admin@ms.sab.ac.lk',
  password = process.env.ADMIN_PASSWORD || 'AdminPass123!@#',
  name = process.env.ADMIN_NAME || 'System Administrator'
) => {
  console.log(`[Admin Seed] Creating or updating administrator account for: ${email}`);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const [existing] = await pool.query('SELECT id, role FROM users WHERE university_email = ?', [email]);

  if (existing.length > 0) {
    await pool.query(
      `UPDATE users 
       SET full_name = ?, password_hash = ?, role = 'admin', is_verified = TRUE 
       WHERE university_email = ?`,
      [name, passwordHash, email]
    );
    console.log(`[Admin Seed] Existing user '${email}' successfully updated to admin role.`);
  } else {
    await pool.query(
      `INSERT INTO users 
       (full_name, university_email, student_reg_no, password_hash, role, is_verified) 
       VALUES (?, ?, NULL, ?, 'admin', TRUE)`,
      [name, email, passwordHash]
    );
    console.log(`[Admin Seed] Administrator account '${email}' created successfully.`);
  }

  return { email, name };
};

// If run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedAdmin()
    .then((res) => {
      console.log(`[Admin Seed] Done! Login email: ${res.email}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Admin Seed] Error:', err);
      process.exit(1);
    });
}
