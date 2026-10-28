package com.voltreserve.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChargingStationDto {
    private Long id;
    private String name;
    private String description;
    private String operatingHours;
    private String amenities;
    private BigDecimal rating;
    private Boolean isActive;
    private String contactPhone;
    private LocationDto location;
    private List<ChargerDto> chargers = new ArrayList<>();

    // Dynamic metrics
    private Double distanceKm;
    private Integer estimatedTravelMinutes;
    private Integer availableChargersCount;
    private Integer totalChargersCount;
    private BigDecimal minPricePerKwh;
    private BigDecimal maxPowerKw;
    private List<String> supportedConnectors = new ArrayList<>();
    private LocalDateTime nextAvailableSlotTime;
    private Integer estimatedChargingMinutes;
    private BigDecimal estimatedCost;

    public ChargingStationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public LocationDto getLocation() { return location; }
    public void setLocation(LocationDto location) { this.location = location; }
    public List<ChargerDto> getChargers() { return chargers; }
    public void setChargers(List<ChargerDto> chargers) { this.chargers = chargers; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getEstimatedTravelMinutes() { return estimatedTravelMinutes; }
    public void setEstimatedTravelMinutes(Integer estimatedTravelMinutes) { this.estimatedTravelMinutes = estimatedTravelMinutes; }
    public Integer getAvailableChargersCount() { return availableChargersCount; }
    public void setAvailableChargersCount(Integer availableChargersCount) { this.availableChargersCount = availableChargersCount; }
    public Integer getTotalChargersCount() { return totalChargersCount; }
    public void setTotalChargersCount(Integer totalChargersCount) { this.totalChargersCount = totalChargersCount; }
    public BigDecimal getMinPricePerKwh() { return minPricePerKwh; }
    public void setMinPricePerKwh(BigDecimal minPricePerKwh) { this.minPricePerKwh = minPricePerKwh; }
    public BigDecimal getMaxPowerKw() { return maxPowerKw; }
    public void setMaxPowerKw(BigDecimal maxPowerKw) { this.maxPowerKw = maxPowerKw; }
    public List<String> getSupportedConnectors() { return supportedConnectors; }
    public void setSupportedConnectors(List<String> supportedConnectors) { this.supportedConnectors = supportedConnectors; }
    public LocalDateTime getNextAvailableSlotTime() { return nextAvailableSlotTime; }
    public void setNextAvailableSlotTime(LocalDateTime nextAvailableSlotTime) { this.nextAvailableSlotTime = nextAvailableSlotTime; }
    public Integer getEstimatedChargingMinutes() { return estimatedChargingMinutes; }
    public void setEstimatedChargingMinutes(Integer estimatedChargingMinutes) { this.estimatedChargingMinutes = estimatedChargingMinutes; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
}
