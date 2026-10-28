package com.voltreserve.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "connector_types")
public class ConnectorType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "current_type", nullable = false, length = 10)
    private String currentType;

    @Column(name = "max_power_kw", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxPowerKw;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public ConnectorType() {}

    public ConnectorType(String code, String name, String currentType, BigDecimal maxPowerKw, String description) {
        this.code = code;
        this.name = name;
        this.currentType = currentType;
        this.maxPowerKw = maxPowerKw;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrentType() { return currentType; }
    public void setCurrentType(String currentType) { this.currentType = currentType; }

    public BigDecimal getMaxPowerKw() { return maxPowerKw; }
    public void setMaxPowerKw(BigDecimal maxPowerKw) { this.maxPowerKw = maxPowerKw; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
