package com.voltreserve.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String make;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(length = 50)
    private String variant;

    @Column(name = "battery_capacity_kwh", nullable = false, precision = 6, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(name = "max_charging_rate_kw", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxChargingRateKw;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "connector_type_id", nullable = false)
    private ConnectorType connectorType;

    @Column(name = "license_plate", nullable = false, length = 30)
    private String licensePlate;

    @Column(name = "vehicle_type", length = 30)
    private String vehicleType = "CAR";

    @Column(name = "max_ac_charging_rate_kw", precision = 6, scale = 2)
    private BigDecimal maxAcChargingRateKw;

    @Column(name = "max_dc_charging_rate_kw", precision = 6, scale = 2)
    private BigDecimal maxDcChargingRateKw;

    @Column(name = "current_soc_percentage", precision = 5, scale = 2)
    private BigDecimal currentSocPercentage;

    @Column(name = "estimated_range_km", precision = 6, scale = 2)
    private BigDecimal estimatedRangeKm;

    @Column(name = "energy_consumption_wh_per_km", precision = 6, scale = 2)
    private BigDecimal energyConsumptionWhPerKm;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Vehicle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }

    public BigDecimal getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(BigDecimal batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public BigDecimal getMaxChargingRateKw() { return maxChargingRateKw; }
    public void setMaxChargingRateKw(BigDecimal maxChargingRateKw) { this.maxChargingRateKw = maxChargingRateKw; }

    public ConnectorType getConnectorType() { return connectorType; }
    public void setConnectorType(ConnectorType connectorType) { this.connectorType = connectorType; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
