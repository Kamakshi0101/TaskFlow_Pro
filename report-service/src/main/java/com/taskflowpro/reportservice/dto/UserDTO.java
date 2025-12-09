package com.taskflowpro.reportservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/**
 * Represents a user in the user summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    @NotNull(message = "User name is required")
    private String name;
    
    @Email(message = "Valid email is required")
    @NotNull(message = "User email is required")
    private String email;
}
