import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection with caching
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Import routes dynamically to avoid issues
let routesLoaded = false;

async function loadRoutes() {
  if (routesLoaded) return;

  try {
    const authRoutes = await import('../src/routes/authRoutes');
    const adminRoutes = await import('../src/routes/adminRoutes');
    const buyerRoutes = await import('../src/routes/buyerRoutes');
    const solverRoutes = await import('../src/routes/solverRoutes');

    app.use('/api/auth', authRoutes.default);
    app.use('/api/admin', adminRoutes.default);
    app.use('/api/buyer', buyerRoutes.default);
    app.use('/api/solver', solverRoutes.default);

    routesLoaded = true;
  } catch (error) {
    console.error('Error loading routes:', error);
    throw error;
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'ROCO AI API is running', status: 'ok' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Serverless handler for Vercel
export default async (req: Request, res: Response) => {
  try {
    // Initialize database
    await connectToDatabase();
    
    // Load routes
    await loadRoutes();
    
    // Handle request
    return app(req, res);
  } catch (error: any) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};
