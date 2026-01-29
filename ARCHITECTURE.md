# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + TypeScript)                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Pages: Login, Register, Admin, Buyer, Solver Dashboards       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Components: LifecycleStepper, TaskStatusTimeline, etc.        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  React Query: Data fetching, caching, state management         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Framer Motion: Animated state transitions & micro-interactions│ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  API Client (Axios): HTTP requests with auth interceptors      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS + Cookies (JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER (Express + TypeScript)                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Middleware: CORS, Cookie Parser, Auth, RBAC, Upload           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Routes: /api/auth, /api/admin, /api/buyer, /api/solver        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Controllers: Auth, Admin, Buyer, Solver business logic        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Validators (Zod): Request schema validation                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Models (Mongoose): User, Project, Task, Submission, etc.      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MongoDB Driver
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           MongoDB Database                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Users   │ │ Projects │ │  Tasks   │ │Submissions│WorkRequests│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────────┐                                                   │
│  │SolverProfiles│                                                   │
│  └──────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: Buyer Assigns Solver

```
┌────────┐                ┌────────┐                ┌────────┐
│ Buyer  │                │ Server │                │MongoDB │
│ Client │                │        │                │        │
└───┬────┘                └───┬────┘                └───┬────┘
    │                         │                         │
    │ POST /api/buyer/       │                         │
    │ projects/:id/          │                         │
    │ assign-solver          │                         │
    ├────────────────────────>│                         │
    │ {workRequestId}         │                         │
    │                         │                         │
    │                         │ 1. Verify JWT token     │
    │                         │                         │
    │                         │ 2. Check BUYER role     │
    │                         │                         │
    │                         │ 3. Validate request     │
    │                         │    (Zod schema)         │
    │                         │                         │
    │                         │ 4. Start transaction    │
    │                         ├────────────────────────>│
    │                         │                         │
    │                         │ 5. Find project         │
    │                         │<────────────────────────┤
    │                         │                         │
    │                         │ 6. Verify ownership     │
    │                         │                         │
    │                         │ 7. Update project       │
    │                         │    status = ASSIGNED    │
    │                         ├────────────────────────>│
    │                         │                         │
    │                         │ 8. Accept work request  │
    │                         ├────────────────────────>│
    │                         │                         │
    │                         │ 9. Reject other requests│
    │                         ├────────────────────────>│
    │                         │                         │
    │                         │ 10. Commit transaction  │
    │                         │<────────────────────────┤
    │                         │                         │
    │ 200 OK                  │                         │
    │ {project: {...}}        │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │ React Query invalidates │                         │
    │ cache & refetches       │                         │
    │                         │                         │
    │ Framer Motion animates  │                         │
    │ stepper OPEN→ASSIGNED   │                         │
    │                         │                         │
```

## Data Flow: File Upload

```
┌────────┐                ┌────────┐                ┌────────┐
│ Solver │                │ Server │                │  Disk  │
│ Client │                │        │                │Storage │
└───┬────┘                └───┬────┘                └───┬────┘
    │                         │                         │
    │ Select ZIP file         │                         │
    │ (client validates)      │                         │
    │                         │                         │
    │ POST /api/solver/       │                         │
    │ tasks/:id/submit        │                         │
    │ [multipart/form-data]   │                         │
    ├────────────────────────>│                         │
    │                         │                         │
    │ Progress: 25%           │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │ Progress: 50%           │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │ Progress: 75%           │ Multer middleware       │
    │<────────────────────────┤ 1. Check file type      │
    │                         │ 2. Check size limit     │
    │                         │ 3. Generate unique name │
    │                         │                         │
    │                         │ Write file              │
    │                         ├────────────────────────>│
    │                         │                         │
    │ Progress: 100%          │ Create Submission       │
    │<────────────────────────┤ (MongoDB)               │
    │                         │                         │
    │                         │ Update Task             │
    │                         │ status = SUBMITTED      │
    │                         │                         │
    │ 201 Created             │                         │
    │ {submission, task}      │                         │
    │<────────────────────────┤                         │
    │                         │                         │
    │ Animate status change   │                         │
    │ IN_PROGRESS→SUBMITTED   │                         │
    │                         │                         │
```

## Component Hierarchy

```
App
├── Routes
│   ├── Public Routes
│   │   ├── /login → Login
│   │   └── /register → Register
│   │
│   ├── Admin Routes (ProtectedRoute: ADMIN)
│   │   └── /admin → AdminDashboard
│   │       └── DashboardLayout
│   │           ├── User Management Table
│   │           ├── Statistics Cards (animated)
│   │           └── Projects Overview
│   │
│   ├── Buyer Routes (ProtectedRoute: BUYER)
│   │   ├── /buyer → BuyerDashboard
│   │   │   └── DashboardLayout
│   │   │       ├── Create Project Form
│   │   │       └── Projects List
│   │   │
│   │   └── /buyer/projects/:id → BuyerProjectDetail
│   │       └── DashboardLayout
│   │           ├── LifecycleStepper (animated)
│   │           ├── Work Requests List
│   │           └── Tasks Review Section
│   │
│   └── Solver Routes (ProtectedRoute: SOLVER)
│       ├── /solver → SolverDashboard
│       │   └── DashboardLayout
│       │       ├── Profile Section
│       │       ├── Assigned Projects
│       │       └── Available Projects
│       │
│       └── /solver/projects/:id → SolverProjectDetail
│           └── DashboardLayout
│               ├── Create Task Form
│               └── Tasks List
│                   └── TaskStatusTimeline (animated)
│                       └── File Upload (with progress)
```

## State Machine: Project Lifecycle

```
                    ┌───────────────────┐
                    │   Buyer creates   │
                    │      project      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OPEN          │◀─────┐
                    │                 │      │
                    │ - Accepts       │      │ Multiple
                    │   requests      │      │ solvers can
                    │ - Visible to    │      │ request
                    │   all solvers   │      │
                    └─────────┬───────┘      │
                              │              │
                    Buyer     │              │
                    selects   │              │
                    ONE       │              │
                    solver    │              │
                              ▼              │
                    ┌─────────────────┐     │
                    │   ASSIGNED      │     │
                    │                 │     │
                    │ - Solver works  │     │
                    │ - Creates tasks │     │
                    │ - Submits work  │     │
                    └─────────────────┘     │
                              │              │
                              │              │
                    (No return to OPEN)      │
                              │              │
                              └──────────────┘
```

## State Machine: Task Lifecycle

```
        ┌────────────────────┐
        │ Solver creates     │
        │      task          │
        └──────┬─────────────┘
               │
               ▼
     ┌─────────────────┐
     │  IN_PROGRESS    │◀────────────────┐
     │                 │                 │
     │ - Editable      │                 │
     │ - Can submit    │                 │
     └────┬────────────┘                 │
          │                              │
          │ Solver uploads ZIP           │
          │                              │
          ▼                              │
     ┌─────────────────┐                 │
     │   SUBMITTED     │                 │
     │                 │                 │
     │ - Awaiting      │                 │
     │   buyer review  │                 │
     └────┬────────────┘                 │
          │                              │
          │ Buyer reviews                │
          │                              │
          ├─────────────┬────────────────┤
          │             │                │
    ACCEPT│             │REJECT          │
          │             │                │
          ▼             ▼                │
  ┌─────────────┐  ┌─────────────┐      │
  │ COMPLETED   │  │  REJECTED   │      │
  │             │  │             │      │
  │ - Terminal  │  │ - Can       │──────┘
  │   state     │  │   revise    │ (optional)
  └─────────────┘  └─────────────┘
```

## Authentication Flow

```
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │ POST /api/auth/login                  │
    │ {email, password}                     │
    ├──────────────────────────────────────>│
    │                                       │
    │                                       │ Verify credentials
    │                                       │ (bcrypt compare)
    │                                       │
    │                                       │ Generate tokens:
    │                                       │ - Access (15min)
    │                                       │ - Refresh (7days)
    │                                       │
    │                                       │ Set httpOnly cookies
    │ 200 OK + Cookies                      │
    │ {user: {...}}                         │
    │<──────────────────────────────────────┤
    │                                       │
    │ Store user in React Query cache       │
    │                                       │
    │ Redirect based on role:               │
    │ - ADMIN → /admin                      │
    │ - BUYER → /buyer                      │
    │ - SOLVER → /solver                    │
    │                                       │
    │                                       │
    │ GET /api/protected-route              │
    │ (includes cookies automatically)      │
    ├──────────────────────────────────────>│
    │                                       │
    │                                       │ Verify access token
    │                                       │ Extract userId
    │                                       │ Check role
    │                                       │
    │ 200 OK {data}                         │
    │<──────────────────────────────────────┤
    │                                       │
    │                                       │
    │ [Access token expires]                │
    │                                       │
    │ GET /api/protected-route              │
    ├──────────────────────────────────────>│
    │                                       │
    │                                       │ Token expired
    │ 401 Unauthorized                      │
    │<──────────────────────────────────────┤
    │                                       │
    │ Axios interceptor catches 401         │
    │ Redirects to /login                   │
    │                                       │
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Request Security                      │
├─────────────────────────────────────────────────────────┤
│ Layer 1: CORS                                           │
│ - Validates origin                                      │
│ - Checks credentials flag                               │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Authentication (JWT)                           │
│ - Verifies token signature                              │
│ - Checks expiration                                     │
│ - Extracts user identity                                │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Authorization (RBAC)                           │
│ - Validates user role                                   │
│ - Checks route permissions                              │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Input Validation (Zod)                         │
│ - Validates request shape                               │
│ - Type checks                                           │
│ - Sanitizes input                                       │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Business Logic                                 │
│ - Ownership verification                                │
│ - State transition rules                                │
│ - Resource existence checks                             │
├─────────────────────────────────────────────────────────┤
│ Layer 6: File Upload (Multer)                           │
│ - Extension validation                                  │
│ - MIME type check                                       │
│ - Size limit enforcement                                │
│ - Safe filename generation                              │
└─────────────────────────────────────────────────────────┘
```

This architecture ensures separation of concerns, security in depth, and maintainable code structure.
