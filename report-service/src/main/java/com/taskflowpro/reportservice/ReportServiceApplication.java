package com.taskflowpro.reportservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the TaskFlowPro Report Service
 * 
 * @SpringBootApplication is a convenience annotation that combines:
 *   - @Configuration: Tags the class as a source of bean definitions
 *   - @EnableAutoConfiguration: Tells Spring Boot to automatically configure based on dependencies
 *   - @ComponentScan: Tells Spring to scan for components, configurations, and services
 */
@SpringBootApplication
public class ReportServiceApplication {
    
    /**
     * Main method - starts the Spring Boot application
     * 
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        // SpringApplication.run() launches the application
        // It creates the ApplicationContext, registers beans, and starts the embedded server
        SpringApplication.run(ReportServiceApplication.class, args);
        
        System.out.println("\n========================================");
        System.out.println("TaskFlowPro Report Service Started!");
        System.out.println("Running on: http://localhost:8085");
        System.out.println("Health check: http://localhost:8085/api/report/health");
        System.out.println("========================================\n");
    }
}
