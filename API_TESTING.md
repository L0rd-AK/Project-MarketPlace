# API Testing Guide

Manual testing guide for all API endpoints using cURL or Postman.

## Setup

Make sure the server is running:
```bash
cd server
npm run dev
```

Base URL: `http://localhost:5000`

## Authentication Endpoints

### 1. Register New User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "SOLVER"
  }
}
```

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "buyer@marketplace.com",
    "password": "buyer123"
  }'
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "...",
    "name": "Buyer User",
    "email": "buyer@marketplace.com",
    "role": "BUYER"
  }
}
```

Note: `-c cookies.txt` saves cookies for subsequent requests.

### 3. Get Current User

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "...",
    "name": "Buyer User",
    "email": "buyer@marketplace.com",
    "role": "BUYER"
  }
}
```

### 4. Logout

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Admin Endpoints

Login as admin first:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c admin-cookies.txt \
  -d '{
    "email": "admin@marketplace.com",
    "password": "admin123"
  }'
```

### 1. Get All Users

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -b admin-cookies.txt
```

**Expected Response (200):**
```json
{
  "users": [
    {
      "id": "...",
      "name": "Admin User",
      "email": "admin@marketplace.com",
      "role": "ADMIN",
      "createdAt": "2026-01-29T..."
    },
    // ... more users
  ]
}
```

### 2. Assign BUYER Role

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/admin/users/{userId}/role \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{
    "role": "BUYER"
  }'
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "BUYER"
  }
}
```

### 3. Get All Projects

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/projects \
  -b admin-cookies.txt
```

**Expected Response (200):**
```json
{
  "projects": [
    {
      "id": "...",
      "title": "Project Title",
      "description": "...",
      "status": "OPEN",
      "buyer": {...},
      "assignedSolver": null,
      "createdAt": "..."
    }
  ]
}
```

## Buyer Endpoints

Login as buyer:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c buyer-cookies.txt \
  -d '{
    "email": "buyer@marketplace.com",
    "password": "buyer123"
  }'
```

### 1. Create Project

**Request:**
```bash
curl -X POST http://localhost:5000/api/buyer/projects \
  -H "Content-Type: application/json" \
  -b buyer-cookies.txt \
  -d '{
    "title": "E-commerce Website",
    "description": "Need a full-stack e-commerce platform with payment integration"
  }'
```

**Expected Response (201):**
```json
{
  "project": {
    "id": "...",
    "title": "E-commerce Website",
    "description": "Need a full-stack e-commerce platform...",
    "status": "OPEN",
    "createdAt": "..."
  }
}
```

### 2. Get Buyer's Projects

**Request:**
```bash
curl -X GET http://localhost:5000/api/buyer/projects \
  -b buyer-cookies.txt
```

### 3. Get Project by ID

**Request:**
```bash
curl -X GET http://localhost:5000/api/buyer/projects/{projectId} \
  -b buyer-cookies.txt
```

### 4. Get Work Requests for Project

**Request:**
```bash
curl -X GET http://localhost:5000/api/buyer/projects/{projectId}/requests \
  -b buyer-cookies.txt
```

**Expected Response (200):**
```json
{
  "requests": [
    {
      "id": "...",
      "solver": {
        "id": "...",
        "name": "Solver User",
        "email": "solver@marketplace.com"
      },
      "message": "I would like to work on this project.",
      "status": "PENDING",
      "createdAt": "..."
    }
  ]
}
```

### 5. Assign Solver to Project

**Request:**
```bash
curl -X POST http://localhost:5000/api/buyer/projects/{projectId}/assign-solver \
  -H "Content-Type: application/json" \
  -b buyer-cookies.txt \
  -d '{
    "workRequestId": "{workRequestId}"
  }'
```

**Expected Response (200):**
```json
{
  "project": {
    "id": "...",
    "title": "...",
    "status": "ASSIGNED",
    "assignedSolver": {
      "id": "...",
      "name": "Solver User",
      "email": "solver@marketplace.com"
    }
  }
}
```

### 6. Get Task Submission

**Request:**
```bash
curl -X GET http://localhost:5000/api/buyer/tasks/{taskId}/submission \
  -b buyer-cookies.txt
```

**Expected Response (200):**
```json
{
  "submission": {
    "id": "...",
    "taskId": "...",
    "solver": {...},
    "fileName": "deliverable.zip",
    "sizeBytes": 1048576,
    "submittedAt": "...",
    "buyerDecision": "PENDING",
    "downloadUrl": "/api/buyer/submissions/.../download"
  }
}
```

### 7. Review Submission

**Request (Accept):**
```bash
curl -X POST http://localhost:5000/api/buyer/tasks/{taskId}/review \
  -H "Content-Type: application/json" \
  -b buyer-cookies.txt \
  -d '{
    "decision": "ACCEPT",
    "feedback": "Great work!"
  }'
```

**Request (Reject):**
```bash
curl -X POST http://localhost:5000/api/buyer/tasks/{taskId}/review \
  -H "Content-Type: application/json" \
  -b buyer-cookies.txt \
  -d '{
    "decision": "REJECT",
    "feedback": "Please revise the authentication module"
  }'
```

**Expected Response (200):**
```json
{
  "task": {
    "id": "...",
    "title": "...",
    "status": "COMPLETED"
  },
  "submission": {
    "id": "...",
    "buyerDecision": "ACCEPTED",
    "buyerFeedback": "Great work!",
    "decidedAt": "..."
  }
}
```

## Solver Endpoints

Login as solver:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c solver-cookies.txt \
  -d '{
    "email": "solver@marketplace.com",
    "password": "solver123"
  }'
```

### 1. Get Solver Profile

**Request:**
```bash
curl -X GET http://localhost:5000/api/solver/profile \
  -b solver-cookies.txt
```

**Expected Response (200) if exists:**
```json
{
  "profile": {
    "id": "...",
    "displayName": "Expert Problem Solver",
    "bio": "Full-stack developer with 5+ years...",
    "skills": ["React", "Node.js", "MongoDB"],
    "portfolioLinks": ["https://github.com/solver"]
  }
}
```

**Expected Response (404) if not exists:**
```json
{
  "profile": null
}
```

### 2. Create Solver Profile

**Request:**
```bash
curl -X POST http://localhost:5000/api/solver/profile \
  -H "Content-Type: application/json" \
  -b solver-cookies.txt \
  -d '{
    "displayName": "Full Stack Expert",
    "bio": "Experienced developer specializing in MERN stack",
    "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
    "portfolioLinks": ["https://github.com/example", "https://portfolio.dev"]
  }'
```

### 3. Update Solver Profile

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/solver/profile \
  -H "Content-Type: application/json" \
  -b solver-cookies.txt \
  -d '{
    "bio": "Updated bio with new information",
    "skills": ["React", "Node.js", "TypeScript", "MongoDB", "AWS"]
  }'
```

### 4. Browse Available Projects

**Request:**
```bash
curl -X GET http://localhost:5000/api/solver/projects \
  -b solver-cookies.txt
```

**Expected Response (200):**
```json
{
  "projects": [
    {
      "id": "...",
      "title": "E-commerce Website",
      "description": "...",
      "buyer": {
        "id": "...",
        "name": "Buyer User",
        "email": "buyer@marketplace.com"
      },
      "createdAt": "..."
    }
  ]
}
```

### 5. Request to Work on Project

**Request:**
```bash
curl -X POST http://localhost:5000/api/solver/projects/{projectId}/request \
  -H "Content-Type: application/json" \
  -b solver-cookies.txt \
  -d '{
    "message": "I have extensive experience with e-commerce platforms"
  }'
```

**Expected Response (201):**
```json
{
  "request": {
    "id": "...",
    "projectId": "...",
    "message": "I have extensive experience...",
    "status": "PENDING",
    "createdAt": "..."
  }
}
```

### 6. Get Assigned Projects

**Request:**
```bash
curl -X GET http://localhost:5000/api/solver/assigned-projects \
  -b solver-cookies.txt
```

### 7. Create Task

**Request:**
```bash
curl -X POST http://localhost:5000/api/solver/projects/{projectId}/tasks \
  -H "Content-Type: application/json" \
  -b solver-cookies.txt \
  -d '{
    "title": "User Authentication Module",
    "description": "Implement JWT-based authentication with login and register",
    "deadline": "2026-02-15"
  }'
```

**Expected Response (201):**
```json
{
  "task": {
    "id": "...",
    "title": "User Authentication Module",
    "description": "Implement JWT-based authentication...",
    "deadline": "2026-02-15T00:00:00.000Z",
    "status": "IN_PROGRESS",
    "createdAt": "..."
  }
}
```

### 8. Get Project Tasks

**Request:**
```bash
curl -X GET http://localhost:5000/api/solver/projects/{projectId}/tasks \
  -b solver-cookies.txt
```

### 9. Update Task

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/solver/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -b solver-cookies.txt \
  -d '{
    "title": "Updated Task Title",
    "deadline": "2026-02-20"
  }'
```

### 10. Submit Task (Upload ZIP)

**Request:**
```bash
curl -X POST http://localhost:5000/api/solver/tasks/{taskId}/submit \
  -b solver-cookies.txt \
  -F "file=@/path/to/deliverable.zip"
```

Note: Create a test ZIP file first.

**Expected Response (201):**
```json
{
  "submission": {
    "id": "...",
    "taskId": "...",
    "fileName": "deliverable.zip",
    "sizeBytes": 1048576,
    "submittedAt": "..."
  },
  "task": {
    "id": "...",
    "status": "SUBMITTED"
  }
}
```

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "title",
      "message": "Title must be at least 3 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Complete Workflow Test

Here's a complete test workflow using cURL:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

# 1. Login as admin
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c admin.txt \
  -d '{"email":"admin@marketplace.com","password":"admin123"}'

# 2. Login as buyer
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c buyer.txt \
  -d '{"email":"buyer@marketplace.com","password":"buyer123"}'

# 3. Login as solver
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c solver.txt \
  -d '{"email":"solver@marketplace.com","password":"solver123"}'

# 4. Buyer creates project
PROJECT_ID=$(curl -X POST $BASE_URL/api/buyer/projects \
  -H "Content-Type: application/json" \
  -b buyer.txt \
  -d '{"title":"Test Project","description":"This is a test project"}' \
  | jq -r '.project.id')

echo "Created project: $PROJECT_ID"

# 5. Solver requests to work
curl -X POST $BASE_URL/api/solver/projects/$PROJECT_ID/request \
  -H "Content-Type: application/json" \
  -b solver.txt \
  -d '{"message":"I want to work on this"}'

# 6. Get work requests
WORK_REQUEST_ID=$(curl -X GET $BASE_URL/api/buyer/projects/$PROJECT_ID/requests \
  -b buyer.txt \
  | jq -r '.requests[0].id')

echo "Work request: $WORK_REQUEST_ID"

# 7. Buyer assigns solver
curl -X POST $BASE_URL/api/buyer/projects/$PROJECT_ID/assign-solver \
  -H "Content-Type: application/json" \
  -b buyer.txt \
  -d "{\"workRequestId\":\"$WORK_REQUEST_ID\"}"

# 8. Solver creates task
TASK_ID=$(curl -X POST $BASE_URL/api/solver/projects/$PROJECT_ID/tasks \
  -H "Content-Type: application/json" \
  -b solver.txt \
  -d '{"title":"Test Task","description":"Test description","deadline":"2026-03-01"}' \
  | jq -r '.task.id')

echo "Created task: $TASK_ID"

# 9. Create a test ZIP file
echo "test content" > test.txt
zip test.zip test.txt

# 10. Submit task
curl -X POST $BASE_URL/api/solver/tasks/$TASK_ID/submit \
  -b solver.txt \
  -F "file=@test.zip"

# 11. Buyer reviews submission
curl -X POST $BASE_URL/api/buyer/tasks/$TASK_ID/review \
  -H "Content-Type: application/json" \
  -b buyer.txt \
  -d '{"decision":"ACCEPT","feedback":"Good work!"}'

echo "Workflow complete!"
```

Save this as `test-workflow.sh` and run with `bash test-workflow.sh`.
