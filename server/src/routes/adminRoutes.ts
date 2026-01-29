import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import { getAllUsers, updateUserRole, getAllProjects } from '../controllers/adminController';

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All admin routes require ADMIN role
router.use(authenticate, requireRole(UserRole.ADMIN));

router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:id/role', asyncHandler(updateUserRole));
router.get('/projects', asyncHandler(getAllProjects));

export default router;
