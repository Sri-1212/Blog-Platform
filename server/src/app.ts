import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiError } from './utils/ApiError';

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: [config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API v1 routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404 routes
app.use((_req: Request, _res: Response, next) => {
  next(ApiError.notFound('Route not found'));
});

// Centralized error handler
app.use(errorHandler);

export default app;
