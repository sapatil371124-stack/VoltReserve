package com.voltreserve.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FlexibleIntervalDto {
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private String timeLabel;
    private int durationMinutes;
    private boolean available;
    private String conflictReason;
    private Long chargerId;
    private BigDecimal powerKw;
    private BigDecimal pricePerKwh;

    public FlexibleIntervalDto() {}

    public FlexibleIntervalDto(LocalDateTime startTime, LocalDateTime endTime, String timeLabel, int durationMinutes, boolean available, String conflictReason, Long chargerId, BigDecimal powerKw, BigDecimal pricePerKwh) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeLabel = timeLabel;
        this.durationMinutes = durationMinutes;
        this.available = available;
        this.conflictReason = conflictReason;
        this.chargerId = chargerId;
        this.powerKw = powerKw;
        this.pricePerKwh = pricePerKwh;
    }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getConflictReason() { return conflictReason; }
    public void setConflictReason(String conflictReason) { this.conflictReason = conflictReason; }

    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }

    public BigDecimal getPowerKw() { return powerKw; }
    public void setPowerKw(BigDecimal powerKw) { this.powerKw = powerKw; }

    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }
}
