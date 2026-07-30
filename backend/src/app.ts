import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/logger';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import authRoutes from './routes/auth.routes';
import examRoutes from './routes/exam.routes';
import examSessionRoutes from './routes/examSession.routes';
import sessionRoutes from './routes/session.routes';
import sessionCandidatesRoutes from './routes/sessionCandidates.routes';
import candidateRoutes from './routes/candidate.routes';
import seatRoutes from './routes/seat.routes';
import sessionAssignmentsRoutes from './routes/sessionAssignments.routes';
import initialAllocationRoutes from './routes/initialAllocation.routes';
import seatMapRoutes from './routes/seatMap.routes';
import assignmentRoutes from './routes/assignment.routes';
import historyRoutes from './routes/history.routes';
import dashboardRoutes from './routes/dashboard.routes';
import complaintRoutes from './routes/complaint.routes';

const app: Application = express();

// ─── Core Middleware ───────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: true, // Should be configured properly in production
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Stricter limit for auth routes
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use(
  morgan('short', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// ─── Health Check ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Health check OK',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exams/:examId/sessions', examSessionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions/:sessionId/candidates', sessionCandidatesRoutes);
app.use('/api/sessions/:sessionId/assignments', sessionAssignmentsRoutes);
app.use('/api/sessions/:sessionId/initial-allocation', initialAllocationRoutes);
app.use('/api/sessions/:sessionId/seat-map', seatMapRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/admin/history', historyRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/complaints', complaintRoutes);

// ─── 404 & Global Error Handling ───────────────────────────────────────────────

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
// Trigger restart
