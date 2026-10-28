package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.CityDto;
import com.voltreserve.backend.dto.LocationDto;
import com.voltreserve.backend.service.CityLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CityLocationController {

    @Autowired
    private CityLocationService cityLocationService;

    @GetMapping("/cities")
    public ResponseEntity<List<CityDto>> getAllCities() {
        return ResponseEntity.ok(cityLocationService.getAllCities());
    }

    @GetMapping("/cities/{id}")
    public ResponseEntity<CityDto> getCityById(@PathVariable Long id) {
        return ResponseEntity.ok(cityLocationService.getCityById(id));
    }

    @GetMapping("/locations")
    public ResponseEntity<List<LocationDto>> getAllLocations(@RequestParam(required = false) Long cityId) {
        if (cityId != null) {
            return ResponseEntity.ok(cityLocationService.getLocationsByCity(cityId));
        }
        return ResponseEntity.ok(cityLocationService.getAllLocations());
    }

    @GetMapping("/locations/city/{cityId}")
    public ResponseEntity<List<LocationDto>> getLocationsByCityId(@PathVariable Long cityId) {
        return ResponseEntity.ok(cityLocationService.getLocationsByCity(cityId));
    }
}
