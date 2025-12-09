package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * Represents statistics for a user's productivity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    
    @NotNull(message = "Assigned count is required")
    private Integer assigned;
    
    @NotNull(message = "Completed count is required")
    private Integer completed;
    
    @NotNull(message = "Pending count is required")
    private Integer pending;
    
    @NotNull(message = "In-progress count is required")
    private Integer inProgress;
}
