package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * Represents filters applied to the report
 * Used to show what criteria were used to generate the report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterDTO {
    
    private String dateFrom;  // ISO date string
    private String dateTo;    // ISO date string
    private List<String> priority;  // e.g., ["high", "medium"]
    private List<String> status;    // e.g., ["pending", "in-progress", "completed"]
}
