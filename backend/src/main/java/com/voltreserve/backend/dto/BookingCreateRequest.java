package com.voltreserve.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingCreateRequest {
    private Long slotId;
    private Long chargerId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private Integer durationMinutes;
    private Long vehicleId;
    private BigDecimal initialSocPercentage;
    private BigDecimal targetSocPercentage;
    private String paymentMethod = "UPI";

    public BookingCreateRequest() {}

    public BookingCreateRequest(Long slotId, Long vehicleId, String paymentMethod) {
        this.slotId = slotId;
        this.vehicleId = vehicleId;
        this.paymentMethod = paymentMethod;
    }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public BigDecimal getInitialSocPercentage() { return initialSocPercentage; }
    public void setInitialSocPercentage(BigDecimal initialSocPercentage) { this.initialSocPercentage = initialSocPercentage; }

    public BigDecimal getTargetSocPercentage() { return targetSocPercentage; }
    public void setTargetSocPercentage(BigDecimal targetSocPercentage) { this.targetSocPercentage = targetSocPercentage; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
