package com.voltreserve.backend.dto;

import java.math.BigDecimal;

public class ChargerDto {
    private Long id;
    private Long stationId;
    private String stationName;
    private Long connectorTypeId;
    private String connectorTypeCode;
    private String connectorTypeName;
    private String identifierCode;
    private BigDecimal powerOutputKw;
    private String currentType;
    private BigDecimal pricePerKwh;
    private String status;
    private long availableSlotsCount;

    public ChargerDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public Long getConnectorTypeId() { return connectorTypeId; }
    public void setConnectorTypeId(Long connectorTypeId) { this.connectorTypeId = connectorTypeId; }
    public String getConnectorTypeCode() { return connectorTypeCode; }
    public void setConnectorTypeCode(String connectorTypeCode) { this.connectorTypeCode = connectorTypeCode; }
    public String getConnectorTypeName() { return connectorTypeName; }
    public void setConnectorTypeName(String connectorTypeName) { this.connectorTypeName = connectorTypeName; }
    public String getIdentifierCode() { return identifierCode; }
    public void setIdentifierCode(String identifierCode) { this.identifierCode = identifierCode; }
    public BigDecimal getPowerOutputKw() { return powerOutputKw; }
    public void setPowerOutputKw(BigDecimal powerOutputKw) { this.powerOutputKw = powerOutputKw; }
    public String getCurrentType() { return currentType; }
    public void setCurrentType(String currentType) { this.currentType = currentType; }
    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getAvailableSlotsCount() { return availableSlotsCount; }
    public void setAvailableSlotsCount(long availableSlotsCount) { this.availableSlotsCount = availableSlotsCount; }
}
