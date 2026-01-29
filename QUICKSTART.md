# Quick Start Guide

Get the Project Marketplace running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)
- Git installed

## Setup Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment

**Server**: Copy `server/.env.example` to `server/.env`
```bash
cd server
cp .env.example .env
```

**Client**: Copy `client/.env.example` to `client/.env`
```bash
cd ../client
cp .env.example .env
cd ..
```

### 3. Seed Database (Creates Test Users)
```bash
npm run seed
```

✅ **Test accounts created:**
- **Admin**: admin@marketplace.com / admin123
- **Buyer**: buyer@marketplace.com / buyer123  
- **Solver**: solver@marketplace.com / solver123

### 4. Start Development
```bash
npm run dev
```

🎉 **Application running:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Test the Complete Workflow

### Step 1: Admin assigns Buyer role
1. Login at http://localhost:5173/login with `admin@marketplace.com` / `admin123`
2. See all users in the dashboard
3. Find a SOLVER user and click "Make Buyer" button
4. User role updated to BUYER

### Step 2: Buyer creates project
1. Logout and login with `buyer@marketplace.com` / `buyer123`
2. Click "+ New Project" button
3. Enter:
   - Title: "Build E-commerce Website"
   - Description: "Need a full-stack e-commerce site with cart and payment"
4. Click "Create Project"
5. Project created with status OPEN

### Step 3: Solver requests project
1. Logout and login with `solver@marketplace.com` / `solver123`
2. Complete profile if prompted (add skills, bio)
3. See available projects
4. Click "Request to Work" on the project
5. Request sent to buyer

### Step 4: Buyer assigns solver
1. Logout and login as buyer
2. Click on the project
3. See work requests list
4. Click "Assign" button on a request
5. **Watch the animated lifecycle stepper transition to ASSIGNED!**

### Step 5: Solver creates tasks
1. Logout and login as solver
2. Click on the assigned project (now in "Your Assigned Projects")
3. Click "+ New Task"
4. Create a task:
   - Title: "User Authentication Module"
   - Description: "Implement JWT auth with login/register"
   - Deadline: Select a future date
5. Task created with IN_PROGRESS status

### Step 6: Solver submits work
1. Create a test ZIP file (any content)
2. In the task card, click "Choose File" under "Submit Deliverable"
3. Select your ZIP file
4. **Watch the upload progress bar animate!**
5. Task status animates to SUBMITTED

### Step 7: Buyer reviews submission
1. Logout and login as buyer
2. View the project (tasks are visible)
3. See submitted tasks
4. Click "Accept" or "Reject" with optional feedback
5. **Watch task status animate to COMPLETED!**

## Common Issues

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod
```

Or update `server/.env` with MongoDB Atlas connection string.

### Port Already in Use
If port 5000 or 5173 is in use, update in:
- `server/.env` → `PORT=5001`
- `client/vite.config.ts` → `server.port: 5174`

### CORS Error
Ensure `CLIENT_URL` in `server/.env` matches your frontend URL.

## Project Structure

```
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (Node + TypeScript)
├── README.md        # Full documentation
└── QUICKSTART.md    # This file
```

## What's Next?

- Read the full [README.md](./README.md) for architecture details
- Explore API documentation in README
- Try creating multiple tasks and projects
- Test the complete workflow end-to-end
- Deploy to production (see README deployment section)

## Getting Help

- Check `README.md` for detailed documentation
- Review `server/src/` for backend code
- Review `client/src/` for frontend code
- Open an issue for bugs or questions

**Happy coding! 🚀**
