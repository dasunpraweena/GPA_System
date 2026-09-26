import mysql from 'mysql2/promise';
import { config } from './env.js';

// Create MySQL connection pool
const pool = mysql.createPool(config.db);

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${config.db.database}`);
    connection.release();
  } catch (error) {
    console.error('[Database] MySQL connection error:', error.message);
  }
};

export default pool;
