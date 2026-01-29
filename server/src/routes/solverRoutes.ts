import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import { upload } from '../middleware/upload';
import {
  getSolverProfile,
  createSolverProfile,
  updateSolverProfile,
  getAvailableProjects,
  requestProject,
  getAssignedProjects,
  createTask,
  getProjectTasks,
  updateTask,
  submitTask,
} from '../controllers/solverController';

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All solver routes require SOLVER role
router.use(authenticate, requireRole(UserRole.SOLVER));

router.get('/profile', asyncHandler(getSolverProfile));
router.post('/profile', asyncHandler(createSolverProfile));
router.patch('/profile', asyncHandler(updateSolverProfile));

router.get('/projects', asyncHandler(getAvailableProjects));
router.post('/projects/:id/request', asyncHandler(requestProject));

router.get('/assigned-projects', asyncHandler(getAssignedProjects));
router.post('/projects/:id/tasks', asyncHandler(createTask));
router.get('/projects/:id/tasks', asyncHandler(getProjectTasks));
router.patch('/tasks/:taskId', asyncHandler(updateTask));
router.post('/tasks/:taskId/submit', upload.single('file'), asyncHandler(submitTask));

export default router;
