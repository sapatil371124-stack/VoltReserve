package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.ConnectorTypeDto;
import com.voltreserve.backend.dto.VehicleDto;
import com.voltreserve.backend.security.UserDetailsImpl;
import com.voltreserve.backend.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping("/connector-types")
    public ResponseEntity<List<ConnectorTypeDto>> getAllConnectorTypes() {
        return ResponseEntity.ok(vehicleService.getAllConnectorTypes());
    }

    @GetMapping("/vehicles/my")
    public ResponseEntity<List<VehicleDto>> getMyVehicles(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(vehicleService.getUserVehicles(userDetails.getId()));
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(vehicleService.getVehicleById(id, userDetails.getId()));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleDto> addVehicle(@Valid @RequestBody VehicleDto dto, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return new ResponseEntity<>(vehicleService.createVehicle(dto, userDetails.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable Long id, @RequestBody VehicleDto dto, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(vehicleService.updateVehicle(id, dto, userDetails.getId()));
    }

    @PatchMapping("/vehicles/{id}/soc")
    public ResponseEntity<VehicleDto> updateVehicleSoc(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BigDecimal soc = new BigDecimal(body.get("currentSocPercentage").toString());
        BigDecimal range = body.containsKey("estimatedRangeKm") && body.get("estimatedRangeKm") != null
                ? new BigDecimal(body.get("estimatedRangeKm").toString())
                : null;
        return ResponseEntity.ok(vehicleService.updateVehicleSoc(id, soc, range, userDetails.getId()));
    }

    @PatchMapping("/vehicles/{id}/default")
    public ResponseEntity<VehicleDto> setDefaultVehicle(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(vehicleService.setDefaultVehicle(id, userDetails.getId()));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Map<String, String>> deleteVehicle(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        vehicleService.deleteVehicle(id, userDetails.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Vehicle deleted successfully"));
    }
}
