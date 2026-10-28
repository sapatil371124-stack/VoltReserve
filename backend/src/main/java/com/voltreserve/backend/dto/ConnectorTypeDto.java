package com.voltreserve.backend.dto;

import java.math.BigDecimal;

public class ConnectorTypeDto {
    private Long id;
    private String code;
    private String name;
    private String currentType;
    private BigDecimal maxPowerKw;
    private String description;

    public ConnectorTypeDto() {}

    public ConnectorTypeDto(Long id, String code, String name, String currentType, BigDecimal maxPowerKw, String description) {
        this.id = id;
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
}
