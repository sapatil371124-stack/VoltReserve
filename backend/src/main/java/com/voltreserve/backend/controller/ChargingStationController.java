package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.ChargerDto;
import com.voltreserve.backend.dto.ChargingStationDto;
import com.voltreserve.backend.service.ChargerSlotService;
import com.voltreserve.backend.service.ChargingStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class ChargingStationController {

    @Autowired
    private ChargingStationService chargingStationService;

    @Autowired
    private ChargerSlotService chargerSlotService;

    @GetMapping
    public ResponseEntity<List<ChargingStationDto>> searchStations(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long connectorTypeId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {
        Long resolvedCityId = cityId;
        String resolvedCityName = null;

        if (city != null && !city.trim().isEmpty()) {
            try {
                resolvedCityId = Long.parseLong(city.trim());
            } catch (NumberFormatException e) {
                resolvedCityName = city.trim();
            }
        }

        return ResponseEntity.ok(chargingStationService.searchStations(
                resolvedCityId, resolvedCityName, locationId, connectorTypeId, keyword, userLat, userLon));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargingStationDto> getStationById(
            @PathVariable Long id,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {
        return ResponseEntity.ok(chargingStationService.getStationById(id, userLat, userLon));
    }

    @GetMapping("/compare")
    public ResponseEntity<List<ChargingStationDto>> compareStations(
            @RequestParam List<Long> ids,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {
        return ResponseEntity.ok(chargingStationService.compareStations(ids, userLat, userLon));
    }

    @GetMapping("/{id}/chargers")
    public ResponseEntity<List<ChargerDto>> getChargersByStation(@PathVariable Long id) {
        return ResponseEntity.ok(chargerSlotService.getChargersByStation(id));
    }
}
