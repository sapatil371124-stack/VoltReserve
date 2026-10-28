package com.voltreserve.backend;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.dto.*;
import com.voltreserve.backend.entity.*;
import com.voltreserve.backend.exception.IncompatibleChargerException;
import com.voltreserve.backend.exception.SlotNotAvailableException;
import com.voltreserve.backend.repository.*;
import com.voltreserve.backend.security.JwtUtils;
import com.voltreserve.backend.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class VoltReserveSystemTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ChargingStationRepository chargingStationRepository;

    @Autowired
    private ConnectorTypeRepository connectorTypeRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ChargingSlotRepository chargingSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ChargingSessionRepository chargingSessionRepository;

    @Autowired
    private BlockchainRecordRepository blockchainRecordRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private User testUser1;
    private User testUser2;
    private User adminUser;
    private ConnectorType ccs2Connector;
    private ConnectorType type2Connector;
    private Charger testCcs2Charger;
    private Charger testType2Charger;
    private Vehicle user1Ccs2Vehicle;

    @BeforeEach
    public void setup() {
        // Clear previous test records in strict foreign-key dependency order
        blockchainRecordRepository.deleteAll();
        chargingSessionRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        chargingSlotRepository.deleteAll();
        vehicleRepository.deleteAll();
        chargerRepository.deleteAll();
        chargingStationRepository.deleteAll();
        locationRepository.deleteAll();
        cityRepository.deleteAll();
        connectorTypeRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Setup Users
        testUser1 = userRepository.save(new User("rahul@test.com", "hash1", "Rahul Sharma", "+919822011111", "ROLE_USER"));
        testUser2 = userRepository.save(new User("priya@test.com", "hash2", "Priya Patil", "+919822022222", "ROLE_USER"));
        adminUser = userRepository.save(new User("admin@test.com", "hashAdmin", "Admin User", "+919822099999", "ROLE_ADMIN"));

        // 2. Setup Connectors
        ccs2Connector = connectorTypeRepository.save(new ConnectorType("CCS2", "Combined Charging System 2", "DC", new BigDecimal("150.00"), "DC Fast"));
        type2Connector = connectorTypeRepository.save(new ConnectorType("TYPE2", "Type 2 Mennekes", "AC", new BigDecimal("22.00"), "AC Normal"));

        // 3. Setup Geography & Station
        City city = new City();
        city.setName("Nashik");
        city.setState("Maharashtra");
        city.setCountry("India");
        city.setLatitude(new BigDecimal("19.9974530"));
        city.setLongitude(new BigDecimal("73.7898030"));
        city = cityRepository.save(city);

        Location location = new Location();
        location.setCity(city);
        location.setName("Gangapur Hub");
        location.setAddress("Gangapur Road, Nashik");
        location.setLatitude(new BigDecimal("19.9982000"));
        location.setLongitude(new BigDecimal("73.7654000"));
        location = locationRepository.save(location);

        ChargingStation station = new ChargingStation();
        station.setLocation(location);
        station.setName("VoltReserve Flagship Gangapur");
        station.setOperatingHours("24/7");
        station.setRating(new BigDecimal("4.80"));
        station.setIsActive(true);
        station = chargingStationRepository.save(station);

        // 4. Setup Chargers
        Charger charger1 = new Charger();
        charger1.setStation(station);
        charger1.setConnectorType(ccs2Connector);
        charger1.setIdentifierCode("NSK-GNP-01");
        charger1.setPowerOutputKw(new BigDecimal("120.00"));
        charger1.setCurrentType("DC");
        charger1.setPricePerKwh(new BigDecimal("20.00"));
        charger1.setStatus("ACTIVE");
        testCcs2Charger = chargerRepository.save(charger1);

        Charger charger2 = new Charger();
        charger2.setStation(station);
        charger2.setConnectorType(type2Connector);
        charger2.setIdentifierCode("NSK-GNP-02");
        charger2.setPowerOutputKw(new BigDecimal("22.00"));
        charger2.setCurrentType("AC");
        charger2.setPricePerKwh(new BigDecimal("15.00"));
        charger2.setStatus("ACTIVE");
        testType2Charger = chargerRepository.save(charger2);

        // 5. Setup Vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(testUser1);
        vehicle.setMake("Tata");
        vehicle.setModel("Nexon EV Max");
        vehicle.setBatteryCapacityKwh(new BigDecimal("40.50"));
        vehicle.setMaxChargingRateKw(new BigDecimal("50.00"));
        vehicle.setConnectorType(ccs2Connector);
        vehicle.setLicensePlate("MH-15-EV-1024");
        user1Ccs2Vehicle = vehicleRepository.save(vehicle);
    }

    private ChargingSlot createSlot(Charger charger, LocalDateTime start, LocalDateTime end, String status) {
        ChargingSlot slot = new ChargingSlot();
        slot.setCharger(charger);
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setStatus(status);
        slot.setVersion(0);
        return chargingSlotRepository.save(slot);
    }

    @Test
    @DisplayName("Test 1: Available slot -> booking succeeds")
    public void test1_availableSlotBookingSucceeds() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        BookingCreateRequest req = new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI");
        BookingResponseDto response = bookingService.confirmBooking(req, testUser1.getId());

        assertNotNull(response);
        assertEquals("CONFIRMED", response.getStatus());
        assertNotNull(response.getBookingReference());
        assertTrue(response.getBookingReference().startsWith("VR-"));

        ChargingSlot updatedSlot = chargingSlotRepository.findById(slot.getId()).orElseThrow();
        assertEquals("BOOKED", updatedSlot.getStatus());
    }

    @Test
    @DisplayName("Test 2: Already-booked slot -> booking rejected")
    public void test2_alreadyBookedSlotRejected() {
        LocalDateTime start = LocalDateTime.now().plusHours(3);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        // First user books it
        BookingCreateRequest req1 = new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI");
        bookingService.confirmBooking(req1, testUser1.getId());

        // Second user attempts to book the same slot
        BookingCreateRequest req2 = new BookingCreateRequest(slot.getId(), null, "UPI");
        assertThrows(SlotNotAvailableException.class, () -> {
            bookingService.confirmBooking(req2, testUser2.getId());
        });
    }

    @Test
    @DisplayName("Test 3: Two users booking simultaneously -> only one succeeds")
    public void test3_concurrentBookingDoubleBookingPrevention() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusHours(4);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        Callable<Void> task1 = () -> {
            readyLatch.countDown();
            startLatch.await();
            try {
                bookingService.confirmBooking(new BookingCreateRequest(slot.getId(), null, "UPI"), testUser1.getId());
                successCount.incrementAndGet();
            } catch (RuntimeException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> task2 = () -> {
            readyLatch.countDown();
            startLatch.await();
            try {
                bookingService.confirmBooking(new BookingCreateRequest(slot.getId(), null, "CARD"), testUser2.getId());
                successCount.incrementAndGet();
            } catch (RuntimeException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(task1);
        Future<Void> f2 = executor.submit(task2);

        readyLatch.await(); // wait for both threads to be ready
        startLatch.countDown(); // fire simultaneously

        f1.get(5, TimeUnit.SECONDS);
        f2.get(5, TimeUnit.SECONDS);
        executor.shutdown();

        // Exactly one should succeed, exactly one should be rejected!
        assertEquals(1, successCount.get(), "Exactly one user must successfully confirm the booking.");
        assertEquals(1, conflictCount.get(), "Competing concurrent booking must be rejected.");
    }

    @Test
    @DisplayName("Test 4: Expired hold -> slot becomes available")
    public void test4_expiredHoldBecomesAvailable() {
        LocalDateTime start = LocalDateTime.now().plusHours(5);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        // Manually place a hold that expired 5 minutes ago
        slot.setStatus("HELD");
        slot.setHeldByUser(testUser1);
        slot.setHoldExpiresAt(LocalDateTime.now().minusMinutes(5));
        chargingSlotRepository.save(slot);

        // Run scheduled cleanup
        bookingService.cleanupExpiredHolds();

        ChargingSlot cleanedSlot = chargingSlotRepository.findById(slot.getId()).orElseThrow();
        assertEquals("AVAILABLE", cleanedSlot.getStatus());
        assertNull(cleanedSlot.getHeldByUser());

        // User 2 can now hold or book the slot
        BookingResponseDto holdRes = bookingService.holdSlot(new SlotHoldRequest(slot.getId(), null), testUser2.getId());
        assertEquals("HELD", holdRes.getStatus());
    }

    @Test
    @DisplayName("Test 5: Incompatible charger -> booking rejected")
    public void test5_incompatibleChargerRejected() {
        LocalDateTime start = LocalDateTime.now().plusHours(6);
        LocalDateTime end = start.plusMinutes(30);
        // User has CCS2 EV, trying to book Type 2 AC charger
        ChargingSlot slot = createSlot(testType2Charger, start, end, "AVAILABLE");

        BookingCreateRequest req = new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI");
        assertThrows(IncompatibleChargerException.class, () -> {
            bookingService.confirmBooking(req, testUser1.getId());
        });
    }

    @Test
    @DisplayName("Test 6: Cancelled booking -> slot becomes available")
    public void test6_cancelledBookingReleasesSlot() {
        LocalDateTime start = LocalDateTime.now().plusHours(7);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        BookingResponseDto booking = bookingService.confirmBooking(
                new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI"), testUser1.getId()
        );

        assertEquals("BOOKED", chargingSlotRepository.findById(slot.getId()).orElseThrow().getStatus());

        // Cancel booking
        BookingResponseDto cancelled = bookingService.cancelBooking(booking.getId(), testUser1.getId(), "Change of plans", false);
        assertEquals("CANCELLED", cancelled.getStatus());

        // Slot must now be AVAILABLE again
        ChargingSlot releasedSlot = chargingSlotRepository.findById(slot.getId()).orElseThrow();
        assertEquals("AVAILABLE", releasedSlot.getStatus());
        assertNull(releasedSlot.getHeldByUser());
    }

    @Test
    @DisplayName("Test 7: Blockchain hash matches -> VERIFIED")
    public void test7_blockchainVerificationSucceeds() {
        LocalDateTime start = LocalDateTime.now().plusHours(8);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        BookingResponseDto booking = bookingService.confirmBooking(
                new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI"), testUser1.getId()
        );

        BlockchainVerificationDto verifyDto = blockchainService.verifyBooking(booking.getId());
        assertEquals("VERIFIED", verifyDto.getStatus());
        assertFalse(verifyDto.isTamperDetected());
        assertEquals(verifyDto.getRecordedTransactionHash(), verifyDto.getCalculatedHash());
    }

    @Test
    @DisplayName("Test 8: Booking data altered -> TAMPER DETECTED")
    public void test8_tamperDetectionFiresOnDataChange() {
        LocalDateTime start = LocalDateTime.now().plusHours(9);
        LocalDateTime end = start.plusMinutes(30);
        ChargingSlot slot = createSlot(testCcs2Charger, start, end, "AVAILABLE");

        BookingResponseDto booking = bookingService.confirmBooking(
                new BookingCreateRequest(slot.getId(), user1Ccs2Vehicle.getId(), "UPI"), testUser1.getId()
        );

        // Simulate tampering in the database directly
        blockchainService.simulateTamper(booking.getId());

        // Verify cryptographic integrity
        BlockchainVerificationDto verifyDto = blockchainService.verifyBooking(booking.getId());
        assertEquals("TAMPER_DETECTED", verifyDto.getStatus());
        assertTrue(verifyDto.isTamperDetected());
        assertNotEquals(verifyDto.getRecordedTransactionHash(), verifyDto.getCalculatedHash());
    }

    @Test
    @DisplayName("Test 9: Unauthorized user -> cannot access admin APIs")
    public void test9_unauthorizedUserCannotAccessAdminApis() throws Exception {
        // Generate token for normal ROLE_USER
        String userToken = jwtUtils.generateToken(testUser1.getEmail(), testUser1.getRole(), testUser1.getId());

        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Unauthenticated request
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());

        // Admin token succeeds
        String adminToken = jwtUtils.generateToken(adminUser.getEmail(), adminUser.getRole(), adminUser.getId());
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test 10: Expired/invalid booking request -> rejected")
    public void test10_invalidBookingRequestRejected() {
        // Non-existent slot ID
        BookingCreateRequest req = new BookingCreateRequest(999999L, null, "UPI");
        assertThrows(RuntimeException.class, () -> {
            bookingService.confirmBooking(req, testUser1.getId());
        });
    }
}
