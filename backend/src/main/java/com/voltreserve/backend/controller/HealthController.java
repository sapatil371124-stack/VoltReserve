package com.voltreserve.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("application", "VoltReserve");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> components = new LinkedHashMap<>();
        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                components.put("database", "UP");
            } catch (Exception ex) {
                components.put("database", "DOWN");
                response.put("status", "DEGRADED");
            }
        }
        response.put("components", components);

        return ResponseEntity.ok(response);
    }
}
