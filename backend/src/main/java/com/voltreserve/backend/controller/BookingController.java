package com.voltreserve.backend.controller;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.dto.*;
import com.voltreserve.backend.security.UserDetailsImpl;
import com.voltreserve.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BlockchainService blockchainService;

    @PostMapping("/hold")
    public ResponseEntity<BookingResponseDto> holdSlot(
            @Valid @RequestBody SlotHoldRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.holdSlot(request, userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDto> confirmBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        BookingResponseDto response = bookingService.confirmBooking(request, userDetails.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getUserBookings(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDto> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(bookingService.getBookingById(id, userDetails.getId(), isAdmin));
    }

    @GetMapping("/reference/{ref}")
    public ResponseEntity<BookingResponseDto> getBookingByReference(
            @PathVariable String ref,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(bookingService.getBookingByReference(ref, userDetails.getId(), isAdmin));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Cancelled by user";
        return ResponseEntity.ok(bookingService.cancelBooking(id, userDetails.getId(), reason, isAdmin));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<BlockchainVerificationDto> verifyBooking(@PathVariable Long id) {
        return ResponseEntity.ok(blockchainService.verifyBooking(id));
    }

    @PostMapping("/{id}/simulate-session")
    public ResponseEntity<BookingResponseDto> simulateSession(
            @PathVariable Long id,
            @RequestParam(defaultValue = "OCCUPIED") String status) {
        return ResponseEntity.ok(bookingService.simulateChargingSession(id, status));
    }
}
