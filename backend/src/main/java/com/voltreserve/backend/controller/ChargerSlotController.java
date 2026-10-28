package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.ChargerDto;
import com.voltreserve.backend.dto.ChargingSlotDto;
import com.voltreserve.backend.security.UserDetailsImpl;
import com.voltreserve.backend.service.ChargerSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/chargers")
public class ChargerSlotController {

    @Autowired
    private ChargerSlotService chargerSlotService;

    @GetMapping("/{id}")
    public ResponseEntity<ChargerDto> getChargerById(@PathVariable Long id) {
        return ResponseEntity.ok(chargerSlotService.getChargerById(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<ChargingSlotDto>> getSlotsByCharger(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {

        Long currentUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            currentUserId = ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }

        return ResponseEntity.ok(chargerSlotService.getSlotsByCharger(id, date, currentUserId));
    }

    @GetMapping("/{id}/flexible-intervals")
    public ResponseEntity<List<com.voltreserve.backend.dto.FlexibleIntervalDto>> getFlexibleIntervals(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "45") int durationMinutes,
            Authentication authentication) {

        Long currentUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            currentUserId = ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }

        return ResponseEntity.ok(chargerSlotService.getFlexibleIntervals(id, date, durationMinutes, currentUserId));
    }
}
