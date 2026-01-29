import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ProjectStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
}

export interface IProject extends Document {
  buyerId: Types.ObjectId;
  title: string;
  description: string;
  status: ProjectStatus;
  assignedSolverId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    buyerId: {
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
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.OPEN,
    },
    assignedSolverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
projectSchema.index({ buyerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ assignedSolverId: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
