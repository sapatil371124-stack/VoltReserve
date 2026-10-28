package com.voltreserve.backend.dto;

import java.util.List;

public class RouteResponse {
    private Double distanceKm;
    private Integer durationMinutes;
    private List<List<Double>> coordinates; // [[lat, lng], [lat, lng], ...]
    private String summary;
    private Double estimatedEnergyConsumptionKwh;

    public RouteResponse() {}

    public RouteResponse(Double distanceKm, Integer durationMinutes, List<List<Double>> coordinates, String summary, Double estimatedEnergyConsumptionKwh) {
        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.coordinates = coordinates;
        this.summary = summary;
        this.estimatedEnergyConsumptionKwh = estimatedEnergyConsumptionKwh;
    }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public List<List<Double>> getCoordinates() { return coordinates; }
    public void setCoordinates(List<List<Double>> coordinates) { this.coordinates = coordinates; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public Double getEstimatedEnergyConsumptionKwh() { return estimatedEnergyConsumptionKwh; }
    public void setEstimatedEnergyConsumptionKwh(Double estimatedEnergyConsumptionKwh) { this.estimatedEnergyConsumptionKwh = estimatedEnergyConsumptionKwh; }
}
