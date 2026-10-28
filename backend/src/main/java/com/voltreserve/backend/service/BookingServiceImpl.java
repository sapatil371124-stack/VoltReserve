package com.voltreserve.backend.service;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.dto.BookingCreateRequest;
import com.voltreserve.backend.dto.BookingResponseDto;
import com.voltreserve.backend.dto.SlotHoldRequest;
import com.voltreserve.backend.entity.*;
import com.voltreserve.backend.exception.*;
import com.voltreserve.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Value("${voltreserve.booking.hold-duration-minutes:10}")
    private int holdDurationMinutes;

    @Autowired
    private ChargingSlotRepository chargingSlotRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ChargingSessionRepository chargingSessionRepository;

    @Autowired
    private BlockchainRecordRepository blockchainRecordRepository;

    @Autowired
    private BlockchainService blockchainService;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponseDto holdSlot(SlotHoldRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Acquire pessimistic row lock on the target slot
        ChargingSlot slot = chargingSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Charging slot not found with ID: " + request.getSlotId()));

        LocalDateTime now = LocalDateTime.now();

        // Check if held and expired
        if ("HELD".equalsIgnoreCase(slot.getStatus()) && slot.getHoldExpiresAt() != null && slot.getHoldExpiresAt().isBefore(now)) {
            slot.setStatus("AVAILABLE");
            slot.setHeldByUser(null);
            slot.setHoldExpiresAt(null);
        }

        // Validate availability
        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            if ("HELD".equalsIgnoreCase(slot.getStatus()) && slot.getHeldByUser() != null && slot.getHeldByUser().getId().equals(userId)) {
                // Already held by this user, refresh hold expiration
                slot.setHoldExpiresAt(now.plusMinutes(holdDurationMinutes));
                chargingSlotRepository.save(slot);
                return buildResponseDto(null, slot, user, null);
            }
            throw new SlotNotAvailableException("Sorry, this slot has just been booked. Please select another available slot.");
        }

        // Check vehicle connector compatibility if vehicle provided
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));
            validateConnectorCompatibility(vehicle, slot.getCharger());
        }

        // Place temporary hold
        slot.setStatus("HELD");
        slot.setHeldByUser(user);
        slot.setHoldExpiresAt(now.plusMinutes(holdDurationMinutes));
        ChargingSlot updatedSlot = chargingSlotRepository.save(slot);

        logger.info("Slot #{} held by user #{} until {}", slot.getId(), userId, slot.getHoldExpiresAt());
        return buildResponseDto(null, updatedSlot, user, vehicle);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponseDto confirmBooking(BookingCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        LocalDateTime now = LocalDateTime.now();
        Charger charger;
        ChargingSlot slot = null;
        LocalDateTime startTime;
        LocalDateTime endTime;
        int durationMinutes;

        if (request.getSlotId() != null) {
            // 1. Acquire pessimistic row lock to prevent concurrent double-booking
            slot = chargingSlotRepository.findByIdWithLock(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));

            // 2. Validate current slot state
            boolean isHeldByCaller = "HELD".equalsIgnoreCase(slot.getStatus())
                    && slot.getHeldByUser() != null
                    && slot.getHeldByUser().getId().equals(userId)
                    && slot.getHoldExpiresAt() != null
                    && slot.getHoldExpiresAt().isAfter(now);

            boolean isAvailable = "AVAILABLE".equalsIgnoreCase(slot.getStatus());

            if (!isHeldByCaller && !isAvailable) {
                throw new SlotNotAvailableException("Sorry, this slot has just been booked. Please select another available slot.");
            }

            charger = slot.getCharger();
            startTime = slot.getStartTime();
            endTime = slot.getEndTime();
            durationMinutes = (int) Duration.between(startTime, endTime).toMinutes();

            // 3. Prevent overlapping bookings on the same charger at the database level
            List<ChargingSlot> overlappingSlots = chargingSlotRepository.findOverlappingActiveSlots(
                    charger.getId(), slot.getId(), slot.getStartTime(), slot.getEndTime()
            );
            if (!overlappingSlots.isEmpty()) {
                throw new DoubleBookingException("Sorry, this slot has just been booked. Please select another available slot.");
            }

            List<Booking> overlappingBookings = bookingRepository.findOverlappingActiveBookings(
                    charger.getId(), slot.getStartTime(), slot.getEndTime()
            );
            if (!overlappingBookings.isEmpty()) {
                throw new DoubleBookingException("Sorry, this slot has just been booked. Please select another available slot.");
            }

            // Transition slot to BOOKED
            slot.setStatus("BOOKED");
            slot.setHeldByUser(user);
            slot.setHoldExpiresAt(null);
            chargingSlotRepository.save(slot);
        } else {
            // Flexible duration booking
            if (request.getChargerId() == null) {
                throw new BadRequestException("Charger ID is required for flexible booking.");
            }
            if (request.getStartTime() == null) {
                throw new BadRequestException("Start time is required for flexible booking.");
            }

            charger = chargerRepository.findByIdWithLock(request.getChargerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

            durationMinutes = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                    ? request.getDurationMinutes() : 45;
            startTime = request.getStartTime();
            endTime = (request.getEndTime() != null) ? request.getEndTime() : startTime.plusMinutes(durationMinutes);

            if (startTime.isBefore(now.minusMinutes(5))) {
                throw new BadRequestException("Cannot book a time slot in the past.");
            }

            List<Booking> overlappingBookings = bookingRepository.findOverlappingActiveBookings(
                    charger.getId(), startTime, endTime
            );
            if (!overlappingBookings.isEmpty()) {
                throw new DoubleBookingException("Sorry, this time slot has just been booked. Please select another available time.");
            }

            List<ChargingSlot> overlappingSlots = chargingSlotRepository.findOverlappingActiveSlots(
                    charger.getId(), -1L, startTime, endTime
            );
            if (!overlappingSlots.isEmpty()) {
                throw new DoubleBookingException("Sorry, this time slot has just been booked. Please select another available time.");
            }
        }

        // 4. Vehicle & Compatibility
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));
            validateConnectorCompatibility(vehicle, charger);
        }

        // 5. Calculate Energy & Cost with Vehicle Specs
        BigDecimal batteryCapacityKwh = (vehicle != null) ? vehicle.getBatteryCapacityKwh() : BigDecimal.valueOf(40.0);
        BigDecimal initialSoc = (request.getInitialSocPercentage() != null)
                ? request.getInitialSocPercentage()
                : (vehicle != null && vehicle.getCurrentSocPercentage() != null ? vehicle.getCurrentSocPercentage() : BigDecimal.valueOf(25.0));
        BigDecimal targetSoc = (request.getTargetSocPercentage() != null)
                ? request.getTargetSocPercentage()
                : BigDecimal.valueOf(80.0);

        if (targetSoc.compareTo(initialSoc) <= 0) {
            targetSoc = initialSoc.add(BigDecimal.valueOf(20.0));
            if (targetSoc.compareTo(BigDecimal.valueOf(100.0)) > 0) {
                targetSoc = BigDecimal.valueOf(100.0);
            }
        }

        BigDecimal socDiff = targetSoc.subtract(initialSoc);
        BigDecimal estimatedBatteryKwh;
        if (socDiff.compareTo(BigDecimal.ZERO) > 0) {
            estimatedBatteryKwh = batteryCapacityKwh.multiply(socDiff).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            double hours = Math.max(0.25, durationMinutes / 60.0);
            estimatedBatteryKwh = charger.getPowerOutputKw().multiply(BigDecimal.valueOf(hours * 0.90)).setScale(2, RoundingMode.HALF_UP);
        }

        // Efficiency eta = 0.90 => Grid energy = Battery energy / 0.90
        BigDecimal estimatedKwh = estimatedBatteryKwh.divide(BigDecimal.valueOf(0.90), 2, RoundingMode.HALF_UP);
        BigDecimal tariff = charger.getPricePerKwh();
        BigDecimal energyCost = estimatedKwh.multiply(tariff).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gstAmount = energyCost.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformFee = BigDecimal.valueOf(15.00).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = energyCost.add(gstAmount).add(platformFee).setScale(2, RoundingMode.HALF_UP);

        // 6. Create confirmed booking entity
        String cityCode = (charger.getStation() != null && charger.getStation().getLocation() != null && charger.getStation().getLocation().getCity() != null)
                ? charger.getStation().getLocation().getCity().getName().toUpperCase().substring(0, Math.min(3, charger.getStation().getLocation().getCity().getName().length()))
                : "EV";
        String dateStr = startTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingRef = String.format("VR-%s-%s-%s", cityCode, dateStr, randStr);

        Booking booking = new Booking();
        booking.setBookingReference(bookingRef);
        booking.setUser(user);
        booking.setCharger(charger);
        booking.setSlot(slot);
        booking.setVehicle(vehicle);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setInitialSocPercentage(initialSoc);
        booking.setTargetSocPercentage(targetSoc);
        booking.setChargingDurationMinutes(durationMinutes);
        booking.setTariffSnapshot(tariff);
        booking.setBaseAmount(energyCost);
        booking.setGstAmount(gstAmount);
        booking.setPlatformFee(platformFee);
        booking.setEstimatedKwh(estimatedKwh);
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");
        booking.setConfirmedAt(now);

        Booking savedBooking = bookingRepository.save(booking);

        // Update vehicle's SOC and range
        if (vehicle != null) {
            vehicle.setCurrentSocPercentage(targetSoc);
            BigDecimal consumption = vehicle.getEnergyConsumptionWhPerKm() != null ? vehicle.getEnergyConsumptionWhPerKm() : BigDecimal.valueOf(140.0);
            BigDecimal energyWh = vehicle.getBatteryCapacityKwh().multiply(targetSoc).multiply(BigDecimal.valueOf(10));
            vehicle.setEstimatedRangeKm(energyWh.divide(consumption, 1, RoundingMode.HALF_UP));
            vehicleRepository.save(vehicle);
        }

        // 7. Create Payment Mock Transaction
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setUser(user);
        payment.setAmount(totalAmount);
        payment.setCurrency("INR");
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI");
        payment.setStatus("SUCCESS");
        payment.setTransactionId("TXN-" + bookingRef);
        paymentRepository.save(payment);

        // 8. Create Charging Session Tracker
        ChargingSession session = new ChargingSession();
        session.setBooking(savedBooking);
        session.setCharger(charger);
        session.setUser(user);
        session.setStatus("PENDING");
        chargingSessionRepository.save(session);

        // 9. Cryptographic Blockchain Block Generation
        BlockchainRecord block = blockchainService.recordBooking(savedBooking);

        logger.info("Successfully confirmed booking {} for user #{} at station {}",
                bookingRef, userId, charger.getStation().getName());

        return buildResponseDto(savedBooking, slot, user, vehicle);
    }

    private void validateConnectorCompatibility(Vehicle vehicle, Charger charger) {
        if (!vehicle.getConnectorType().getId().equals(charger.getConnectorType().getId()) &&
            !vehicle.getConnectorType().getCode().equalsIgnoreCase(charger.getConnectorType().getCode())) {
            throw new IncompatibleChargerException(String.format(
                    "Incompatible charger: Vehicle requires '%s' (%s), but this charger has '%s' (%s).",
                    vehicle.getConnectorType().getName(), vehicle.getConnectorType().getCode(),
                    charger.getConnectorType().getName(), charger.getConnectorType().getCode()
            ));
        }
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponseDto cancelBooking(Long bookingId, Long userId, String reason, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to cancel this booking.");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Booking is already cancelled.");
        }
        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Completed bookings cannot be cancelled.");
        }

        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason != null ? reason : "Cancelled by user");
        Booking updatedBooking = bookingRepository.save(booking);

        // Release slot back to AVAILABLE
        ChargingSlot slot = booking.getSlot();
        if (slot != null) {
            slot.setStatus("AVAILABLE");
            slot.setHeldByUser(null);
            slot.setHoldExpiresAt(null);
            chargingSlotRepository.save(slot);
        }

        // Refund payment mock
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        for (Payment p : payments) {
            p.setStatus("REFUNDED");
            paymentRepository.save(p);
        }

        logger.info("Booking {} cancelled by user #{}", booking.getBookingReference(), userId);
        return buildResponseDto(updatedBooking, slot, booking.getUser(), booking.getVehicle());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(b -> buildResponseDto(b, b.getSlot(), b.getUser(), b.getVehicle()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingById(Long bookingId, Long currentUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: Not authorized to view this booking.");
        }

        return buildResponseDto(booking, booking.getSlot(), booking.getUser(), booking.getVehicle());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReference(String reference, Long currentUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + reference));

        if (!isAdmin && !booking.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: Not authorized to view this booking.");
        }

        return buildResponseDto(booking, booking.getSlot(), booking.getUser(), booking.getVehicle());
    }

    @Override
    @Scheduled(fixedRate = 30000) // runs every 30 seconds
    @Transactional
    public void cleanupExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<ChargingSlot> expiredSlots = chargingSlotRepository.findExpiredHolds(now);
        if (!expiredSlots.isEmpty()) {
            for (ChargingSlot s : expiredSlots) {
                s.setStatus("AVAILABLE");
                s.setHeldByUser(null);
                s.setHoldExpiresAt(null);
                chargingSlotRepository.save(s);
            }
            logger.info("Automatically released {} expired slot holds back to AVAILABLE", expiredSlots.size());
        }

        List<Booking> expiredHeldBookings = bookingRepository.findExpiredHolds(now);
        for (Booking b : expiredHeldBookings) {
            b.setStatus("EXPIRED");
            bookingRepository.save(b);
        }
    }

    @Override
    @Transactional
    public BookingResponseDto simulateChargingSession(Long bookingId, String nextStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        ChargingSlot slot = booking.getSlot();
        ChargingSession session = chargingSessionRepository.findByBookingId(bookingId)
                .orElse(new ChargingSession());

        session.setBooking(booking);
        session.setCharger(booking.getCharger());
        session.setUser(booking.getUser());

        if ("OCCUPIED".equalsIgnoreCase(nextStatus) || "CHARGING".equalsIgnoreCase(nextStatus)) {
            booking.setStatus("OCCUPIED");
            if (slot != null) {
                slot.setStatus("OCCUPIED");
                chargingSlotRepository.save(slot);
            }
            session.setStatus("CHARGING");
            session.setActualStartTime(LocalDateTime.now());
            session.setPeakPowerKw(booking.getCharger().getPowerOutputKw());
        } else if ("COMPLETED".equalsIgnoreCase(nextStatus)) {
            booking.setStatus("COMPLETED");
            if (slot != null) {
                slot.setStatus("COMPLETED");
                chargingSlotRepository.save(slot);
            }
            session.setStatus("COMPLETED");
            session.setActualEndTime(LocalDateTime.now());
            session.setTotalKwhDelivered(booking.getEstimatedKwh());
        }

        bookingRepository.save(booking);
        chargingSessionRepository.save(session);

        return buildResponseDto(booking, slot, booking.getUser(), booking.getVehicle());
    }

    private BookingResponseDto buildResponseDto(Booking booking, ChargingSlot slot, User user, Vehicle vehicle) {
        BookingResponseDto dto = new BookingResponseDto();

        Charger charger = null;
        if (slot != null && slot.getCharger() != null) {
            charger = slot.getCharger();
        } else if (booking != null && booking.getCharger() != null) {
            charger = booking.getCharger();
        }

        if (slot != null) {
            dto.setSlotId(slot.getId());
            dto.setStartTime(slot.getStartTime());
            dto.setEndTime(slot.getEndTime());
            dto.setHoldExpiresAt(slot.getHoldExpiresAt());
        }

        if (charger != null) {
            dto.setChargerId(charger.getId());
            dto.setChargerCode(charger.getIdentifierCode());
            dto.setChargerPowerKw(charger.getPowerOutputKw());
            dto.setPricePerKwh(charger.getPricePerKwh());
            if (charger.getConnectorType() != null) {
                dto.setConnectorTypeCode(charger.getConnectorType().getCode());
            }

            ChargingStation stn = charger.getStation();
            if (stn != null) {
                dto.setStationId(stn.getId());
                dto.setStationName(stn.getName());
                if (stn.getLocation() != null) {
                    dto.setStationAddress(stn.getLocation().getAddress());
                    dto.setStationLatitude(stn.getLocation().getLatitude());
                    dto.setStationLongitude(stn.getLocation().getLongitude());
                    if (stn.getLocation().getCity() != null) {
                        dto.setCityName(stn.getLocation().getCity().getName());
                    }
                }
            }
        }

        if (user != null) {
            dto.setUserId(user.getId());
            dto.setUserName(user.getFullName());
            dto.setUserEmail(user.getEmail());
        }

        Vehicle v = vehicle != null ? vehicle : (booking != null ? booking.getVehicle() : null);
        if (v != null) {
            dto.setVehicleId(v.getId());
            dto.setVehicleInfo(v.getMake() + " " + v.getModel() + (v.getVariant() != null ? " " + v.getVariant() : ""));
            dto.setVehicleType(v.getVehicleType());
            dto.setLicensePlate(v.getLicensePlate());
            dto.setVehicleBatteryCapacityKwh(v.getBatteryCapacityKwh());
        }

        if (booking != null) {
            dto.setId(booking.getId());
            dto.setBookingReference(booking.getBookingReference());
            dto.setStartTime(booking.getStartTime());
            dto.setEndTime(booking.getEndTime());
            dto.setEstimatedKwh(booking.getEstimatedKwh());
            dto.setTotalAmount(booking.getTotalAmount());
            dto.setBaseAmount(booking.getBaseAmount());
            dto.setGstAmount(booking.getGstAmount());
            dto.setPlatformFee(booking.getPlatformFee());
            dto.setInitialSocPercentage(booking.getInitialSocPercentage());
            dto.setTargetSocPercentage(booking.getTargetSocPercentage());
            dto.setChargingDurationMinutes(booking.getChargingDurationMinutes());
            dto.setTariffSnapshot(booking.getTariffSnapshot());
            dto.setStatus(booking.getStatus());
            dto.setConfirmedAt(booking.getConfirmedAt());
            dto.setCancelledAt(booking.getCancelledAt());
            dto.setCancellationReason(booking.getCancellationReason());
            dto.setCreatedAt(booking.getCreatedAt());

            // Compute range added
            if (booking.getInitialSocPercentage() != null && booking.getTargetSocPercentage() != null && v != null) {
                BigDecimal socGain = booking.getTargetSocPercentage().subtract(booking.getInitialSocPercentage());
                if (socGain.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal consumption = v.getEnergyConsumptionWhPerKm() != null ? v.getEnergyConsumptionWhPerKm() : BigDecimal.valueOf(140.0);
                    BigDecimal battKwh = v.getBatteryCapacityKwh() != null ? v.getBatteryCapacityKwh() : BigDecimal.valueOf(40.0);
                    BigDecimal gainWh = battKwh.multiply(socGain).multiply(BigDecimal.valueOf(10));
                    dto.setRangeAddedKm(gainWh.divide(consumption, 1, RoundingMode.HALF_UP));
                }
            }

            Optional<BlockchainRecord> bRecord = blockchainRecordRepository.findByBookingId(booking.getId());
            if (bRecord.isPresent()) {
                dto.setBlockchainHash(bRecord.get().getTransactionHash());
                dto.setPreviousHash(bRecord.get().getPreviousHash());
                dto.setBlockIndex(bRecord.get().getBlockIndex());
                dto.setBlockchainStatus(bRecord.get().getStatus());
            } else {
                dto.setBlockchainStatus("PENDING");
            }
        } else if (slot != null) {
            dto.setStatus(slot.getStatus());
        }

        if (dto.getEstimatedKwh() == null && charger != null && dto.getStartTime() != null && dto.getEndTime() != null) {
            long minutes = Duration.between(dto.getStartTime(), dto.getEndTime()).toMinutes();
            double hours = Math.max(0.25, minutes / 60.0);
            BigDecimal powerKw = charger.getPowerOutputKw();
            BigDecimal estKwh = powerKw.multiply(BigDecimal.valueOf(hours * 0.90)).setScale(2, RoundingMode.HALF_UP);
            if (v != null && estKwh.compareTo(v.getBatteryCapacityKwh()) > 0) {
                estKwh = v.getBatteryCapacityKwh();
            }
            dto.setEstimatedKwh(estKwh);
        }

        if (dto.getEstimatedKwh() != null && charger != null && charger.getPricePerKwh() != null) {
            if (dto.getBaseAmount() == null) {
                BigDecimal base = dto.getEstimatedKwh().multiply(charger.getPricePerKwh()).setScale(2, RoundingMode.HALF_UP);
                dto.setBaseAmount(base);
            }
            if (dto.getGstAmount() == null) {
                dto.setGstAmount(dto.getBaseAmount().multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP));
            }
            if (dto.getPlatformFee() == null) {
                dto.setPlatformFee(BigDecimal.valueOf(15.00).setScale(2, RoundingMode.HALF_UP));
            }
            if (dto.getTotalAmount() == null) {
                dto.setTotalAmount(dto.getBaseAmount().add(dto.getGstAmount()).add(dto.getPlatformFee()).setScale(2, RoundingMode.HALF_UP));
            }
        }

        return dto;
    }
}
