package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.AdminDashboardStatsDto;
import com.voltreserve.backend.dto.BookingResponseDto;
import com.voltreserve.backend.dto.UserDto;
import com.voltreserve.backend.entity.ChargingSession;

import java.util.List;

public interface AdminService {
    AdminDashboardStatsDto getDashboardStats();
    List<UserDto> getAllUsers();
    UserDto toggleUserStatus(Long userId);
    List<BookingResponseDto> getAllBookings();
    List<ChargingSession> getAllSessions();
}
