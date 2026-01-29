import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface ITask extends Document {
  projectId: Types.ObjectId;
  createdBySolverId: Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    createdBySolverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.IN_PROGRESS,
    },
  },
  {
    timestamps: true,
  }
);

// Index for project lookups
taskSchema.index({ projectId: 1 });
taskSchema.index({ createdBySolverId: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
