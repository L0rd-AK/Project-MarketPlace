import { Response } from 'express';
import mongoose from 'mongoose';
import { Project, ProjectStatus } from '../models/Project';
import { WorkRequest, WorkRequestStatus } from '../models/WorkRequest';
import { Task, TaskStatus } from '../models/Task';
import { Submission, BuyerDecision } from '../models/Submission';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createProjectSchema,
  assignSolverSchema,
  reviewSubmissionSchema,
} from '../validators/schemas';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description } = createProjectSchema.parse(req.body);

  const project = await Project.create({
    buyerId: req.userId,
    title,
    description,
    status: ProjectStatus.OPEN,
  });

  res.status(201).json({
    project: {
      id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
    },
  });
};

export const getBuyerProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const projects = await Project.find({ buyerId: req.userId })
    .populate('assignedSolverId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    projects: projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      assignedSolver: project.assignedSolverId,
      createdAt: project.createdAt,
    })),
  });
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    buyerId: req.userId,
  }).populate('assignedSolverId', 'name email');

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  res.json({
    project: {
      id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      assignedSolver: project.assignedSolverId,
      createdAt: project.createdAt,
    },
  });
};

export const getProjectRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Verify ownership
  const project = await Project.findOne({ _id: id, buyerId: req.userId });
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  const requests = await WorkRequest.find({ projectId: id })
    .populate('solverId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    requests: requests.map((request) => ({
      id: request._id,
      solver: request.solverId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
    })),
  });
};

export const assignSolver = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { workRequestId } = assignSolverSchema.parse(req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify project ownership
    const project = await Project.findOne({ _id: id, buyerId: req.userId }).session(session);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new AppError(400, 'Project is not open for assignment');
    }

    // Verify work request
    const workRequest = await WorkRequest.findOne({
      _id: workRequestId,
      projectId: id,
      status: WorkRequestStatus.PENDING,
    }).session(session);

    if (!workRequest) {
      throw new AppError(404, 'Work request not found or already processed');
    }

    // Assign solver to project
    project.status = ProjectStatus.ASSIGNED;
    project.assignedSolverId = workRequest.solverId;
    await project.save({ session });

    // Accept this request
    workRequest.status = WorkRequestStatus.ACCEPTED;
    await workRequest.save({ session });

    // Reject all other pending requests
    await WorkRequest.updateMany(
      {
        projectId: id,
        _id: { $ne: workRequestId },
        status: WorkRequestStatus.PENDING,
      },
      { status: WorkRequestStatus.REJECTED }
    ).session(session);

    await session.commitTransaction();

    const updatedProject = await Project.findById(id).populate('assignedSolverId', 'name email');

    res.json({
      project: {
        id: updatedProject!._id,
        title: updatedProject!.title,
        description: updatedProject!.description,
        status: updatedProject!.status,
        assignedSolver: updatedProject!.assignedSolverId,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getTaskSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId).populate('projectId');
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const project = task.projectId as any;
  if (project.buyerId.toString() !== req.userId) {
    throw new AppError(403, 'Not authorized to view this submission');
  }

  const submission = await Submission.findOne({ taskId }).populate('solverId', 'name email');
  if (!submission) {
    throw new AppError(404, 'Submission not found');
  }

  res.json({
    submission: {
      id: submission._id,
      taskId: submission.taskId,
      solver: submission.solverId,
      fileName: submission.originalFileName,
      sizeBytes: submission.sizeBytes,
      submittedAt: submission.submittedAt,
      buyerDecision: submission.buyerDecision,
      buyerFeedback: submission.buyerFeedback,
      decidedAt: submission.decidedAt,
      downloadUrl: `/api/buyer/submissions/${submission._id}/download`,
    },
  });
};

export const reviewSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { decision, feedback } = reviewSubmissionSchema.parse(req.body);

  const task = await Task.findById(taskId).populate('projectId');
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const project = task.projectId as any;
  if (project.buyerId.toString() !== req.userId) {
    throw new AppError(403, 'Not authorized to review this task');
  }

  if (task.status !== TaskStatus.SUBMITTED) {
    throw new AppError(400, 'Task is not in submitted state');
  }

  const submission = await Submission.findOne({ taskId });
  if (!submission) {
    throw new AppError(404, 'Submission not found');
  }

  if (submission.buyerDecision !== BuyerDecision.PENDING) {
    throw new AppError(400, 'Submission already reviewed');
  }

  // Update submission
  submission.buyerDecision = decision === 'ACCEPT' ? BuyerDecision.ACCEPTED : BuyerDecision.REJECTED;
  submission.buyerFeedback = feedback;
  submission.decidedAt = new Date();
  await submission.save();

  // Update task status
  task.status = decision === 'ACCEPT' ? TaskStatus.COMPLETED : TaskStatus.REJECTED;
  await task.save();

  res.json({
    task: {
      id: task._id,
      title: task.title,
      status: task.status,
    },
    submission: {
      id: submission._id,
      buyerDecision: submission.buyerDecision,
      buyerFeedback: submission.buyerFeedback,
      decidedAt: submission.decidedAt,
    },
  });
};
