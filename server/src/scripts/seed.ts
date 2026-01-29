import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/database';
import { User, UserRole } from '../models/User';
import { SolverProfile } from '../models/SolverProfile';

dotenv.config();

const SALT_ROUNDS = 10;

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await SolverProfile.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Admin
    console.log('Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@marketplace.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    });
    console.log(`✅ Admin created: ${admin.email} / admin123\n`);

    // Create Buyer
    console.log('Creating Buyer user...');
    const buyerPassword = await bcrypt.hash('buyer123', SALT_ROUNDS);
    const buyer = await User.create({
      name: 'Buyer User',
      email: 'buyer@marketplace.com',
      passwordHash: buyerPassword,
      role: UserRole.BUYER,
    });
    console.log(`✅ Buyer created: ${buyer.email} / buyer123\n`);

    // Create Solver
    console.log('Creating Solver user...');
    const solverPassword = await bcrypt.hash('solver123', SALT_ROUNDS);
    const solver = await User.create({
      name: 'Solver User',
      email: 'solver@marketplace.com',
      passwordHash: solverPassword,
      role: UserRole.SOLVER,
    });

    // Create Solver Profile
    await SolverProfile.create({
      userId: solver._id,
      displayName: 'Expert Problem Solver',
      bio: 'Full-stack developer with 5+ years of experience in MERN stack and cloud technologies.',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
      portfolioLinks: [
        'https://github.com/solver',
        'https://portfolio.solver.dev',
      ],
    });
    console.log(`✅ Solver created: ${solver.email} / solver123`);
    console.log('✅ Solver profile created\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeding completed!\n');
    console.log('Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:  admin@marketplace.com  / admin123');
    console.log('Buyer:  buyer@marketplace.com  / buyer123');
    console.log('Solver: solver@marketplace.com / solver123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
