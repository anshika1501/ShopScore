import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import storeRoutes from './routes/store.routes';
import ratingRoutes from './routes/rating.routes';
import ownerRoutes from './routes/owner.routes';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Request parsing with limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/owner', ownerRoutes);

  // 404 Handler
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('The requested endpoint was not found on this server'));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp();
