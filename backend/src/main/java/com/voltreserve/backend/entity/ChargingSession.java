package com.voltreserve.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_sessions")
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charger_id", nullable = false)
    private Charger charger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "start_meter_kwh", nullable = false, precision = 10, scale = 2)
    private BigDecimal startMeterKwh = BigDecimal.ZERO;

    @Column(name = "end_meter_kwh", nullable = false, precision = 10, scale = 2)
    private BigDecimal endMeterKwh = BigDecimal.ZERO;

    @Column(name = "total_kwh_delivered", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalKwhDelivered = BigDecimal.ZERO;

    @Column(name = "peak_power_kw", nullable = false, precision = 6, scale = 2)
    private BigDecimal peakPowerKw = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public ChargingSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Charger getCharger() { return charger; }
    public void setCharger(Charger charger) { this.charger = charger; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getActualStartTime() { return actualStartTime; }
    public void setActualStartTime(LocalDateTime actualStartTime) { this.actualStartTime = actualStartTime; }

    public LocalDateTime getActualEndTime() { return actualEndTime; }
    public void setActualEndTime(LocalDateTime actualEndTime) { this.actualEndTime = actualEndTime; }

    public BigDecimal getStartMeterKwh() { return startMeterKwh; }
    public void setStartMeterKwh(BigDecimal startMeterKwh) { this.startMeterKwh = startMeterKwh; }

    public BigDecimal getEndMeterKwh() { return endMeterKwh; }
    public void setEndMeterKwh(BigDecimal endMeterKwh) { this.endMeterKwh = endMeterKwh; }

    public BigDecimal getTotalKwhDelivered() { return totalKwhDelivered; }
    public void setTotalKwhDelivered(BigDecimal totalKwhDelivered) { this.totalKwhDelivered = totalKwhDelivered; }

    public BigDecimal getPeakPowerKw() { return peakPowerKw; }
    public void setPeakPowerKw(BigDecimal peakPowerKw) { this.peakPowerKw = peakPowerKw; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
