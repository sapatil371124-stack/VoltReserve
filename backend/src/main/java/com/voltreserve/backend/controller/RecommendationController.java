package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.ChargingStationDto;
import com.voltreserve.backend.service.ChargingStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private ChargingStationService chargingStationService;

    @GetMapping
    public ResponseEntity<List<ChargingStationDto>> getRecommendations(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) String connectorCode,
            @RequestParam(required = false) BigDecimal minPowerKw) {
        return ResponseEntity.ok(chargingStationService.getRecommendations(userLat, userLon, vehicleId, connectorCode, minPowerKw));
    }
}
