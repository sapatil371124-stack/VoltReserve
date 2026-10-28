package com.voltreserve.backend.dto;

import java.math.BigDecimal;

public class VehicleDto {
    private Long id;
    private Long userId;
    private String make;
    private String model;
    private String variant;
    private String vehicleType;
    private BigDecimal batteryCapacityKwh;
    private BigDecimal maxChargingRateKw;
    private BigDecimal maxAcChargingRateKw;
    private BigDecimal maxDcChargingRateKw;
    private BigDecimal currentSocPercentage;
    private BigDecimal estimatedRangeKm;
    private BigDecimal energyConsumptionWhPerKm;
    private Boolean isDefault;
    private Long connectorTypeId;
    private String connectorTypeCode;
    private String connectorTypeName;
    private String licensePlate;

    public VehicleDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public BigDecimal getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(BigDecimal batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }
    public BigDecimal getMaxChargingRateKw() { return maxChargingRateKw; }
    public void setMaxChargingRateKw(BigDecimal maxChargingRateKw) { this.maxChargingRateKw = maxChargingRateKw; }
    public BigDecimal getMaxAcChargingRateKw() { return maxAcChargingRateKw; }
    public void setMaxAcChargingRateKw(BigDecimal maxAcChargingRateKw) { this.maxAcChargingRateKw = maxAcChargingRateKw; }
    public BigDecimal getMaxDcChargingRateKw() { return maxDcChargingRateKw; }
    public void setMaxDcChargingRateKw(BigDecimal maxDcChargingRateKw) { this.maxDcChargingRateKw = maxDcChargingRateKw; }
    public BigDecimal getCurrentSocPercentage() { return currentSocPercentage; }
    public void setCurrentSocPercentage(BigDecimal currentSocPercentage) { this.currentSocPercentage = currentSocPercentage; }
    public BigDecimal getEstimatedRangeKm() { return estimatedRangeKm; }
    public void setEstimatedRangeKm(BigDecimal estimatedRangeKm) { this.estimatedRangeKm = estimatedRangeKm; }
    public BigDecimal getEnergyConsumptionWhPerKm() { return energyConsumptionWhPerKm; }
    public void setEnergyConsumptionWhPerKm(BigDecimal energyConsumptionWhPerKm) { this.energyConsumptionWhPerKm = energyConsumptionWhPerKm; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    public Long getConnectorTypeId() { return connectorTypeId; }
    public void setConnectorTypeId(Long connectorTypeId) { this.connectorTypeId = connectorTypeId; }
    public String getConnectorTypeCode() { return connectorTypeCode; }
    public void setConnectorTypeCode(String connectorTypeCode) { this.connectorTypeCode = connectorTypeCode; }
    public String getConnectorTypeName() { return connectorTypeName; }
    public void setConnectorTypeName(String connectorTypeName) { this.connectorTypeName = connectorTypeName; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
}
