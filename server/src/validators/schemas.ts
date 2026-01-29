import { z } from 'zod';
import { UserRole } from '../models/User';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const createWorkRequestSchema = z.object({
  message: z.string().optional(),
});

export const assignSolverSchema = z.object({
  workRequestId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid work request ID'),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
});

export const reviewSubmissionSchema = z.object({
  decision: z.enum(['ACCEPT', 'REJECT']),
  feedback: z.string().optional(),
});

export const createSolverProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().optional().default(''),
  skills: z.array(z.string()).optional().default([]),
  portfolioLinks: z.array(z.string().url()).optional().default([]),
});

export const updateSolverProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  portfolioLinks: z.array(z.string().url()).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([UserRole.BUYER]), // Only allow setting BUYER per spec
});
