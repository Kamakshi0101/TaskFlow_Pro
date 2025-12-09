package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Request object for generating user productivity summary reports
 * This is what the Node backend sends when generating a user-specific PDF
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryReportRequest {
    
    @NotNull(message = "Generated timestamp is required")
    private String generatedAt;  // ISO timestamp
    
    @Valid
    @NotNull(message = "User information is required")
    private UserDTO user;  // User whose summary is being generated
    
    @Valid
    @NotNull(message = "User stats are required")
    private UserStatsDTO stats;  // Productivity statistics
    
    @Valid
    @NotNull(message = "Recent tasks list is required")
    private List<TaskDTO> recentTasks;  // List of user's recent tasks
}
