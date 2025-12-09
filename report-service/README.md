# TaskFlowPro Report Service

A Spring Boot microservice for generating PDF and Excel reports from task data.

## 📋 Overview

This Java microservice provides report generation capabilities for the TaskFlowPro task management system. It receives task data as JSON from the Node.js backend and generates formatted PDF and Excel reports.

## 🛠️ Technologies

- **Java**: 17
- **Framework**: Spring Boot 3.2.1
- **Build Tool**: Maven
- **PDF Generation**: OpenPDF 1.3.34
- **Excel Generation**: Apache POI 5.2.5
- **API**: RESTful endpoints

## 📁 Project Structure

```
report-service/
├── pom.xml                          # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/taskflowpro/reportservice/
│   │   │   ├── ReportServiceApplication.java  # Main entry point
│   │   │   ├── controller/
│   │   │   │   └── ReportController.java      # REST endpoints
│   │   │   ├── service/
│   │   │   │   ├── TaskPdfService.java        # PDF generation logic
│   │   │   │   ├── TaskExcelService.java      # Excel generation logic
│   │   │   │   └── UserSummaryPdfService.java # User summary PDFs
│   │   │   └── dto/
│   │   │       ├── ReportRequest.java         # Task report request
│   │   │       ├── TaskDTO.java               # Task data structure
│   │   │       ├── AssigneeDTO.java           # Assignee data structure
│   │   │       ├── FilterDTO.java             # Filter criteria
│   │   │       ├── UserSummaryReportRequest.java
│   │   │       ├── UserDTO.java
│   │   │       └── UserStatsDTO.java
│   │   └── resources/
│   │       └── application.properties         # Configuration
│   └── test/
│       └── java/...                           # Unit tests (optional)
└── README.md
```

## 🚀 Prerequisites

Before running this service, ensure you have:

1. **Java Development Kit (JDK) 17 or higher**
   - Check: `java -version`
   - Download from: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/

2. **Maven 3.6 or higher**
   - Check: `mvn -version`
   - Download from: https://maven.apache.org/download.cgi
   - Or use the included Maven wrapper (see below)

## 📦 Building the Project

### Option 1: Using Maven (if installed)

```bash
cd report-service
mvn clean install
```

### Option 2: Using Maven Wrapper (recommended if Maven not installed)

```bash
cd report-service
./mvnw clean install    # On Unix/Mac/Linux
mvnw.cmd clean install  # On Windows
```

This will:
- Download all dependencies
- Compile the code
- Run tests (if any)
- Package the application as a JAR file in `target/` folder

## ▶️ Running the Service

### Option 1: Using Maven

```bash
cd report-service
mvn spring-boot:run
```

### Option 2: Using Maven Wrapper

```bash
cd report-service
./mvnw spring-boot:run    # On Unix/Mac/Linux
mvnw.cmd spring-boot:run  # On Windows
```

### Option 3: Running the JAR file directly

```bash
cd report-service
mvn clean package
java -jar target/report-service-1.0.0.jar
```

The service will start on **port 8085** by default.

You should see:
```
========================================
TaskFlowPro Report Service Started!
Running on: http://localhost:8085
Health check: http://localhost:8085/api/report/health
========================================
```

## 🔌 API Endpoints

### Health Check
- **URL**: `GET http://localhost:8085/api/report/health`
- **Purpose**: Verify the service is running
- **Response**: Plain text with timestamp

### Generate Task Report (PDF)
- **URL**: `POST http://localhost:8085/api/report/tasks/pdf`
- **Content-Type**: `application/json`
- **Request Body**: See [Task Report JSON Format](#task-report-json-format)
- **Response**: PDF file download

### Generate Task Report (Excel)
- **URL**: `POST http://localhost:8085/api/report/tasks/excel`
- **Content-Type**: `application/json`
- **Request Body**: See [Task Report JSON Format](#task-report-json-format)
- **Response**: Excel (.xlsx) file download

### Generate User Summary (PDF)
- **URL**: `POST http://localhost:8085/api/report/user-summary/pdf`
- **Content-Type**: `application/json`
- **Request Body**: See [User Summary JSON Format](#user-summary-json-format)
- **Response**: PDF file download

## 📝 JSON Request Formats

### Task Report JSON Format

```json
{
  "title": "Workspace Task Report",
  "generatedAt": "2025-12-09T12:00:00Z",
  "generatedBy": "Admin Name",
  "filters": {
    "dateFrom": "2025-12-01",
    "dateTo": "2025-12-09",
    "priority": ["high", "medium"],
    "status": ["pending", "in-progress", "completed"]
  },
  "tasks": [
    {
      "title": "Design Homepage",
      "description": "Create initial design mockups",
      "priority": "high",
      "status": "in-progress",
      "createdAt": "2025-12-02T10:00:00Z",
      "dueDate": "2025-12-10T23:59:59Z",
      "assignees": [
        {
          "name": "John Doe",
          "email": "john@example.com",
          "status": "in-progress",
          "progress": 60
        },
        {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "status": "pending",
          "progress": 0
        }
      ]
    }
  ]
}
```

### User Summary JSON Format

```json
{
  "generatedAt": "2025-12-09T12:00:00Z",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "assigned": 10,
    "completed": 7,
    "pending": 2,
    "inProgress": 1
  },
  "recentTasks": [
    {
      "title": "Design Homepage",
      "description": "Create initial design",
      "priority": "high",
      "status": "in-progress",
      "createdAt": "2025-12-02",
      "dueDate": "2025-12-10",
      "assignees": [
        {
          "name": "John Doe",
          "email": "john@example.com",
          "status": "in-progress",
          "progress": 60
        }
      ]
    }
  ]
}
```

## 🧪 Testing with cURL

### Test Health Check
```bash
curl http://localhost:8085/api/report/health
```

### Test PDF Generation
```bash
curl -X POST http://localhost:8085/api/report/tasks/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Report",
    "generatedAt": "2025-12-09T12:00:00Z",
    "generatedBy": "Test User",
    "filters": null,
    "tasks": [
      {
        "title": "Sample Task",
        "description": "Test task",
        "priority": "high",
        "status": "pending",
        "createdAt": "2025-12-01",
        "dueDate": "2025-12-15",
        "assignees": [
          {
            "name": "Test User",
            "email": "test@example.com",
            "status": "pending",
            "progress": 0
          }
        ]
      }
    ]
  }' \
  --output test-report.pdf
```

## 🔗 Integration with Node.js Backend

This service is designed to be called by your Node.js backend, not directly from the frontend.

**Architecture:**
```
Frontend (React) 
    ↓ (HTTP request)
Node.js Backend (Express) 
    ↓ (HTTP request to Java service)
Java Report Service (Spring Boot)
```

The Node.js backend should:
1. Query MongoDB for tasks
2. Transform data into the required JSON format
3. Send HTTP POST request to this Java service
4. Receive the PDF/Excel file
5. Stream it back to the frontend as a download

See the Node.js integration code in the main documentation.

## ⚙️ Configuration

Configuration is in `src/main/resources/application.properties`:

- **Port**: `server.port=8085` (change if needed)
- **Logging**: Adjust logging levels
- **File size limits**: Currently set to 10MB

## 🐛 Troubleshooting

### "java: command not found"
- Install JDK 17 or higher
- Make sure `JAVA_HOME` environment variable is set

### "mvn: command not found"
- Install Maven or use the Maven wrapper (`./mvnw` or `mvnw.cmd`)

### Port 8085 already in use
- Change the port in `application.properties`
- Or stop the process using port 8085

### PDF/Excel generation fails
- Check the logs for detailed error messages
- Verify the JSON request format matches the DTOs
- Ensure all required fields are provided

## 📚 Technology Documentation

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [OpenPDF Documentation](https://github.com/LibrePDF/OpenPDF)
- [Apache POI Documentation](https://poi.apache.org/components/spreadsheet/)

## 🎓 Learning Resources

If you're new to Java/Maven:
- [Java Tutorial for Beginners](https://www.youtube.com/watch?v=eIrMbAQSU34)
- [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)
- [Spring Boot Quickstart](https://spring.io/quickstart)

## 📄 License

Part of the TaskFlowPro project.
