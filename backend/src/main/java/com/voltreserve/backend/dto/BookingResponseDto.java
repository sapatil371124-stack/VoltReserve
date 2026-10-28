package com.voltreserve.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDto {
    private Long id;
    private String bookingReference;
    private Long userId;
    private String userName;
    private String userEmail;

    // Station & Location
    private Long stationId;
    private String stationName;
    private String stationAddress;
    private String cityName;
    private BigDecimal stationLatitude;
    private BigDecimal stationLongitude;

    // Charger & Slot
    private Long chargerId;
    private String chargerCode;
    private String connectorTypeCode;
    private BigDecimal chargerPowerKw;
    private BigDecimal pricePerKwh;
    private Long slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Vehicle
    private Long vehicleId;
    private String vehicleInfo;
    private String vehicleType;
    private String licensePlate;
    private BigDecimal vehicleBatteryCapacityKwh;

    // Goal & Metrics
    private BigDecimal initialSocPercentage;
    private BigDecimal targetSocPercentage;
    private Integer chargingDurationMinutes;
    private BigDecimal tariffSnapshot;
    private BigDecimal rangeAddedKm;

    // Financials & Status
    private BigDecimal estimatedKwh;
    private BigDecimal baseAmount;
    private BigDecimal gstAmount;
    private BigDecimal platformFee;
    private BigDecimal totalAmount;
    private String status; // HELD, CONFIRMED, OCCUPIED, COMPLETED, CANCELLED, EXPIRED
    private LocalDateTime holdExpiresAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;

    // Cryptographic Blockchain Proof
    private String blockchainHash;
    private String previousHash;
    private Long blockIndex;
    private String blockchainStatus; // VERIFIED, TAMPER_DETECTED, PENDING

    public BookingResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public String getStationAddress() { return stationAddress; }
    public void setStationAddress(String stationAddress) { this.stationAddress = stationAddress; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public BigDecimal getStationLatitude() { return stationLatitude; }
    public void setStationLatitude(BigDecimal stationLatitude) { this.stationLatitude = stationLatitude; }
    public BigDecimal getStationLongitude() { return stationLongitude; }
    public void setStationLongitude(BigDecimal stationLongitude) { this.stationLongitude = stationLongitude; }
    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }
    public String getChargerCode() { return chargerCode; }
    public void setChargerCode(String chargerCode) { this.chargerCode = chargerCode; }
    public String getConnectorTypeCode() { return connectorTypeCode; }
    public void setConnectorTypeCode(String connectorTypeCode) { this.connectorTypeCode = connectorTypeCode; }
    public BigDecimal getChargerPowerKw() { return chargerPowerKw; }
    public void setChargerPowerKw(BigDecimal chargerPowerKw) { this.chargerPowerKw = chargerPowerKw; }
    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getVehicleInfo() { return vehicleInfo; }
    public void setVehicleInfo(String vehicleInfo) { this.vehicleInfo = vehicleInfo; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public BigDecimal getVehicleBatteryCapacityKwh() { return vehicleBatteryCapacityKwh; }
    public void setVehicleBatteryCapacityKwh(BigDecimal vehicleBatteryCapacityKwh) { this.vehicleBatteryCapacityKwh = vehicleBatteryCapacityKwh; }
    public BigDecimal getInitialSocPercentage() { return initialSocPercentage; }
    public void setInitialSocPercentage(BigDecimal initialSocPercentage) { this.initialSocPercentage = initialSocPercentage; }
    public BigDecimal getTargetSocPercentage() { return targetSocPercentage; }
    public void setTargetSocPercentage(BigDecimal targetSocPercentage) { this.targetSocPercentage = targetSocPercentage; }
    public Integer getChargingDurationMinutes() { return chargingDurationMinutes; }
    public void setChargingDurationMinutes(Integer chargingDurationMinutes) { this.chargingDurationMinutes = chargingDurationMinutes; }
    public BigDecimal getTariffSnapshot() { return tariffSnapshot; }
    public void setTariffSnapshot(BigDecimal tariffSnapshot) { this.tariffSnapshot = tariffSnapshot; }
    public BigDecimal getRangeAddedKm() { return rangeAddedKm; }
    public void setRangeAddedKm(BigDecimal rangeAddedKm) { this.rangeAddedKm = rangeAddedKm; }
    public BigDecimal getEstimatedKwh() { return estimatedKwh; }
    public void setEstimatedKwh(BigDecimal estimatedKwh) { this.estimatedKwh = estimatedKwh; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
    public BigDecimal getGstAmount() { return gstAmount; }
    public void setGstAmount(BigDecimal gstAmount) { this.gstAmount = gstAmount; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getHoldExpiresAt() { return holdExpiresAt; }
    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) { this.holdExpiresAt = holdExpiresAt; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getBlockchainHash() { return blockchainHash; }
    public void setBlockchainHash(String blockchainHash) { this.blockchainHash = blockchainHash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public Long getBlockIndex() { return blockIndex; }
    public void setBlockIndex(Long blockIndex) { this.blockIndex = blockIndex; }
    public String getBlockchainStatus() { return blockchainStatus; }
    public void setBlockchainStatus(String blockchainStatus) { this.blockchainStatus = blockchainStatus; }
}
