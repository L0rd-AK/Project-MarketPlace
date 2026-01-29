# Project Marketplace Workflow System

A production-quality, role-based project marketplace built with the MERN stack, featuring state-driven workflows, JWT authentication, file uploads, and intentional animations.

---

## 🎯 Overview

This system enables **Buyers** to create projects and **Problem Solvers** to request, get assigned to, and complete those projects through a structured task-based workflow. **Admins** manage user roles and monitor the platform.

### Core Features

- **Role-Based Access Control (RBAC)**: Admin, Buyer, Solver roles with distinct capabilities
- **Project Lifecycle Management**: State-driven transitions (OPEN → ASSIGNED)
- **Task Management**: Solvers create sub-module tasks with deadlines
- **File Upload System**: Secure ZIP-only submission with validation
- **Real-time Animations**: Framer Motion-powered state transitions
- **JWT Authentication**: Access + refresh tokens in httpOnly cookies

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- React Router (navigation)
- TanStack Query (data fetching/caching)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Axios (HTTP client)

**Backend:**
- Node.js + Express + TypeScript
- MongoDB + Mongoose (ODM)
- JWT (jsonwebtoken)
- Multer (file uploads)
- Bcrypt (password hashing)
- Zod (validation)

### Project Structure

```
project-marketplace-workflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API client and utilities
│   │   ├── pages/         # Route components
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling, upload
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Seed script
│   │   ├── validators/    # Zod schemas
│   │   └── server.ts      # Entry point
│   ├── uploads/           # File storage (gitignored)
│   └── package.json
│
└── package.json           # Root package (concurrent dev)
```

---

## 👥 Role Hierarchy & Capabilities

### Admin
- Assign BUYER role to users
- View all users and their roles
- View all projects (read-only monitoring)
- **Cannot** create projects or execute work

### Buyer
- Create projects with title/description
- View incoming work requests from solvers
- Assign exactly ONE solver to a project
- Review task submissions (accept/reject)
- Provide feedback on submissions

### Problem Solver (Solver)
- Create/manage a profile (skills, bio, portfolio)
- Browse OPEN projects
- Request to work on projects
- Once assigned:
  - Create multiple sub-module tasks
  - Set task metadata (title, description, deadline)
  - Submit ZIP deliverables per task
  - Track task status (IN_PROGRESS → SUBMITTED → COMPLETED/REJECTED)

---

## 🔄 Workflow & State Transitions

### Project Lifecycle

```
┌─────────┐     Buyer assigns     ┌──────────┐
│  OPEN   │────────solver────────▶│ ASSIGNED │
└─────────┘                        └──────────┘
    ↑
    │ Buyer creates
    │
  Buyer
```

**States:**
- **OPEN**: Project awaiting solver selection; accepts work requests
- **ASSIGNED**: Solver selected; work in progress

**Transitions enforced on backend:**
1. Buyer creates project → status = OPEN
2. Buyer accepts ONE work request → status = ASSIGNED, all other requests rejected
3. Project cannot revert to OPEN (per spec)

### Task Lifecycle

```
┌──────────────┐    Solver submits    ┌───────────┐
│ IN_PROGRESS  │──────────ZIP────────▶│ SUBMITTED │
└──────────────┘                       └───────────┘
                                            │
                    ┌───────────────────────┴────────────────────┐
                    │                                            │
              Buyer accepts                                Buyer rejects
                    │                                            │
                    ▼                                            ▼
              ┌───────────┐                                ┌──────────┐
              │ COMPLETED │                                │ REJECTED │
              └───────────┘                                └──────────┘
```

**States:**
- **IN_PROGRESS**: Task created, solver working
- **SUBMITTED**: ZIP uploaded, awaiting buyer review
- **COMPLETED**: Buyer accepted submission
- **REJECTED**: Buyer rejected submission (can include feedback)

**Business Rules:**
- Only assigned solver can create tasks for their project
- Only IN_PROGRESS tasks can be submitted
- Submission creates immutable record (one per task)
- Buyer can only review SUBMITTED tasks

---

## 📊 Domain Model (MongoDB)

### Collections

**User**
```typescript
{
  _id: ObjectId
  name: String
  email: String (unique, indexed)
  passwordHash: String
  role: "ADMIN" | "BUYER" | "SOLVER"
  createdAt: Date
  updatedAt: Date
}
```

**SolverProfile**
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User, unique)
  displayName: String
  bio: String
  skills: [String]
  portfolioLinks: [String]
  createdAt: Date
  updatedAt: Date
}
```

**Project**
```typescript
{
  _id: ObjectId
  buyerId: ObjectId (ref: User, indexed)
  title: String
  description: String
  status: "OPEN" | "ASSIGNED" (indexed)
  assignedSolverId: ObjectId (ref: User, nullable, indexed)
  createdAt: Date
  updatedAt: Date
}
```

**WorkRequest**
```typescript
{
  _id: ObjectId
  projectId: ObjectId (ref: Project)
  solverId: ObjectId (ref: User)
  message: String
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: Date
  
  // Unique index: (projectId, solverId)
}
```

**Task**
```typescript
{
  _id: ObjectId
  projectId: ObjectId (ref: Project, indexed)
  createdBySolverId: ObjectId (ref: User)
  title: String
  description: String
  deadline: Date
  status: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}
```

**Submission**
```typescript
{
  _id: ObjectId
  taskId: ObjectId (ref: Task, unique)
  solverId: ObjectId (ref: User)
  zipPath: String
  originalFileName: String
  mimeType: String
  sizeBytes: Number
  submittedAt: Date
  buyerDecision: "PENDING" | "ACCEPTED" | "REJECTED"
  buyerFeedback: String (optional)
  decidedAt: Date (optional)
}
```

---

## 🔐 Security & Validation

### Authentication
- **JWT Access Token**: 15-minute expiry, httpOnly cookie
- **JWT Refresh Token**: 7-day expiry, httpOnly cookie
- Passwords hashed with bcrypt (10 salt rounds)
- Middleware validates tokens on protected routes

### File Upload Security
- **Validation**:
  - Only `.zip` extension allowed
  - MIME type checked (application/zip variants)
  - Max size: 25MB
  - Unique server-side filename generated
- **Storage**: Disk storage with safe path resolution
- **Never trust client filename**: Use crypto-random names

### Authorization
- Role-based middleware (`requireRole`)
- Ownership checks (e.g., buyer can only review their project's tasks)
- State validation (e.g., can't submit already-submitted task)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd project-marketplace-workflow
```

### 2. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for root, server, and client.

### 3. Configure Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/project-marketplace

JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE=26214400
UPLOAD_DIR=./uploads
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Seed Database

```bash
npm run seed
```

**Test Credentials Created:**
- Admin: `admin@marketplace.com` / `admin123`
- Buyer: `buyer@marketplace.com` / `buyer123`
- Solver: `solver@marketplace.com` / `solver123`

### 5. Start Development Servers

```bash
npm run dev
```

This runs both backend (port 5000) and frontend (port 5173) concurrently.

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 📡 API Routes

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (default role: SOLVER) |
| POST | `/login` | Login with email/password |
| POST | `/logout` | Logout and clear cookies |
| GET | `/me` | Get current user info |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| PATCH | `/users/:id/role` | Assign BUYER role to user |
| GET | `/projects` | List all projects |

### Buyer (`/api/buyer`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create a new project |
| GET | `/projects` | List buyer's projects |
| GET | `/projects/:id` | Get project details |
| GET | `/projects/:id/requests` | List work requests for project |
| POST | `/projects/:id/assign-solver` | Assign solver (body: `{workRequestId}`) |
| GET | `/tasks/:taskId/submission` | Get task submission details |
| POST | `/tasks/:taskId/review` | Review submission (body: `{decision, feedback?}`) |

### Solver (`/api/solver`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get solver profile |
| POST | `/profile` | Create solver profile |
| PATCH | `/profile` | Update solver profile |
| GET | `/projects` | Browse OPEN projects |
| POST | `/projects/:id/request` | Request to work on project |
| GET | `/assigned-projects` | List assigned projects |
| POST | `/projects/:id/tasks` | Create task for project |
| GET | `/projects/:id/tasks` | List project tasks |
| PATCH | `/tasks/:taskId` | Update task metadata (IN_PROGRESS only) |
| POST | `/tasks/:taskId/submit` | Submit ZIP (multipart/form-data) |

---

## 🎨 Animations & UX

### Implemented Animations (Framer Motion)

**LifecycleStepper Component** (Project states):
- Visual stepper showing OPEN → ASSIGNED progression
- Animated progress line between steps
- Active step pulse animation
- Checkmark reveal on completed steps

**TaskStatusTimeline Component** (Task states):
- Color-coded status badges
- Icon animations:
  - IN_PROGRESS: Rotating/pulsing icon
  - SUBMITTED: Upward motion
  - COMPLETED: Checkmark with scale
  - REJECTED: Shake effect
- Smooth transitions between states

**Micro-interactions:**
- Button hover states with scale transforms
- Card hover elevation changes
- Loading spinners during data fetches
- Upload progress bars with animated width
- Toast notifications for actions

### Animation Principles Applied
1. **Explain State**: Animations clarify system transitions (not decoration)
2. **Smooth Transitions**: Ease-in-out curves for natural motion
3. **Progressive Enhancement**: Animations enhance, don't block
4. **Performance**: GPU-accelerated transforms (translate, scale, opacity)

---

## 🧪 Testing the Workflow

### Recommended Test Flow

1. **Admin assigns Buyer role**:
   - Login as `admin@marketplace.com`
   - Navigate to Admin Dashboard
   - Find a SOLVER user and click "Make Buyer"

2. **Buyer creates project**:
   - Logout and login as `buyer@marketplace.com`
   - Click "New Project"
   - Fill in title/description
   - Submit

3. **Solver requests project**:
   - Logout and login as `solver@marketplace.com`
   - Create profile (if not exists)
   - Browse available projects
   - Click "Request to Work"

4. **Buyer assigns solver**:
   - Login as Buyer
   - Open project detail
   - View work requests
   - Click "Assign" on a request
   - Watch lifecycle stepper animate to ASSIGNED

5. **Solver creates tasks**:
   - Login as Solver
   - Open assigned project
   - Click "New Task"
   - Create multiple tasks with deadlines

6. **Solver submits work**:
   - Prepare a ZIP file
   - Upload for a task in IN_PROGRESS
   - Watch upload progress bar
   - See task status animate to SUBMITTED

7. **Buyer reviews submission**:
   - Login as Buyer
   - Open project (tasks visible)
   - Review submission
   - Accept or Reject with feedback
   - See task status update to COMPLETED/REJECTED

---

## 🏛️ Architectural Decisions

### 1. State Transitions on Backend
**Why**: Prevent frontend manipulation; ensure data consistency.

All state changes (project assignment, task submission, review) are validated and enforced server-side with strict business rules.

### 2. MongoDB Session for Assignment
**Why**: Atomic operation when assigning solver.

When a buyer accepts a work request, a MongoDB transaction ensures:
- Project status updated
- Request accepted
- All other requests rejected
- No partial state if error occurs

### 3. JWT in httpOnly Cookies
**Why**: Prevent XSS attacks; improve security.

Tokens stored in httpOnly cookies cannot be accessed by JavaScript, mitigating common attack vectors.

### 4. Multer with Disk Storage
**Why**: Simple, debuggable, sufficient for dev/small scale.

For production at scale, consider cloud storage (S3, GCS) with presigned URLs.

### 5. React Query for State Management
**Why**: Built-in caching, loading states, automatic refetching.

Eliminates boilerplate for data fetching and keeps server state synchronized across components.

### 6. Zod for Validation
**Why**: Type-safe validation shared between client/server.

Single source of truth for data schemas, reducing errors and duplication.

---

## 📦 Deployment

### Backend (Render/Railway/Fly.io)

1. Create new web service
2. Set environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (strong random strings)
   - `CLIENT_URL` (deployed frontend URL)
   - `NODE_ENV=production`
3. Build command: `cd server && npm install && npm run build`
4. Start command: `cd server && npm start`

### Frontend (Vercel/Netlify)

1. Create new site from repo
2. Set build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/dist`
3. Set environment variable:
   - `VITE_API_URL` (deployed backend URL)

### MongoDB (Atlas)

1. Create free cluster
2. Whitelist deployment server IPs (or allow all for testing)
3. Create database user
4. Get connection string and update `MONGODB_URI`

### Important Production Settings

**CORS**: Update `CLIENT_URL` in backend `.env` to match frontend domain.

**Cookies**: Set `sameSite: 'none'` and `secure: true` for cross-domain cookies in production (already handled in code via `NODE_ENV` check).

**File Storage**: Consider cloud storage for uploads in production (S3, Cloudinary).

---

## 🔍 Troubleshooting

### "Authentication required" on all requests
- Check cookies are enabled in browser
- Verify `CLIENT_URL` matches frontend origin
- Check CORS settings

### File upload fails
- Ensure file is .zip format
- Check file size < 25MB
- Verify `uploads/` directory exists and is writable

### MongoDB connection error
- Check MongoDB is running (local) or connection string is correct (Atlas)
- Verify network access in Atlas

### Animations not working
- Check browser supports CSS transforms
- Verify Framer Motion is installed
- Clear browser cache

---

## 📝 Future Enhancements

- **Real-time Updates**: WebSocket for live notifications
- **Advanced Search**: Filter projects by tags, skills
- **Messaging System**: Direct communication between buyer/solver
- **Payment Integration**: Escrow system for project payments
- **Rating System**: Feedback and ratings for solvers
- **Cloud Storage**: S3/GCS for file uploads
- **Email Notifications**: Transactional emails for workflow events
- **Analytics Dashboard**: Metrics for admins

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🙏 Acknowledgments

Built with modern web technologies:
- React Team for React
- Vercel for Next.js ecosystem inspiration
- TanStack for React Query
- Framer for Framer Motion
- Tailwind Labs for Tailwind CSS

---

**Happy Building! 🚀**

For questions or issues, please open a GitHub issue.
