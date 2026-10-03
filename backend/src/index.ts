import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 ShopScore Backend API listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`🔗 Health check available at http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
