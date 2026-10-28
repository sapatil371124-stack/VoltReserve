package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.ChargerDto;
import com.voltreserve.backend.dto.ChargingSlotDto;
import com.voltreserve.backend.dto.FlexibleIntervalDto;
import com.voltreserve.backend.dto.SlotGenerateRequest;
import com.voltreserve.backend.entity.Booking;
import com.voltreserve.backend.entity.Charger;
import com.voltreserve.backend.entity.ChargingSlot;
import com.voltreserve.backend.entity.ChargingStation;
import com.voltreserve.backend.entity.ConnectorType;
import com.voltreserve.backend.exception.BadRequestException;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.BookingRepository;
import com.voltreserve.backend.repository.ChargerRepository;
import com.voltreserve.backend.repository.ChargingSlotRepository;
import com.voltreserve.backend.repository.ChargingStationRepository;
import com.voltreserve.backend.repository.ConnectorTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChargerSlotServiceImpl implements ChargerSlotService {

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ChargingSlotRepository chargingSlotRepository;

    @Autowired
    private ChargingStationRepository chargingStationRepository;

    @Autowired
    private ConnectorTypeRepository connectorTypeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChargerDto> getChargersByStation(Long stationId) {
        return chargerRepository.findByStationId(stationId).stream()
                .map(this::mapChargerToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChargerDto getChargerById(Long id) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + id));
        return mapChargerToDto(charger);
    }

    @Override
    @Transactional
    public List<ChargingSlotDto> getSlotsByCharger(Long chargerId, LocalDate date, Long currentUserId) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime dayEnd = targetDate.atTime(LocalTime.MAX);

        List<ChargingSlot> slots = chargingSlotRepository
                .findByChargerIdAndStartTimeBetweenOrderByStartTimeAsc(chargerId, dayStart, dayEnd);

        // If no slots exist for this charger on the requested date, dynamically initialize slots (8 AM to 10 PM)
        if (slots.isEmpty()) {
            Charger charger = chargerRepository.findById(chargerId).orElse(null);
            if (charger != null) {
                List<ChargingSlot> newSlots = new ArrayList<>();
                LocalTime current = LocalTime.of(8, 0);
                LocalTime end = LocalTime.of(22, 0);
                while (current.isBefore(end)) {
                    LocalDateTime sStart = LocalDateTime.of(targetDate, current);
                    LocalDateTime sEnd = sStart.plusMinutes(30);
                    ChargingSlot slot = new ChargingSlot();
                    slot.setCharger(charger);
                    slot.setStartTime(sStart);
                    slot.setEndTime(sEnd);
                    slot.setStatus("AVAILABLE");
                    slot.setVersion(0);
                    newSlots.add(slot);
                    current = current.plusMinutes(30);
                }
                slots = chargingSlotRepository.saveAll(newSlots);
            }
        }

        // Eagerly release any expired holds
        LocalDateTime now = LocalDateTime.now();
        for (ChargingSlot s : slots) {
            if ("HELD".equalsIgnoreCase(s.getStatus()) && s.getHoldExpiresAt() != null && s.getHoldExpiresAt().isBefore(now)) {
                s.setStatus("AVAILABLE");
                s.setHeldByUser(null);
                s.setHoldExpiresAt(null);
                chargingSlotRepository.save(s);
            }
        }

        return slots.stream().map(s -> {
            ChargingSlotDto dto = new ChargingSlotDto();
            dto.setId(s.getId());
            dto.setChargerId(s.getCharger().getId());
            dto.setChargerCode(s.getCharger().getIdentifierCode());
            dto.setConnectorTypeCode(s.getCharger().getConnectorType().getCode());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setStatus(s.getStatus());
            dto.setHoldExpiresAt(s.getHoldExpiresAt());
            dto.setVersion(s.getVersion());

            if (currentUserId != null && s.getHeldByUser() != null && currentUserId.equals(s.getHeldByUser().getId())) {
                dto.setHeldByCurrentUser(true);
            } else {
                dto.setHeldByCurrentUser(false);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlexibleIntervalDto> getFlexibleIntervals(Long chargerId, LocalDate date, int durationMinutes, Long currentUserId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + chargerId));

        LocalDate targetDate = date != null ? date : LocalDate.now();
        int duration = durationMinutes > 0 ? durationMinutes : 45;

        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime dayEnd = targetDate.atTime(LocalTime.MAX);

        // Fetch all active bookings on this charger for the day
        List<Booking> activeBookings = bookingRepository.findOverlappingActiveBookings(chargerId, dayStart, dayEnd);

        // Also fetch active slots
        List<ChargingSlot> activeSlots = chargingSlotRepository.findByChargerIdAndStartTimeBetweenOrderByStartTimeAsc(chargerId, dayStart, dayEnd);

        LocalDateTime now = LocalDateTime.now();
        List<FlexibleIntervalDto> intervals = new ArrayList<>();

        LocalDateTime cursor = LocalDateTime.of(targetDate, LocalTime.of(6, 0));
        LocalDateTime dayCutoff = LocalDateTime.of(targetDate, LocalTime.of(23, 45));

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        while (!cursor.plusMinutes(duration).isAfter(dayCutoff)) {
            LocalDateTime start = cursor;
            LocalDateTime end = start.plusMinutes(duration);

            boolean isAvailable = true;
            String conflictReason = null;

            if (start.isBefore(now)) {
                isAvailable = false;
                conflictReason = "PAST_TIME";
            } else {
                // Check booking conflict
                for (Booking b : activeBookings) {
                    if (start.isBefore(b.getEndTime()) && end.isAfter(b.getStartTime())) {
                        isAvailable = false;
                        conflictReason = "BOOKED";
                        break;
                    }
                }

                // Check slot conflict if still available
                if (isAvailable) {
                    for (ChargingSlot s : activeSlots) {
                        if ("BOOKED".equalsIgnoreCase(s.getStatus()) || 
                           ("HELD".equalsIgnoreCase(s.getStatus()) && s.getHoldExpiresAt() != null && s.getHoldExpiresAt().isAfter(now))) {
                            if (start.isBefore(s.getEndTime()) && end.isAfter(s.getStartTime())) {
                                isAvailable = false;
                                conflictReason = "BOOKED";
                                break;
                            }
                        }
                    }
                }
            }

            String label = start.format(timeFmt) + " – " + end.format(timeFmt);
            intervals.add(new FlexibleIntervalDto(
                    start, end, label, duration, isAvailable, conflictReason,
                    charger.getId(), charger.getPowerOutputKw(), charger.getPricePerKwh()
            ));

            cursor = cursor.plusMinutes(15);
        }

        return intervals;
    }

    @Override
    @Transactional
    public int generateSlots(SlotGenerateRequest request) {
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

        LocalDate date = request.getDate();
        int stepMins = request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 30;
        int startH = Math.max(0, Math.min(23, request.getStartHour()));
        int endH = Math.max(startH + 1, Math.min(24, request.getEndHour()));

        LocalTime currentCursor = LocalTime.of(startH, 0);
        LocalTime stopCursor = (endH == 24) ? LocalTime.of(23, 59, 59) : LocalTime.of(endH, 0);

        int count = 0;
        while (currentCursor.plusMinutes(stepMins).isBefore(stopCursor) || currentCursor.plusMinutes(stepMins).equals(stopCursor)) {
            LocalDateTime slotStart = LocalDateTime.of(date, currentCursor);
            LocalDateTime slotEnd = slotStart.plusMinutes(stepMins);

            if (!chargingSlotRepository.existsByChargerIdAndStartTime(charger.getId(), slotStart)) {
                ChargingSlot slot = new ChargingSlot();
                slot.setCharger(charger);
                slot.setStartTime(slotStart);
                slot.setEndTime(slotEnd);
                slot.setStatus("AVAILABLE");
                slot.setVersion(0);
                chargingSlotRepository.save(slot);
                count++;
            }

            currentCursor = currentCursor.plusMinutes(stepMins);
        }

        return count;
    }

    @Override
    @Transactional
    public ChargerDto createCharger(ChargerDto dto) {
        ChargingStation station = chargingStationRepository.findById(dto.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));
        ConnectorType connector = connectorTypeRepository.findById(dto.getConnectorTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Connector type not found"));

        Charger charger = new Charger();
        charger.setStation(station);
        charger.setConnectorType(connector);
        charger.setIdentifierCode(dto.getIdentifierCode());
        charger.setPowerOutputKw(dto.getPowerOutputKw());
        charger.setCurrentType(dto.getCurrentType());
        charger.setPricePerKwh(dto.getPricePerKwh());
        charger.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Charger saved = chargerRepository.save(charger);
        return mapChargerToDto(saved);
    }

    @Override
    @Transactional
    public ChargerDto updateCharger(Long id, ChargerDto dto) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found"));

        if (dto.getConnectorTypeId() != null) {
            ConnectorType connector = connectorTypeRepository.findById(dto.getConnectorTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Connector type not found"));
            charger.setConnectorType(connector);
        }

        if (dto.getIdentifierCode() != null) charger.setIdentifierCode(dto.getIdentifierCode());
        if (dto.getPowerOutputKw() != null) charger.setPowerOutputKw(dto.getPowerOutputKw());
        if (dto.getCurrentType() != null) charger.setCurrentType(dto.getCurrentType());
        if (dto.getPricePerKwh() != null) charger.setPricePerKwh(dto.getPricePerKwh());
        if (dto.getStatus() != null) charger.setStatus(dto.getStatus());

        Charger updated = chargerRepository.save(charger);
        return mapChargerToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCharger(Long id) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + id));
        chargerRepository.delete(charger);
    }

    private ChargerDto mapChargerToDto(Charger c) {
        ChargerDto dto = new ChargerDto();
        dto.setId(c.getId());
        dto.setStationId(c.getStation().getId());
        dto.setStationName(c.getStation().getName());
        dto.setConnectorTypeId(c.getConnectorType().getId());
        dto.setConnectorTypeCode(c.getConnectorType().getCode());
        dto.setConnectorTypeName(c.getConnectorType().getName());
        dto.setIdentifierCode(c.getIdentifierCode());
        dto.setPowerOutputKw(c.getPowerOutputKw());
        dto.setCurrentType(c.getCurrentType());
        dto.setPricePerKwh(c.getPricePerKwh());
        dto.setStatus(c.getStatus());
        return dto;
    }
}
