import mongoose, { Document, Schema, Types } from 'mongoose';

export enum WorkRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface IWorkRequest extends Document {
  projectId: Types.ObjectId;
  solverId: Types.ObjectId;
  message: string;
  status: WorkRequestStatus;
  createdAt: Date;
}

const workRequestSchema = new Schema<IWorkRequest>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    solverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(WorkRequestStatus),
      default: WorkRequestStatus.PENDING,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index: one request per solver per project
workRequestSchema.index({ projectId: 1, solverId: 1 }, { unique: true });
workRequestSchema.index({ projectId: 1 });
workRequestSchema.index({ solverId: 1 });

export const WorkRequest = mongoose.model<IWorkRequest>('WorkRequest', workRequestSchema);
