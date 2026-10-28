package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.ChargingStationDto;

import java.math.BigDecimal;
import java.util.List;

public interface ChargingStationService {
    List<ChargingStationDto> searchStations(Long cityId, Long locationId, Long connectorTypeId, String keyword, Double userLat, Double userLon);
    List<ChargingStationDto> searchStations(Long cityId, String cityName, Long locationId, Long connectorTypeId, String keyword, Double userLat, Double userLon);
    ChargingStationDto getStationById(Long id, Double userLat, Double userLon);
    List<ChargingStationDto> compareStations(List<Long> stationIds, Double userLat, Double userLon);
    List<ChargingStationDto> getRecommendations(Double userLat, Double userLon, Long vehicleId, String connectorCode, BigDecimal minPowerKw);
    ChargingStationDto createStation(ChargingStationDto dto);
    ChargingStationDto updateStation(Long id, ChargingStationDto dto);
    void deleteStation(Long id);
}
