export enum UserRole {
  ADMIN = 'ADMIN',
  BUYER = 'BUYER',
  SOLVER = 'SOLVER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum ProjectStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  assignedSolver?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export enum WorkRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface WorkRequest {
  id: string;
  projectId?: string;
  solver: {
    id: string;
    name: string;
    email: string;
  };
  message: string;
  status: WorkRequestStatus;
  createdAt: string;
}

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
}

export enum BuyerDecision {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Submission {
  id: string;
  taskId: string;
  solver?: {
    id: string;
    name: string;
    email: string;
  };
  fileName: string;
  sizeBytes: number;
  submittedAt: string;
  buyerDecision: BuyerDecision;
  buyerFeedback?: string;
  decidedAt?: string;
  downloadUrl?: string;
}

export interface SolverProfile {
  id: string;
  displayName: string;
  bio: string;
  skills: string[];
  portfolioLinks: string[];
}
