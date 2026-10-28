package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.BookingCreateRequest;
import com.voltreserve.backend.dto.BookingResponseDto;
import com.voltreserve.backend.dto.SlotHoldRequest;

import java.util.List;

public interface BookingService {
    BookingResponseDto holdSlot(SlotHoldRequest request, Long userId);
    BookingResponseDto confirmBooking(BookingCreateRequest request, Long userId);
    BookingResponseDto cancelBooking(Long bookingId, Long userId, String reason, boolean isAdmin);
    List<BookingResponseDto> getUserBookings(Long userId);
    BookingResponseDto getBookingById(Long bookingId, Long currentUserId, boolean isAdmin);
    BookingResponseDto getBookingByReference(String reference, Long currentUserId, boolean isAdmin);
    void cleanupExpiredHolds();
    BookingResponseDto simulateChargingSession(Long bookingId, String nextStatus);
}
