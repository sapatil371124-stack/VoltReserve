package com.voltreserve.backend.dto;

import java.time.LocalDateTime;

public class ChargingSlotDto {
    private Long id;
    private Long chargerId;
    private String chargerCode;
    private String connectorTypeCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // AVAILABLE, HELD, BOOKED, OCCUPIED, COMPLETED, CANCELLED, EXPIRED
    private LocalDateTime holdExpiresAt;
    private boolean isHeldByCurrentUser;
    private Integer version;

    public ChargingSlotDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }
    public String getChargerCode() { return chargerCode; }
    public void setChargerCode(String chargerCode) { this.chargerCode = chargerCode; }
    public String getConnectorTypeCode() { return connectorTypeCode; }
    public void setConnectorTypeCode(String connectorTypeCode) { this.connectorTypeCode = connectorTypeCode; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getHoldExpiresAt() { return holdExpiresAt; }
    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) { this.holdExpiresAt = holdExpiresAt; }
    public boolean isHeldByCurrentUser() { return isHeldByCurrentUser; }
    public void setHeldByCurrentUser(boolean heldByCurrentUser) { isHeldByCurrentUser = heldByCurrentUser; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
