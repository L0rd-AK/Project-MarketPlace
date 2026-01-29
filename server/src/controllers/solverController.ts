import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { SolverProfile } from '../models/SolverProfile';
import { Project, ProjectStatus } from '../models/Project';
import { WorkRequest, WorkRequestStatus } from '../models/WorkRequest';
import { Task, TaskStatus } from '../models/Task';
import { Submission, BuyerDecision } from '../models/Submission';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createSolverProfileSchema,
  updateSolverProfileSchema,
  createWorkRequestSchema,
  createTaskSchema,
  updateTaskSchema,
} from '../validators/schemas';

export const getSolverProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await SolverProfile.findOne({ userId: req.userId });

  if (!profile) {
    res.status(404).json({ profile: null });
    return;
  }

  res.json({
    profile: {
      id: profile._id,
      displayName: profile.displayName,
      bio: profile.bio,
      skills: profile.skills,
      portfolioLinks: profile.portfolioLinks,
    },
  });
};

export const createSolverProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = createSolverProfileSchema.parse(req.body);

  const existing = await SolverProfile.findOne({ userId: req.userId });
  if (existing) {
    throw new AppError(409, 'Profile already exists');
  }

  const profile = await SolverProfile.create({
    userId: req.userId,
    ...data,
  });

  res.status(201).json({
    profile: {
      id: profile._id,
      displayName: profile.displayName,
      bio: profile.bio,
      skills: profile.skills,
      portfolioLinks: profile.portfolioLinks,
    },
  });
};

export const updateSolverProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateSolverProfileSchema.parse(req.body);

  const profile = await SolverProfile.findOneAndUpdate(
    { userId: req.userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }

  res.json({
    profile: {
      id: profile._id,
      displayName: profile.displayName,
      bio: profile.bio,
      skills: profile.skills,
      portfolioLinks: profile.portfolioLinks,
    },
  });
};

export const getAvailableProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const projects = await Project.find({ status: ProjectStatus.OPEN })
    .populate('buyerId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    projects: projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      buyer: project.buyerId,
      createdAt: project.createdAt,
    })),
  });
};

export const requestProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { message } = createWorkRequestSchema.parse(req.body);

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (project.status !== ProjectStatus.OPEN) {
    throw new AppError(400, 'Project is not open for requests');
  }

  const workRequest = await WorkRequest.create({
    projectId: id,
    solverId: req.userId,
    message: message || '',
    status: WorkRequestStatus.PENDING,
  });

  res.status(201).json({
    request: {
      id: workRequest._id,
      projectId: workRequest.projectId,
      message: workRequest.message,
      status: workRequest.status,
      createdAt: workRequest.createdAt,
    },
  });
};

export const getAssignedProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const projects = await Project.find({
    assignedSolverId: req.userId,
    status: ProjectStatus.ASSIGNED,
  })
    .populate('buyerId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    projects: projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      buyer: project.buyerId,
      status: project.status,
      createdAt: project.createdAt,
    })),
  });
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, deadline } = createTaskSchema.parse(req.body);

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (project.assignedSolverId?.toString() !== req.userId) {
    throw new AppError(403, 'Not authorized to create tasks for this project');
  }

  const task = await Task.create({
    projectId: id,
    createdBySolverId: req.userId,
    title,
    description,
    deadline: new Date(deadline),
    status: TaskStatus.IN_PROGRESS,
  });

  res.status(201).json({
    task: {
      id: task._id,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      createdAt: task.createdAt,
    },
  });
};

export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (project.assignedSolverId?.toString() !== req.userId) {
    throw new AppError(403, 'Not authorized to view tasks for this project');
  }

  const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 });

  res.json({
    tasks: tasks.map((task) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      createdAt: task.createdAt,
    })),
  });
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const updates = updateTaskSchema.parse(req.body);

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.createdBySolverId.toString() !== req.userId) {
    throw new AppError(403, 'Not authorized to update this task');
  }

  if (task.status !== TaskStatus.IN_PROGRESS) {
    throw new AppError(400, 'Can only update tasks in IN_PROGRESS status');
  }

  if (updates.title) task.title = updates.title;
  if (updates.description) task.description = updates.description;
  if (updates.deadline) task.deadline = new Date(updates.deadline);

  await task.save();

  res.json({
    task: {
      id: task._id,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
    },
  });
};

export const submitTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;

  if (!req.file) {
    throw new AppError(400, 'ZIP file is required');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    throw new AppError(404, 'Task not found');
  }

  if (task.createdBySolverId.toString() !== req.userId) {
    fs.unlinkSync(req.file.path);
    throw new AppError(403, 'Not authorized to submit for this task');
  }

  if (task.status !== TaskStatus.IN_PROGRESS) {
    fs.unlinkSync(req.file.path);
    throw new AppError(400, 'Task is not in IN_PROGRESS status');
  }

  // Check if submission already exists
  const existingSubmission = await Submission.findOne({ taskId });
  if (existingSubmission) {
    fs.unlinkSync(req.file.path);
    throw new AppError(409, 'Submission already exists for this task');
  }

  // Validate file extension (additional security)
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.zip') {
    fs.unlinkSync(req.file.path);
    throw new AppError(400, 'Only ZIP files are allowed');
  }

  const submission = await Submission.create({
    taskId,
    solverId: req.userId,
    zipPath: req.file.path,
    originalFileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    buyerDecision: BuyerDecision.PENDING,
  });

  // Update task status
  task.status = TaskStatus.SUBMITTED;
  await task.save();

  res.status(201).json({
    submission: {
      id: submission._id,
      taskId: submission.taskId,
      fileName: submission.originalFileName,
      sizeBytes: submission.sizeBytes,
      submittedAt: submission.submittedAt,
    },
    task: {
      id: task._id,
      status: task.status,
    },
  });
};
