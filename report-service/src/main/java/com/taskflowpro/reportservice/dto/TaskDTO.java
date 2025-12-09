package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Represents a single task in the report
 * Contains all task details and its assignees
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    
    @NotNull(message = "Task title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Priority is required")
    private String priority;  // "low", "medium", "high", "urgent"
    
    @NotNull(message = "Status is required")
    private String status;    // "pending", "in-progress", "completed"
    
    private String createdAt;  // ISO date string
    private String dueDate;    // ISO date string
    
    private List<AssigneeDTO> assignees;  // List of people assigned to this task
}
