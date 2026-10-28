package com.voltreserve.backend.controller;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.dto.*;
import com.voltreserve.backend.entity.ChargingSession;
import com.voltreserve.backend.service.AdminService;
import com.voltreserve.backend.service.ChargerSlotService;
import com.voltreserve.backend.service.ChargingStationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ChargingStationService chargingStationService;

    @Autowired
    private ChargerSlotService chargerSlotService;

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChargingSession>> getAllSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    // Station Management
    @PostMapping("/stations")
    public ResponseEntity<ChargingStationDto> createStation(@Valid @RequestBody ChargingStationDto dto) {
        return new ResponseEntity<>(chargingStationService.createStation(dto), HttpStatus.CREATED);
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<ChargingStationDto> updateStation(@PathVariable Long id, @RequestBody ChargingStationDto dto) {
        return ResponseEntity.ok(chargingStationService.updateStation(id, dto));
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Map<String, String>> deleteStation(@PathVariable Long id) {
        chargingStationService.deleteStation(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Station deleted successfully"));
    }

    // Charger Management
    @PostMapping("/chargers")
    public ResponseEntity<ChargerDto> createCharger(@Valid @RequestBody ChargerDto dto) {
        return new ResponseEntity<>(chargerSlotService.createCharger(dto), HttpStatus.CREATED);
    }

    @PutMapping("/chargers/{id}")
    public ResponseEntity<ChargerDto> updateCharger(@PathVariable Long id, @RequestBody ChargerDto dto) {
        return ResponseEntity.ok(chargerSlotService.updateCharger(id, dto));
    }

    @DeleteMapping("/chargers/{id}")
    public ResponseEntity<Map<String, String>> deleteCharger(@PathVariable Long id) {
        chargerSlotService.deleteCharger(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Charger deleted successfully"));
    }

    // Slot Generation
    @PostMapping("/slots/generate")
    public ResponseEntity<Map<String, Object>> generateSlots(@Valid @RequestBody SlotGenerateRequest request) {
        int generatedCount = chargerSlotService.generateSlots(request);
        return ResponseEntity.ok(Map.of(
                "message", "Slots generated successfully",
                "count", generatedCount,
                "date", request.getDate().toString()
        ));
    }

    // Blockchain Tamper Simulation for Testing & Demos
    @PostMapping("/blockchain/simulate-tamper/{bookingId}")
    public ResponseEntity<Map<String, String>> simulateTamper(@PathVariable Long bookingId) {
        blockchainService.simulateTamper(bookingId);
        return ResponseEntity.ok(Map.of(
                "message", "Booking " + bookingId + " has been modified in operational DB to simulate tampering.",
                "action", "Call verify endpoint to witness cryptographic TAMPER_DETECTED result."
        ));
    }
}
