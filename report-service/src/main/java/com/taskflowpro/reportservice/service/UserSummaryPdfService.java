package com.taskflowpro.reportservice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.taskflowpro.reportservice.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

/**
 * Service for generating user productivity summary PDFs
 * Shows individual user statistics and recent tasks
 */
@Service
public class UserSummaryPdfService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserSummaryPdfService.class);
    
    // Font definitions
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
    private static final Font HEADING_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, Color.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
    private static final Font KPI_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLACK);
    
    /**
     * Generates a user productivity summary PDF
     * 
     * @param request The user summary request with stats and tasks
     * @return byte array containing the PDF file
     * @throws Exception if PDF generation fails
     */
    public byte[] generateUserSummaryPdf(UserSummaryReportRequest request) throws Exception {
        logger.info("Generating user summary PDF for {}", request.getUser().getName());
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();
            
            // Add title
            addTitle(document);
            document.add(new Paragraph(" ")); // Spacer
            
            // Add user information
            addUserInfo(document, request.getUser());
            document.add(new Paragraph(" ")); // Spacer
            
            // Add generation timestamp
            addTimestamp(document, request.getGeneratedAt());
            document.add(new Paragraph(" ")); // Spacer
            
            // Add KPI boxes (statistics)
            addKpiBoxes(document, request.getStats());
            document.add(new Paragraph(" ")); // Spacer
            
            // Add recent tasks section
            addRecentTasksSection(document, request.getRecentTasks());
            
            // Add footer
            addFooter(document);
            
            logger.info("User summary PDF generated successfully");
            
        } finally {
            document.close();
        }
        
        return outputStream.toByteArray();
    }
    
    /**
     * Adds the main title
     */
    private void addTitle(Document document) throws DocumentException {
        Paragraph title = new Paragraph("User Productivity Summary", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
    }
    
    /**
     * Adds user information (name and email)
     */
    private void addUserInfo(Document document, UserDTO user) throws DocumentException {
        Paragraph userInfo = new Paragraph();
        userInfo.add(new Chunk("User: ", HEADING_FONT));
        userInfo.add(new Chunk(user.getName(), NORMAL_FONT));
        userInfo.add(Chunk.NEWLINE);
        userInfo.add(new Chunk("Email: ", HEADING_FONT));
        userInfo.add(new Chunk(user.getEmail(), NORMAL_FONT));
        userInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(userInfo);
    }
    
    /**
     * Adds generation timestamp
     */
    private void addTimestamp(Document document, String generatedAt) throws DocumentException {
        Paragraph timestamp = new Paragraph("Generated: " + formatDateTime(generatedAt), SMALL_FONT);
        timestamp.setAlignment(Element.ALIGN_CENTER);
        document.add(timestamp);
    }
    
    /**
     * Adds KPI boxes showing key statistics
     */
    private void addKpiBoxes(Document document, UserStatsDTO stats) throws DocumentException {
        // Create a table with 4 columns for the KPI boxes
        PdfPTable kpiTable = new PdfPTable(4);
        kpiTable.setWidthPercentage(100);
        kpiTable.setSpacingBefore(10f);
        kpiTable.setSpacingAfter(10f);
        
        // Add KPI cells
        addKpiCell(kpiTable, "Total Assigned", stats.getAssigned().toString(), new Color(100, 149, 237)); // Cornflower blue
        addKpiCell(kpiTable, "Completed", stats.getCompleted().toString(), new Color(60, 179, 113));      // Medium sea green
        addKpiCell(kpiTable, "In Progress", stats.getInProgress().toString(), new Color(255, 165, 0));    // Orange
        addKpiCell(kpiTable, "Pending", stats.getPending().toString(), new Color(220, 20, 60));          // Crimson
        
        document.add(kpiTable);
        
        // Calculate completion rate
        if (stats.getAssigned() > 0) {
            double completionRate = (stats.getCompleted() * 100.0) / stats.getAssigned();
            Paragraph completionText = new Paragraph(
                String.format("Completion Rate: %.1f%%", completionRate),
                HEADING_FONT
            );
            completionText.setAlignment(Element.ALIGN_CENTER);
            document.add(completionText);
        }
    }
    
    /**
     * Adds a single KPI cell (styled box with label and value)
     */
    private void addKpiCell(PdfPTable table, String label, String value, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(12);
        cell.setBackgroundColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), 50)); // Light version
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        Paragraph content = new Paragraph();
        content.add(new Chunk(label + "\n", NORMAL_FONT));
        content.add(new Chunk(value, KPI_FONT));
        content.setAlignment(Element.ALIGN_CENTER);
        
        cell.addElement(content);
        table.addCell(cell);
    }
    
    /**
     * Adds recent tasks section with table
     */
    private void addRecentTasksSection(Document document, java.util.List<TaskDTO> recentTasks) throws DocumentException {
        // Section heading
        Paragraph heading = new Paragraph("Recent Tasks", HEADING_FONT);
        heading.setSpacingBefore(10f);
        document.add(heading);
        document.add(new Paragraph(" ")); // Spacer
        
        if (recentTasks == null || recentTasks.isEmpty()) {
            Paragraph noTasks = new Paragraph("No recent tasks to display.", NORMAL_FONT);
            document.add(noTasks);
            return;
        }
        
        // Create table with 5 columns
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 1.5f, 1.5f, 1.5f, 1.5f});
        
        // Add header
        addRecentTasksHeader(table);
        
        // Add rows
        int rowNum = 0;
        for (TaskDTO task : recentTasks) {
            addRecentTaskRow(table, task, rowNum % 2 == 0);
            rowNum++;
        }
        
        document.add(table);
    }
    
    /**
     * Adds header for recent tasks table
     */
    private void addRecentTasksHeader(PdfPTable table) {
        String[] headers = {"Task Title", "Priority", "Status", "Due Date", "Progress"};
        
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADING_FONT));
            cell.setBackgroundColor(new Color(70, 130, 180));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }
    
    /**
     * Adds a row for a recent task
     */
    private void addRecentTaskRow(PdfPTable table, TaskDTO task, boolean isEvenRow) {
        Color backgroundColor = isEvenRow ? Color.WHITE : new Color(245, 245, 245);
        
        // Task Title
        table.addCell(createCell(task.getTitle(), backgroundColor));
        
        // Priority
        PdfPCell priorityCell = createCell(capitalizeFirst(task.getPriority()), backgroundColor);
        priorityCell.setBackgroundColor(getPriorityColor(task.getPriority()));
        table.addCell(priorityCell);
        
        // Status
        PdfPCell statusCell = createCell(capitalizeFirst(task.getStatus()), backgroundColor);
        statusCell.setBackgroundColor(getStatusColor(task.getStatus()));
        table.addCell(statusCell);
        
        // Due Date
        table.addCell(createCell(formatDate(task.getDueDate()), backgroundColor));
        
        // Progress (get from first assignee if available)
        String progress = getTaskProgress(task);
        table.addCell(createCell(progress, backgroundColor));
    }
    
    /**
     * Helper to create table cell
     */
    private PdfPCell createCell(String text, Color backgroundColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, SMALL_FONT));
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(6);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }
    
    /**
     * Gets task progress from assignees
     */
    private String getTaskProgress(TaskDTO task) {
        if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
            AssigneeDTO assignee = task.getAssignees().get(0);
            if (assignee.getProgress() != null) {
                return assignee.getProgress() + "%";
            }
        }
        return "-";
    }
    
    /**
     * Returns color for priority
     */
    private Color getPriorityColor(String priority) {
        return switch (priority.toLowerCase()) {
            case "urgent" -> new Color(255, 200, 200);
            case "high" -> new Color(255, 220, 200);
            case "medium" -> new Color(255, 255, 200);
            case "low" -> new Color(200, 255, 200);
            default -> Color.WHITE;
        };
    }
    
    /**
     * Returns color for status
     */
    private Color getStatusColor(String status) {
        return switch (status.toLowerCase()) {
            case "completed" -> new Color(200, 255, 200);
            case "in-progress" -> new Color(200, 220, 255);
            case "pending" -> new Color(255, 255, 200);
            default -> Color.WHITE;
        };
    }
    
    /**
     * Formats date string
     */
    private String formatDate(String isoDate) {
        if (isoDate == null || isoDate.isEmpty()) {
            return "-";
        }
        try {
            return isoDate.substring(0, 10);
        } catch (Exception e) {
            return isoDate;
        }
    }
    
    /**
     * Formats datetime string
     */
    private String formatDateTime(String isoDateTime) {
        if (isoDateTime == null || isoDateTime.isEmpty()) {
            return "-";
        }
        try {
            return isoDateTime.replace("T", " ").substring(0, 19);
        } catch (Exception e) {
            return isoDateTime;
        }
    }
    
    /**
     * Capitalizes first letter
     */
    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
    
    /**
     * Adds footer
     */
    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph("\n\nTaskFlowPro - Task Management System", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }
}
