import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-marketplace';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in serverless environments
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});
