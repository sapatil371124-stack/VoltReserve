package com.voltreserve.backend.dto;

import jakarta.validation.constraints.NotNull;

public class SlotHoldRequest {
    @NotNull(message = "Slot ID is required")
    private Long slotId;

    private Long vehicleId;

    public SlotHoldRequest() {}
    public SlotHoldRequest(Long slotId, Long vehicleId) {
        this.slotId = slotId;
        this.vehicleId = vehicleId;
    }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
}
