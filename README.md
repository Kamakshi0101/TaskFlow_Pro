# TaskFlowPro - Task Management System

A comprehensive full-stack task management application with microservices architecture featuring **MERN Stack** + **Java Spring Boot** microservice for report generation.

## 🏗️ Architecture

**Frontend:** React + Vite + TailwindCSS + Framer Motion  
**Backend:** Node.js + Express + MongoDB  
**Microservice:** Java 21 + Spring Boot + Maven (PDF/Excel Report Generation)  
**Authentication:** JWT-based with role-based access control

---

## ✨ Key Features

### 📊 Core Functionality
- ✅ User authentication & authorization (Admin, Manager, Member roles)
- ✅ Task creation, assignment, and tracking
- ✅ Real-time dashboard with KPIs and analytics
- ✅ Kanban board and table views
- ✅ Priority-based task filtering
- ✅ User management (Admin only)

### 📄 Java-Powered Report Generation
- ✅ **PDF Reports** - Generated using OpenPDF library
- ✅ **Excel Reports** - Generated using Apache POI
- ✅ Color-coded priorities and status indicators
- ✅ Filtered exports (by status, priority, date range)
- ✅ Professional formatting with headers and metadata

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Java JDK** 21 (Eclipse Temurin recommended)
- **Maven** 3.6+
- **MongoDB** (Atlas or local)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Kamakshi0101/TaskFlow_Pro.git
cd TaskFlowPro
```

**2. Backend Setup**
```bash
cd backend-node
npm install
```

Create `.env` file in `backend-node/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
JAVA_REPORT_SERVICE_URL=http://localhost:8085
```

**3. Frontend Setup**
```bash
cd frontend
npm install
```

**4. Java Report Service Setup**
```bash
cd report-service

# Windows PowerShell - Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java version
java -version  # Should show Java 21
```

---

## 🎯 Running the Application

### Option 1: Automated Start (Windows)
```powershell
.\start-all-services.ps1
```

### Option 2: Manual Start

**Terminal 1 - Node Backend:**
```bash
cd backend-node
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Java Microservice:**
```bash
cd report-service
mvn spring-boot:run
# Runs on http://localhost:8085
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Check Services Status
```powershell
.\check-services.ps1
```

**Expected Output:**
```
✓ Java Service (8085) - RUNNING
✓ Node Backend (5000) - RUNNING
✓ React Frontend (5173) - RUNNING
```

---

## 📁 Project Structure

```
TaskFlowPro/
│
├── backend-node/              # Node.js Express Backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth & validation
│   ├── models/              # MongoDB schemas (User, Task)
│   ├── routes/              # API routes
│   ├── services/            # Java microservice integration
│   ├── .env                 # Environment variables
│   └── index.js             # Entry point
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── layout/     # Sidebar, DashboardLayout
│   │   │   └── ui/         # Buttons, Cards, Modals
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # AdminDashboard, AllTasks, Reports
│   │   │   ├── manager/    # Manager views
│   │   │   └── member/     # Member views
│   │   ├── store/          # Redux state management
│   │   ├── utils/          # Helpers & utilities
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── report-service/          # Java Spring Boot Microservice
│   ├── src/
│   │   └── main/
│   │       ├── java/com/taskflowpro/reportservice/
│   │       │   ├── controller/    # ReportController (REST API)
│   │       │   ├── dto/          # TaskReportDTO, UserSummaryDTO
│   │       │   ├── service/      # PdfService, ExcelService
│   │       │   └── ReportServiceApplication.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml              # Maven dependencies
│
├── start-all-services.ps1   # Automation script
├── check-services.ps1       # Service health check
└── README.md               # This file
```

---

## 🔧 Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Redux Toolkit | State management |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| React Router | Navigation |
| React Icons | Icon library |

### Backend (Node.js)
| Technology | Purpose |
|-----------|---------|
| Express | Web framework |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Axios | Java service calls |

### Microservice (Java)
| Technology | Purpose |
|-----------|---------|
| Java 21 | Programming language |
| Spring Boot 3.2.1 | Framework |
| Maven | Build & dependency management |
| OpenPDF 1.3.34 | PDF generation |
| Apache POI 5.2.5 | Excel generation |
| Jakarta Validation | Input validation |
| Lombok | Reduce boilerplate |

---

## 🎯 API Endpoints

### Authentication
```http
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
GET    /api/auth/me           # Get current user
```

### Tasks
```http
GET    /api/tasks             # Get all tasks (with filters)
POST   /api/tasks             # Create new task
GET    /api/tasks/:id         # Get task by ID
PUT    /api/tasks/:id         # Update task
DELETE /api/tasks/:id         # Delete task
```

### Reports (Java Microservice Integration)
```http
GET    /api/reports/health           # Check Java service status
GET    /api/reports/tasks/pdf        # Generate PDF report
GET    /api/reports/tasks/excel      # Generate Excel report
GET    /api/reports/users/summary    # Generate user summary PDF

Query Parameters:
- status: filter by status (todo, in-progress, completed)
- priority: filter by priority (low, medium, high, urgent)
- dateFrom: start date (YYYY-MM-DD)
- dateTo: end date (YYYY-MM-DD)
```

### Users (Admin Only)
```http
GET    /api/users             # Get all users
PUT    /api/users/:id/role    # Update user role
DELETE /api/users/:id         # Delete user
```

---

## 📊 Using the Report Feature

### Method 1: From Admin Dashboard
1. Login as admin user
2. Navigate to **Dashboard**
3. Click **"Export PDF"** or **"Export Excel"** buttons (top-right corner)
4. Report downloads automatically with all tasks

### Method 2: From All Tasks Page
1. Navigate to **All Tasks**
2. Apply filters if needed:
   - Status: todo, in-progress, completed
   - Priority: low, medium, high, urgent
3. Click **"PDF"** or **"Excel"** button next to "Create Task"
4. Filtered report downloads instantly

### Method 3: Reports Information Page
1. Click **"Reports"** in the admin sidebar
2. View Java integration architecture
3. Read about features and technologies
4. See instructions on where to use export buttons

---

## 🔐 User Roles & Permissions

### Admin
- ✅ Full system access
- ✅ User management (create, edit, delete users)
- ✅ All task operations
- ✅ Generate reports
- ✅ View analytics & KPIs
- ✅ Access all pages

### Manager
- ✅ Create and assign tasks
- ✅ View team tasks
- ✅ Update task status
- ✅ Generate reports
- ✅ View dashboard

### Member
- ✅ View assigned tasks only
- ✅ Update own task status
- ✅ Mark tasks as complete
- ✅ View personal dashboard

---

## 🛠️ Development Scripts

### Backend (Node.js)
```bash
npm start          # Start server (production mode)
npm run dev        # Start with nodemon (development)
```

### Frontend (React)
```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run preview    # Preview production build
```

### Java Service
```bash
mvn clean install  # Build project & install dependencies
mvn spring-boot:run # Run Spring Boot application
mvn test          # Run unit tests
mvn clean         # Clean target directory
```

---

## 🧪 Testing

### Test All Services Health
```powershell
.\check-services.ps1
```

### Test Java Service Directly
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:8085/api/report/health"

# Test PDF generation (requires request body)
.\test-report-service.ps1
```

### Test Backend API
```bash
# Get current user
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all tasks
curl http://localhost:5000/api/tasks -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 Key Dependencies

### Backend Package.json
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend Package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16",
    "date-fns": "^3.0.6",
    "react-icons": "^4.12.0"
  }
}
```

### Java pom.xml Dependencies
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>1.3.34</version>
  </dependency>
  <dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
</dependencies>
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem:** Blank screen or "Connection refused"
```bash
# Solution 1: Check if frontend is running
cd frontend
npm run dev

# Solution 2: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Port 5173 already in use
```powershell
# Kill process on port 5173
Get-NetTCPConnection -LocalPort 5173 | Select -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Backend Issues

**Problem:** MongoDB connection error
```bash
# Check .env file exists and has correct MONGO_URI
cd backend-node
cat .env

# Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for testing)
```

**Problem:** Port 5000 already in use
```powershell
# Kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | Select -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Java Service Issues

**Problem:** "Java version mismatch" or compilation errors
```bash
# Set JAVA_HOME to Java 21
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version  # Verify shows Java 21

# Clean and rebuild
cd report-service
mvn clean install
```

**Problem:** Maven build fails
```bash
# Update Maven
mvn --version

# Force update dependencies
mvn clean install -U
```

**Problem:** Port 8085 already in use
```powershell
# Find and kill process
Get-NetTCPConnection -LocalPort 8085 | Select -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Report Generation Issues

**Problem:** Reports show 0 tasks
```bash
# 1. Verify all services are running
.\check-services.ps1

# 2. Check tasks exist in database (login and create tasks in UI)

# 3. Check backend logs for errors

# 4. Test without filters first (from Dashboard)
```

**Problem:** "Failed to generate report" error
```bash
# 1. Check Java service is running
curl http://localhost:8085/api/report/health

# 2. Check backend can reach Java service
# Verify JAVA_REPORT_SERVICE_URL in backend .env

# 3. Check backend terminal for error details
```

---

## 🌟 Demo Credentials

### Admin User
```
Email: admin@taskflowpro.com
Password: admin123
Role: Admin
```

### Manager User
```
Email: manager@taskflowpro.com
Password: manager123
Role: Manager
```

### Member User
```
Email: member@taskflowpro.com
Password: member123
Role: Member
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflowpro?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d

# Java Microservice
JAVA_REPORT_SERVICE_URL=http://localhost:8085

# CORS (optional)
FRONTEND_URL=http://localhost:5173
```

### Java (application.properties)
```properties
# Server Configuration
server.port=8085
spring.application.name=TaskFlowPro Report Service

# Logging
logging.level.root=INFO
logging.level.com.taskflowpro=DEBUG

# File Upload (optional)
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## 🚀 Deployment Guide

### Frontend (Vercel/Netlify)
1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist/` folder
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com`

### Backend (Heroku/Railway/Render)
1. Push code to Git repository
2. Set environment variables in hosting platform
3. Use start script: `npm start`
4. Ensure MongoDB Atlas IP whitelist includes hosting platform

### Java Service (Docker)
Create `Dockerfile` in `report-service/`:
```dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t taskflowpro-reports .
docker run -p 8085:8085 taskflowpro-reports
```

---

## 📚 Architecture Flow

### Report Generation Flow
```
1. User clicks "Export PDF" in React UI
   ↓
2. Frontend sends GET request to Node backend
   GET /api/reports/tasks/pdf
   ↓
3. Node backend (reportRoutes.js):
   - Authenticates user (JWT middleware)
   - Fetches tasks from MongoDB
   - Transforms data to Java DTO format
   ↓
4. Node calls Java microservice:
   POST http://localhost:8085/api/report/tasks/pdf
   Body: { title, filters, tasks[] }
   ↓
5. Java Spring Boot service (ReportController):
   - Validates request (@Valid annotation)
   - Calls PdfService to generate PDF
   - OpenPDF creates formatted document
   - Returns binary stream
   ↓
6. Node streams PDF binary back to React
   ↓
7. React creates Blob and download link
   ↓
8. Browser triggers file download
   ↓
9. User gets professionally formatted PDF! ✅
```

---

## 🎨 UI Features

### Dashboard
- Real-time KPIs (total, completed, in-progress, overdue tasks)
- Task distribution pie chart
- Priority breakdown bar chart
- 7-day productivity trend
- Recent activity timeline
- Quick actions (Create Task, View Reports)

### All Tasks Page
- Table and Kanban board views
- Multi-filter system (status, priority, assignee)
- Search functionality
- Bulk actions
- Export to PDF/Excel with current filters
- Drag-and-drop (Kanban view)

### Reports Page
- Java integration documentation
- Architecture visualization
- Technology showcase
- Feature highlights
- Quick links to export buttons

---

## 📄 License

This project is licensed under the **MIT License** - feel free to use it for learning, academic purposes, or commercial projects.

---

## 👨‍💻 Author

**Kamakshi Aggarwal**
- GitHub: [@Kamakshi0101](https://github.com/Kamakshi0101)
- Repository: [TaskFlow_Pro](https://github.com/Kamakshi0101/TaskFlow_Pro)

---

## 🙏 Acknowledgments

- **OpenPDF** - PDF generation library
- **Apache POI** - Excel generation library
- **Spring Boot** - Java microservices framework
- **React Team** - Amazing frontend library
- **MongoDB** - NoSQL database
- **TailwindCSS** - Utility-first CSS framework

---

## 📞 Support

If you encounter any issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Ensure all prerequisites are installed correctly
3. Verify all three services are running: `.\check-services.ps1`
4. Check console logs in browser (F12) and terminal windows

---

## 🎯 Project Goals

This project demonstrates:
- ✅ Full-stack development with MERN
- ✅ Microservices architecture (Node + Java)
- ✅ RESTful API design
- ✅ JWT authentication & authorization
- ✅ Role-based access control
- ✅ Real-time data visualization
- ✅ PDF/Excel generation in Java
- ✅ Service-to-service communication
- ✅ Professional UI/UX design
- ✅ State management with Redux
- ✅ Responsive design principles

---

**Built with ❤️ for academic demonstration of MERN + Java microservices integration**

⭐ **Star this repo if you found it helpful!**
