import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createProject,
  getBuyerProjects,
  getProjectById,
  getProjectRequests,
  assignSolver,
  getTaskSubmission,
  reviewSubmission,
} from '../controllers/buyerController';

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All buyer routes require BUYER role
router.use(authenticate, requireRole(UserRole.BUYER));

router.post('/projects', asyncHandler(createProject));
router.get('/projects', asyncHandler(getBuyerProjects));
router.get('/projects/:id', asyncHandler(getProjectById));
router.get('/projects/:id/requests', asyncHandler(getProjectRequests));
router.post('/projects/:id/assign-solver', asyncHandler(assignSolver));
router.get('/tasks/:taskId/submission', asyncHandler(getTaskSubmission));
router.post('/tasks/:taskId/review', asyncHandler(reviewSubmission));

export default router;
