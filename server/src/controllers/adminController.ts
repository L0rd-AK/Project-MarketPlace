import { Response } from 'express';
import { User, UserRole } from '../models/User';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { updateUserRoleSchema } from '../validators/schemas';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

  res.json({
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = updateUserRoleSchema.parse(req.body);

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Prevent changing admin role
  if (user.role === UserRole.ADMIN) {
    throw new AppError(403, 'Cannot change admin role');
  }

  user.role = role;
  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const projects = await Project.find()
    .populate('buyerId', 'name email')
    .populate('assignedSolverId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    projects: projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      buyer: project.buyerId,
      assignedSolver: project.assignedSolverId,
      createdAt: project.createdAt,
    })),
  });
};
