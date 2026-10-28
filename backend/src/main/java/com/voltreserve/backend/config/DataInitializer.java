package com.voltreserve.backend.config;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.entity.*;
import com.voltreserve.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ChargingSlotRepository chargingSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BlockchainService blockchainService;

    @Override
    public void run(String... args) {
        initializeUsers();
        ensureUpcomingSlots();
        ensureBlockchainIntegrity();
    }

    private void initializeUsers() {
        // Ensure Admin user
        Optional<User> adminOpt = userRepository.findByEmail("admin@voltreserve.com");
        if (adminOpt.isEmpty()) {
            User admin = new User(
                    "admin@voltreserve.com",
                    passwordEncoder.encode("admin123"),
                    "VoltReserve System Administrator",
                    "+919876543210",
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);
            logger.info("Initialized default ADMIN account: admin@voltreserve.com");
        } else {
            // Re-hash with active encoder if needed
            User admin = adminOpt.get();
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
        }

        // Ensure Demo User Rahul
        Optional<User> rahulOpt = userRepository.findByEmail("rahul.sharma@example.com");
        if (rahulOpt.isEmpty()) {
            User rahul = new User(
                    "rahul.sharma@example.com",
                    passwordEncoder.encode("password123"),
                    "Rahul Sharma",
                    "+919822012345",
                    "ROLE_USER"
            );
            userRepository.save(rahul);
        } else {
            User rahul = rahulOpt.get();
            rahul.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(rahul);
        }

        // Ensure Demo User Priya
        Optional<User> priyaOpt = userRepository.findByEmail("priya.patil@example.com");
        if (priyaOpt.isEmpty()) {
            User priya = new User(
                    "priya.patil@example.com",
                    passwordEncoder.encode("password123"),
                    "Priya Patil",
                    "+919822054321",
                    "ROLE_USER"
            );
            userRepository.save(priya);
        } else {
            User priya = priyaOpt.get();
            priya.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(priya);
        }
    }

    private void ensureUpcomingSlots() {
        // Prime slots for the top 25 active chargers; remaining chargers generate on-demand dynamically
        List<Charger> chargers = chargerRepository.findAll().stream().limit(25).toList();
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        for (Charger c : chargers) {
            // Generate slots for today if fewer than 4 exist
            LocalDateTime startToday = today.atStartOfDay();
            LocalDateTime endToday = today.atTime(LocalTime.MAX);
            List<ChargingSlot> todaySlots = chargingSlotRepository.findByChargerIdAndStartTimeBetweenOrderByStartTimeAsc(c.getId(), startToday, endToday);

            if (todaySlots.size() < 4) {
                generateDaySlots(c, today, 8, 22);
            }

            // Generate slots for tomorrow if fewer than 4 exist
            LocalDateTime startTomorrow = tomorrow.atStartOfDay();
            LocalDateTime endTomorrow = tomorrow.atTime(LocalTime.MAX);
            List<ChargingSlot> tomorrowSlots = chargingSlotRepository.findByChargerIdAndStartTimeBetweenOrderByStartTimeAsc(c.getId(), startTomorrow, endTomorrow);

            if (tomorrowSlots.size() < 4) {
                generateDaySlots(c, tomorrow, 8, 22);
            }
        }
    }

    private void generateDaySlots(Charger charger, LocalDate date, int startH, int endH) {
        LocalTime current = LocalTime.of(startH, 0);
        LocalTime end = LocalTime.of(endH, 0);
        java.util.List<ChargingSlot> batch = new java.util.ArrayList<>();

        while (current.isBefore(end)) {
            LocalDateTime sStart = LocalDateTime.of(date, current);
            LocalDateTime sEnd = sStart.plusMinutes(30);

            if (!chargingSlotRepository.existsByChargerIdAndStartTime(charger.getId(), sStart)) {
                ChargingSlot slot = new ChargingSlot();
                slot.setCharger(charger);
                slot.setStartTime(sStart);
                slot.setEndTime(sEnd);
                slot.setStatus("AVAILABLE");
                slot.setVersion(0);
                batch.add(slot);
            }

            current = current.plusMinutes(30);
        }

        if (!batch.isEmpty()) {
            chargingSlotRepository.saveAll(batch);
        }
    }

    private void ensureBlockchainIntegrity() {
        List<Booking> bookings = bookingRepository.findAll();
        for (Booking b : bookings) {
            blockchainService.recordBooking(b);
        }
    }
}
