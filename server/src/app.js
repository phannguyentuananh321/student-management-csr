import express from 'express';
import cors from 'cors';
import { defaultStudentRouter } from './routes/students.js';

export function createApp(studentRouter = defaultStudentRouter) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/students', studentRouter);

  // 404 Handler cho các route khác
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Đường dẫn không tồn tại.'
    });
  });

  return app;
}

export const defaultApp = createApp();
