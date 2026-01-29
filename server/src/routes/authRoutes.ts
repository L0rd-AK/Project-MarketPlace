import express from 'express';
import { authenticate } from '../middleware/auth';
import { register, login, logout, getMe } from '../controllers/authController';

const router = express.Router();

// Wrap async handlers to catch errors
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;
