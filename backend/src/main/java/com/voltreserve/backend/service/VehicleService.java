package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.ConnectorTypeDto;
import com.voltreserve.backend.dto.VehicleDto;

import java.math.BigDecimal;
import java.util.List;

public interface VehicleService {
    List<VehicleDto> getUserVehicles(Long userId);
    VehicleDto getVehicleById(Long vehicleId, Long userId);
    VehicleDto createVehicle(VehicleDto dto, Long userId);
    VehicleDto updateVehicle(Long vehicleId, VehicleDto dto, Long userId);
    VehicleDto updateVehicleSoc(Long vehicleId, BigDecimal currentSoc, BigDecimal estimatedRange, Long userId);
    VehicleDto setDefaultVehicle(Long vehicleId, Long userId);
    void deleteVehicle(Long vehicleId, Long userId);
    List<ConnectorTypeDto> getAllConnectorTypes();
}
