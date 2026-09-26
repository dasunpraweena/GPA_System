import app from './app.js';
import { config } from './config/env.js';
import { testConnection } from './config/db.js';

const startServer = async () => {
  // Test MySQL DB connection
  await testConnection();

  app.listen(config.port, () => {
    console.log(`[Server] GPA System Backend running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
