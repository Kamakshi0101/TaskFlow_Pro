# Backend Node.js - Task Manager API

## 📁 Project Structure

```
backend-node/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── constants/           # App-wide constants
│   └── index.js         # Status codes, messages, roles, etc.
├── controllers/         # Route controllers (to be created)
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication & authorization
│   └── errorHandler.js  # Global error handling
├── models/              # MongoDB schemas (to be created)
├── routes/              # API routes (to be created)
├── services/            # Business logic & Java service connector
├── uploads/             # File upload storage
├── utils/               # Utility functions
│   ├── errorHandler.js  # Custom error classes
│   ├── jwt.js           # JWT token generation/verification
│   ├── response.js      # Response formatting helpers
│   └── validators.js    # Input validation helpers
├── .env                 # Environment variables (DO NOT COMMIT)
├── .env.example         # Template for .env
├── .gitignore           # Git ignore rules
├── index.js             # Main server file
├── package.json         # Dependencies
└── README.md            # This file
```

## 🚀 Getting Started

### Installation

```bash
cd backend-node
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Production

```bash
npm start
```

## 📋 API Documentation

### Health Check

- `GET /` - API status
- `GET /health` - Server health check

### Auth Endpoints (to be implemented)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Task Endpoints (to be implemented)

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### User Endpoints (to be implemented)

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔐 Authentication

JWT tokens are stored in httpOnly cookies for security.

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **morgan** - Request logging
- **cookie-parser** - Cookie parsing

## 🔄 Error Handling

All errors are handled by the global error handler middleware. Custom error classes:

- `AppError` - Base error class
- `ValidationError` - Input validation errors
- `AuthenticationError` - Auth failures
- `AuthorizationError` - Permission errors
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate resource
- `DatabaseError` - DB operation failures
- `ExternalServiceError` - 3rd party API failures

## 📝 Git Workflow

This backend follows feature branch pattern with conventional commits:

```bash
git checkout -b backend/feature-name
# Make changes
git add .
git commit -m "feat: added feature"
git push origin backend/feature-name
# Create pull request on GitHub
```

## ✅ Next Steps

1. **Step 2: Authentication System** - User/Admin registration & login
2. **Step 3: Task Management** - CRUD operations & models
3. **Step 4: Analytics** - Dashboard & reports
4. **Step 5: Java Microservice** - Report generation
5. **Step 6: Frontend** - React + Vite integration

---

**Last Updated:** December 7, 2025
