import { Router } from 'express';
import { defaultStudentController } from '../controllers/studentController.js';

export function createStudentRouter(controller = defaultStudentController) {
  const router = Router();

  router.get('/', (req, res) => controller.getStudents(req, res));
  router.post('/', (req, res) => controller.createStudent(req, res));

  return router;
}

export const defaultStudentRouter = createStudentRouter();
