import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gpa_system_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
};
