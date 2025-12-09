package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Main request object for generating task reports (PDF or Excel)
 * This is what the Node backend sends to the Java service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    
    @NotNull(message = "Report title is required")
    private String title;  // e.g., "Workspace Task Report"
    
    @NotNull(message = "Generated timestamp is required")
    private String generatedAt;  // ISO timestamp
    
    @NotNull(message = "Generator name is required")
    private String generatedBy;  // Name of person generating report
    
    private FilterDTO filters;  // Optional: what filters were applied
    
    @Valid  // Validates each TaskDTO in the list
    @NotNull(message = "Tasks list is required")
    private List<TaskDTO> tasks;  // List of tasks to include in report
}
