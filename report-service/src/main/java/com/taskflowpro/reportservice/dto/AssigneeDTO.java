package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/**
 * Represents an assignee within a task
 * Each assignee has their own status and progress on the task
 */
@Data  // Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // Lombok: generates no-arg constructor
@AllArgsConstructor  // Lombok: generates constructor with all fields
public class AssigneeDTO {
    
    @NotNull(message = "Assignee name is required")
    private String name;
    
    @Email(message = "Valid email is required")
    @NotNull(message = "Assignee email is required")
    private String email;
    
    @NotNull(message = "Assignee status is required")
    private String status;  // "pending", "in-progress", "completed"
    
    private Integer progress;  // 0-100
}
