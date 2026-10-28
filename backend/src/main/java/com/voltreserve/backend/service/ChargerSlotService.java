package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.ChargerDto;
import com.voltreserve.backend.dto.ChargingSlotDto;
import com.voltreserve.backend.dto.FlexibleIntervalDto;
import com.voltreserve.backend.dto.SlotGenerateRequest;

import java.time.LocalDate;
import java.util.List;

public interface ChargerSlotService {
    List<ChargerDto> getChargersByStation(Long stationId);
    ChargerDto getChargerById(Long id);
    List<ChargingSlotDto> getSlotsByCharger(Long chargerId, LocalDate date, Long currentUserId);
    List<FlexibleIntervalDto> getFlexibleIntervals(Long chargerId, LocalDate date, int durationMinutes, Long currentUserId);
    int generateSlots(SlotGenerateRequest request);
    ChargerDto createCharger(ChargerDto dto);
    ChargerDto updateCharger(Long id, ChargerDto dto);
    void deleteCharger(Long id);
}
