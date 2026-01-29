import mongoose, { Document, Schema, Types } from 'mongoose';

export enum BuyerDecision {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface ISubmission extends Document {
  taskId: Types.ObjectId;
  solverId: Types.ObjectId;
  zipPath: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  submittedAt: Date;
  buyerDecision: BuyerDecision;
  buyerFeedback?: string;
  decidedAt?: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      unique: true, // One submission per task
    },
    solverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    zipPath: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    buyerDecision: {
      type: String,
      enum: Object.values(BuyerDecision),
      default: BuyerDecision.PENDING,
    },
    buyerFeedback: {
      type: String,
    },
    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

// Index for task lookups
submissionSchema.index({ taskId: 1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
