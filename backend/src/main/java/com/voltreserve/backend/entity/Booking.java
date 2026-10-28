package com.voltreserve.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 32)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "charger_id", nullable = false)
    private Charger charger;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "slot_id", nullable = true)
    private ChargingSlot slot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "estimated_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal estimatedKwh;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "base_amount", precision = 10, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "gst_amount", precision = 10, scale = 2)
    private BigDecimal gstAmount;

    @Column(name = "platform_fee", precision = 10, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "initial_soc_percentage", precision = 5, scale = 2)
    private BigDecimal initialSocPercentage;

    @Column(name = "target_soc_percentage", precision = 5, scale = 2)
    private BigDecimal targetSocPercentage;

    @Column(name = "charging_duration_minutes")
    private Integer chargingDurationMinutes;

    @Column(name = "tariff_snapshot", precision = 8, scale = 2)
    private BigDecimal tariffSnapshot;

    @Column(nullable = false, length = 20)
    private String status = "HELD";

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Charger getCharger() { return charger; }
    public void setCharger(Charger charger) { this.charger = charger; }

    public ChargingSlot getSlot() { return slot; }
    public void setSlot(ChargingSlot slot) { this.slot = slot; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getEstimatedKwh() { return estimatedKwh; }
    public void setEstimatedKwh(BigDecimal estimatedKwh) { this.estimatedKwh = estimatedKwh; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }

    public BigDecimal getGstAmount() { return gstAmount; }
    public void setGstAmount(BigDecimal gstAmount) { this.gstAmount = gstAmount; }

    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }

    public BigDecimal getInitialSocPercentage() { return initialSocPercentage; }
    public void setInitialSocPercentage(BigDecimal initialSocPercentage) { this.initialSocPercentage = initialSocPercentage; }

    public BigDecimal getTargetSocPercentage() { return targetSocPercentage; }
    public void setTargetSocPercentage(BigDecimal targetSocPercentage) { this.targetSocPercentage = targetSocPercentage; }

    public Integer getChargingDurationMinutes() { return chargingDurationMinutes; }
    public void setChargingDurationMinutes(Integer chargingDurationMinutes) { this.chargingDurationMinutes = chargingDurationMinutes; }

    public BigDecimal getTariffSnapshot() { return tariffSnapshot; }
    public void setTariffSnapshot(BigDecimal tariffSnapshot) { this.tariffSnapshot = tariffSnapshot; }

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
