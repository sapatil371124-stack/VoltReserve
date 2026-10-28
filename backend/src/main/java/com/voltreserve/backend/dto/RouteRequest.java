package com.voltreserve.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RouteRequest {
    @NotNull(message = "Origin latitude is required")
    private BigDecimal originLat;

    @NotNull(message = "Origin longitude is required")
    private BigDecimal originLng;

    @NotNull(message = "Destination latitude is required")
    private BigDecimal destinationLat;

    @NotNull(message = "Destination longitude is required")
    private BigDecimal destinationLng;

    private Long stationId;

    public RouteRequest() {}

    public RouteRequest(BigDecimal originLat, BigDecimal originLng, BigDecimal destinationLat, BigDecimal destinationLng) {
        this.originLat = originLat;
        this.originLng = originLng;
        this.destinationLat = destinationLat;
        this.destinationLng = destinationLng;
    }

    public BigDecimal getOriginLat() { return originLat; }
    public void setOriginLat(BigDecimal originLat) { this.originLat = originLat; }
    public BigDecimal getOriginLng() { return originLng; }
    public void setOriginLng(BigDecimal originLng) { this.originLng = originLng; }
    public BigDecimal getDestinationLat() { return destinationLat; }
    public void setDestinationLat(BigDecimal destinationLat) { this.destinationLat = destinationLat; }
    public BigDecimal getDestinationLng() { return destinationLng; }
    public void setDestinationLng(BigDecimal destinationLng) { this.destinationLng = destinationLng; }
    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }
}
