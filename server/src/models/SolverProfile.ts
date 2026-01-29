import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISolverProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  skills: string[];
  portfolioLinks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const solverProfileSchema = new Schema<ISolverProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for userId lookups
solverProfileSchema.index({ userId: 1 });

export const SolverProfile = mongoose.model<ISolverProfile>('SolverProfile', solverProfileSchema);
