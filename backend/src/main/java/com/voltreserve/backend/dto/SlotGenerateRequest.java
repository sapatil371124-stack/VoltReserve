package com.voltreserve.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class SlotGenerateRequest {
    @NotNull(message = "Charger ID is required")
    private Long chargerId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private int startHour = 8;
    private int endHour = 22;
    private int durationMinutes = 30;

    public SlotGenerateRequest() {}

    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public int getStartHour() { return startHour; }
    public void setStartHour(int startHour) { this.startHour = startHour; }
    public int getEndHour() { return endHour; }
    public void setEndHour(int endHour) { this.endHour = endHour; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
}
