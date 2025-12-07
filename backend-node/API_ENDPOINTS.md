# TaskFlowPro API Documentation

## 🚀 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
All routes (except login/register) require JWT token in httpOnly cookie named `token`.

---

## 📋 Authentication Endpoints

### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "adminInviteCode": "optional-for-admin"
}
```

### Login User
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout User
```
POST /api/auth/logout
```

### Get Current User Profile
```
GET /api/auth/me
```

### Update Profile
```
PUT /api/auth/profile
```
**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password
```
PUT /api/auth/password
```
**Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Get All Users (Admin Only)
```
GET /api/auth/users?page=1&limit=10&search=john&role=user
```

### Toggle User Status (Admin Only)
```
PATCH /api/auth/users/:userId/toggle-status
```

### Delete User (Admin Only)
```
DELETE /api/auth/users/:userId
```

---

## 📝 Task Management Endpoints

### Create Task
```
POST /api/tasks
```
**Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "assignedTo": ["userId1", "userId2"],
  "dueDate": "2024-12-31",
  "tags": ["feature", "urgent"]
}
```

### Get All Tasks (with filtering)
```
GET /api/tasks?page=1&limit=10&status=todo&priority=high&assignedTo=userId&search=task&sortBy=dueDate&sortOrder=desc
```

### Get My Tasks
```
GET /api/tasks/my-tasks?page=1&limit=10
```

### Get Task Statistics
```
GET /api/tasks/stats
```

### Get Single Task
```
GET /api/tasks/:id
```

### Update Task
```
PUT /api/tasks/:id
```
**Body:** (any fields to update)
```json
{
  "title": "Updated Title",
  "status": "in-progress",
  "priority": "medium"
}
```

### Delete Task
```
DELETE /api/tasks/:id
```

### Assign Users to Task
```
POST /api/tasks/:id/assign
```
**Body:**
```json
{
  "userIds": ["userId1", "userId2"]
}
```

### Unassign Users from Task
```
POST /api/tasks/:id/unassign
```
**Body:**
```json
{
  "userIds": ["userId1"]
}
```

---

## ✅ Subtask Endpoints

### Add Subtask
```
POST /api/tasks/:id/subtasks
```
**Body:**
```json
{
  "title": "Subtask title"
}
```

### Toggle Subtask Completion
```
PATCH /api/tasks/:id/subtasks/:subtaskId
```

### Delete Subtask
```
DELETE /api/tasks/:id/subtasks/:subtaskId
```

---

## 💬 Comment Endpoints

### Add Comment
```
POST /api/tasks/:id/comments
```
**Body:**
```json
{
  "text": "This is a comment"
}
```

### Edit Comment
```
PATCH /api/tasks/:id/comments/:commentId
```
**Body:**
```json
{
  "text": "Updated comment text"
}
```

### Delete Comment
```
DELETE /api/tasks/:id/comments/:commentId
```

---

## ⏱️ Time Tracking Endpoints

### Start Time Tracking
```
POST /api/tasks/:id/time/start
```

### Stop Time Tracking
```
POST /api/tasks/:id/time/stop
```

---

## 📁 File Attachment Endpoints

### Upload Attachments (max 5 files)
```
POST /api/tasks/:id/attachments
```
**Form Data:**
- `files`: Array of files (multipart/form-data)

**Supported formats:** pdf, doc, docx, xls, xlsx, txt, jpg, jpeg, png, gif

**Max size:** 5MB per file

### Delete Attachment
```
DELETE /api/tasks/:id/attachments/:attachmentId
```

---

## 🗄️ Archive Endpoints

### Archive/Unarchive Task
```
PATCH /api/tasks/:id/archive
```

---

## 📊 Analytics Endpoints

### Get Dashboard Statistics
```
GET /api/analytics/dashboard
```
**Response:**
```json
{
  "totalTasks": 100,
  "completedTasks": 45,
  "inProgressTasks": 30,
  "todoTasks": 25,
  "completionRate": 45,
  "averageCompletionTime": 5.2,
  "userProductivity": {...}
}
```

### Get Task Distribution by Status
```
GET /api/analytics/task-distribution
```

### Get Task Distribution by Priority
```
GET /api/analytics/priority-distribution
```

### Get User Performance (Admin Only)
```
GET /api/analytics/user-performance?userId=optional
```

### Get Activity Heatmap (GitHub-style contribution graph)
```
GET /api/analytics/heatmap?userId=optional&year=2024
```
**Returns:** Daily activity counts for contribution visualization

### Get Tasks by Date Range
```
GET /api/analytics/tasks-by-date?startDate=2024-01-01&endDate=2024-12-31
```

### Get Time Tracking Summary
```
GET /api/analytics/time-tracking?userId=optional&startDate=2024-01-01&endDate=2024-12-31
```

### Get Activity Statistics
```
GET /api/analytics/activity-stats?startDate=2024-01-01&endDate=2024-12-31
```

### Get Tasks by Assignee (Admin Only)
```
GET /api/analytics/tasks-by-assignee
```

---

## 📜 Activity Log Endpoints

### Get Recent Activities
```
GET /api/activities/recent?limit=50&actionType=task_created
```

### Get Task Activities
```
GET /api/activities/task/:taskId?page=1&limit=20
```

### Get User Activities
```
GET /api/activities/user/:userId?page=1&limit=20&actionType=task_completed
```

### Get User Activity Timeline
```
GET /api/activities/timeline/:userId?days=30
```
**Returns:** Activities grouped by date

### Get Activity Statistics (Admin Only)
```
GET /api/activities/stats?startDate=2024-01-01&endDate=2024-12-31&userId=optional
```

### Get Action Type Breakdown (Admin Only)
```
GET /api/activities/action-breakdown?startDate=2024-01-01&endDate=2024-12-31
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "pageSize": 10,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "type": "ValidationError",
    "statusCode": 400,
    "stack": "..." // Only in development
  }
}
```

---

## 🔑 Activity Log Action Types

- `task_created`
- `task_updated`
- `task_deleted`
- `task_completed`
- `task_archived`
- `task_unarchived`
- `user_assigned`
- `user_unassigned`
- `subtask_added`
- `subtask_toggled`
- `subtask_deleted`
- `comment_added`
- `comment_updated`
- `comment_removed`
- `attachment_added`
- `attachment_removed`
- `time_started`
- `time_stopped`
- `status_changed`
- `priority_changed`

---

## 📝 Task Status Values
- `todo`
- `in-progress`
- `completed`

## 🎯 Task Priority Values
- `low`
- `medium`
- `high`

## 👤 User Roles
- `user`
- `admin`

---

## 🚀 Total Endpoints: 50+

### Breakdown:
- **Authentication:** 9 endpoints
- **Tasks CRUD:** 7 endpoints
- **Subtasks:** 3 endpoints
- **Comments:** 3 endpoints
- **Time Tracking:** 2 endpoints
- **File Attachments:** 2 endpoints
- **Archive:** 1 endpoint
- **Analytics:** 9 endpoints
- **Activity Logs:** 6 endpoints

---

## ✅ Backend Features Complete:
✅ JWT Authentication with httpOnly cookies
✅ Role-based access control (Admin/User)
✅ Complete Task CRUD with filtering, pagination, search
✅ Multi-assignee support
✅ Subtasks management
✅ Comments system with edit/delete
✅ Time tracking
✅ File uploads to Cloudinary (5MB limit, 5 files max)
✅ Archive/unarchive tasks
✅ Comprehensive analytics dashboard
✅ GitHub-style activity heatmap
✅ Complete audit trail with activity logs
✅ User management (Admin)
✅ Error handling and validation
✅ Activity statistics and breakdowns
