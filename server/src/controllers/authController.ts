import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { registerSchema, loginSchema } from '../validators/schemas';

const SALT_ROUNDS = 10;

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId }, 
    process.env.JWT_ACCESS_SECRET as string, 
    { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any }
  );
  
  const refreshToken = jwt.sign(
    { userId }, 
    process.env.JWT_REFRESH_SECRET as string, 
    { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-passwordHash');
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
