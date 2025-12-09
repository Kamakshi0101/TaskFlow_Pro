package com.taskflowpro.reportservice.controller;

import com.taskflowpro.reportservice.dto.ReportRequest;
import com.taskflowpro.reportservice.dto.UserSummaryReportRequest;
import com.taskflowpro.reportservice.service.TaskExcelService;
import com.taskflowpro.reportservice.service.TaskPdfService;
import com.taskflowpro.reportservice.service.UserSummaryPdfService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * REST Controller for report generation endpoints
 * Handles HTTP requests from Node backend and returns PDF/Excel files
 */
@RestController  // Combines @Controller and @ResponseBody
@RequestMapping("/api/report")  // Base path for all endpoints in this controller
@CrossOrigin(origins = "http://localhost:5000")  // Allow requests from Node backend
public class ReportController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    // Inject services using Spring's dependency injection
    @Autowired
    private TaskPdfService taskPdfService;
    
    @Autowired
    private TaskExcelService taskExcelService;
    
    @Autowired
    private UserSummaryPdfService userSummaryPdfService;
    
    /**
     * Health check endpoint to verify service is running
     * GET http://localhost:8085/api/report/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("Health check requested");
        return ResponseEntity.ok("Report Service is running - " + LocalDateTime.now());
    }
    
    /**
     * Generates a PDF report of tasks
     * POST http://localhost:8085/api/report/tasks/pdf
     * 
     * Request Body: ReportRequest JSON
     * Response: PDF file as binary stream
     */
    @PostMapping("/tasks/pdf")
    public ResponseEntity<byte[]> generateTaskPdf(@Valid @RequestBody ReportRequest request) {
        try {
            logger.info("Received request to generate task PDF report");
            
            // Call service to generate PDF
            byte[] pdfBytes = taskPdfService.generateTaskReportPdf(request);
            
            // Create filename with timestamp
            String filename = "tasks-report-" + getCurrentTimestamp() + ".pdf";
            
            // Set response headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            logger.info("Task PDF report generated successfully: {}", filename);
            
            // Return PDF file with 200 OK status
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error generating task PDF report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Generates an Excel report of tasks
     * POST http://localhost:8085/api/report/tasks/excel
     * 
     * Request Body: ReportRequest JSON
     * Response: Excel file as binary stream
     */
    @PostMapping("/tasks/excel")
    public ResponseEntity<byte[]> generateTaskExcel(@Valid @RequestBody ReportRequest request) {
        try {
            logger.info("Received request to generate task Excel report");
            
            // Call service to generate Excel
            byte[] excelBytes = taskExcelService.generateTaskReportExcel(request);
            
            // Create filename with timestamp
            String filename = "tasks-report-" + getCurrentTimestamp() + ".xlsx";
            
            // Set response headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);
            
            logger.info("Task Excel report generated successfully: {}", filename);
            
            // Return Excel file with 200 OK status
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error generating task Excel report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Generates a user productivity summary PDF
     * POST http://localhost:8085/api/report/user-summary/pdf
     * 
     * Request Body: UserSummaryReportRequest JSON
     * Response: PDF file as binary stream
     */
    @PostMapping("/user-summary/pdf")
    public ResponseEntity<byte[]> generateUserSummaryPdf(@Valid @RequestBody UserSummaryReportRequest request) {
        try {
            logger.info("Received request to generate user summary PDF for {}", request.getUser().getName());
            
            // Call service to generate PDF
            byte[] pdfBytes = userSummaryPdfService.generateUserSummaryPdf(request);
            
            // Create filename with user name and timestamp
            String sanitizedName = request.getUser().getName().replaceAll("[^a-zA-Z0-9]", "-");
            String filename = "user-summary-" + sanitizedName + "-" + getCurrentTimestamp() + ".pdf";
            
            // Set response headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            logger.info("User summary PDF generated successfully: {}", filename);
            
            // Return PDF file with 200 OK status
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error generating user summary PDF", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Helper method to generate timestamp for filenames
     * Format: YYYYMMDD-HHMMSS
     */
    private String getCurrentTimestamp() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
        return LocalDateTime.now().format(formatter);
    }
}
