package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.AdminDashboardStatsDto;
import com.voltreserve.backend.dto.BookingResponseDto;
import com.voltreserve.backend.dto.UserDto;
import com.voltreserve.backend.entity.*;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChargingStationRepository chargingStationRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ChargingSessionRepository chargingSessionRepository;

    @Autowired
    private BlockchainRecordRepository blockchainRecordRepository;

    @Autowired
    private BookingService bookingService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        long usersCount = userRepository.count();
        long stationsCount = chargingStationRepository.count();
        long chargersCount = chargerRepository.count();

        List<Charger> chargers = chargerRepository.findAll();
        long activeChargers = chargers.stream().filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus())).count();

        List<Booking> allBookings = bookingRepository.findAll();
        long activeBookings = allBookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()) || "OCCUPIED".equalsIgnoreCase(b.getStatus()))
                .count();

        LocalDate today = LocalDate.now();
        long todayBookings = allBookings.stream()
                .filter(b -> b.getStartTime() != null && b.getStartTime().toLocalDate().isEqual(today))
                .count();

        long completedSessions = chargingSessionRepository.count();

        BigDecimal revenue = allBookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()) || "COMPLETED".equalsIgnoreCase(b.getStatus()))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Utilization: ratio of confirmed/completed slots over total slots
        double utilization = 0.0;
        if (chargersCount > 0) {
            double confirmedCount = allBookings.stream()
                    .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()) || "COMPLETED".equalsIgnoreCase(b.getStatus()) || "OCCUPIED".equalsIgnoreCase(b.getStatus()))
                    .count();
            utilization = BigDecimal.valueOf(Math.min(100.0, (confirmedCount / (chargersCount * 12.0)) * 100.0))
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        stats.setTotalUsers(usersCount);
        stats.setTotalStations(stationsCount);
        stats.setTotalChargers(chargersCount);
        stats.setAvailableChargers(activeChargers);
        stats.setActiveBookings(activeBookings);
        stats.setTodayBookings(todayBookings);
        stats.setCompletedSessions(completedSessions);
        stats.setTotalRevenue(revenue);
        stats.setStationUtilizationRate(utilization);
        stats.setVerifiedBlockchainBlocks(blockchainRecordRepository.count());

        // Recent 5 bookings
        List<Map<String, Object>> recent = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(b -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", b.getId());
                    map.put("reference", b.getBookingReference());
                    map.put("user", b.getUser().getFullName());
                    map.put("station", b.getCharger().getStation().getName());
                    map.put("time", b.getStartTime());
                    map.put("amount", b.getTotalAmount());
                    map.put("status", b.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
        stats.setRecentBookings(recent);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setEmail(u.getEmail());
            dto.setFullName(u.getFullName());
            dto.setPhone(u.getPhone());
            dto.setRole(u.getRole());
            dto.setIsActive(u.getIsActive());
            dto.setCreatedAt(u.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        User updated = userRepository.save(user);

        UserDto dto = new UserDto();
        dto.setId(updated.getId());
        dto.setEmail(updated.getEmail());
        dto.setFullName(updated.getFullName());
        dto.setPhone(updated.getPhone());
        dto.setRole(updated.getRole());
        dto.setIsActive(updated.getIsActive());
        dto.setCreatedAt(updated.getCreatedAt());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(b -> bookingService.getBookingById(b.getId(), b.getUser().getId(), true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingSession> getAllSessions() {
        return chargingSessionRepository.findAllByOrderByCreatedAtDesc();
    }
}
