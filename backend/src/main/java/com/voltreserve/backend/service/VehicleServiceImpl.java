package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.ConnectorTypeDto;
import com.voltreserve.backend.dto.VehicleDto;
import com.voltreserve.backend.entity.ConnectorType;
import com.voltreserve.backend.entity.User;
import com.voltreserve.backend.entity.Vehicle;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.ConnectorTypeRepository;
import com.voltreserve.backend.repository.UserRepository;
import com.voltreserve.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectorTypeRepository connectorTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VehicleDto> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId).stream()
                .map(this::mapVehicleToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + vehicleId));
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }
        return mapVehicleToDto(vehicle);
    }

    @Override
    @Transactional
    public VehicleDto createVehicle(VehicleDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        ConnectorType connector = connectorTypeRepository.findById(dto.getConnectorTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Connector type not found with ID: " + dto.getConnectorTypeId()));

        List<Vehicle> existing = vehicleRepository.findByUserId(userId);

        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        vehicle.setVariant(dto.getVariant());
        vehicle.setVehicleType(dto.getVehicleType() != null ? dto.getVehicleType() : "CAR");
        vehicle.setBatteryCapacityKwh(dto.getBatteryCapacityKwh() != null ? dto.getBatteryCapacityKwh() : BigDecimal.valueOf(40.0));
        vehicle.setMaxChargingRateKw(dto.getMaxChargingRateKw() != null ? dto.getMaxChargingRateKw() : BigDecimal.valueOf(50.0));
        vehicle.setMaxAcChargingRateKw(dto.getMaxAcChargingRateKw() != null ? dto.getMaxAcChargingRateKw() : BigDecimal.valueOf(7.4));
        vehicle.setMaxDcChargingRateKw(dto.getMaxDcChargingRateKw() != null ? dto.getMaxDcChargingRateKw() : dto.getMaxChargingRateKw());
        vehicle.setCurrentSocPercentage(dto.getCurrentSocPercentage() != null ? dto.getCurrentSocPercentage() : BigDecimal.valueOf(25.0));
        
        // Calculate range if not provided: (capacity * (soc/100) * 1000) / consumption
        BigDecimal consumption = dto.getEnergyConsumptionWhPerKm() != null ? dto.getEnergyConsumptionWhPerKm() : BigDecimal.valueOf(140.0);
        vehicle.setEnergyConsumptionWhPerKm(consumption);
        if (dto.getEstimatedRangeKm() != null) {
            vehicle.setEstimatedRangeKm(dto.getEstimatedRangeKm());
        } else {
            BigDecimal energyWh = vehicle.getBatteryCapacityKwh()
                    .multiply(vehicle.getCurrentSocPercentage())
                    .multiply(BigDecimal.valueOf(10)); // (kWh * 1000 * soc / 100) = kWh * soc * 10
            BigDecimal calcRange = energyWh.divide(consumption, 1, RoundingMode.HALF_UP);
            vehicle.setEstimatedRangeKm(calcRange);
        }

        vehicle.setConnectorType(connector);
        vehicle.setLicensePlate(dto.getLicensePlate());
        
        boolean isFirst = existing.isEmpty();
        if (dto.getIsDefault() != null && dto.getIsDefault()) {
            existing.forEach(v -> v.setIsDefault(false));
            vehicleRepository.saveAll(existing);
            vehicle.setIsDefault(true);
        } else {
            vehicle.setIsDefault(isFirst);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapVehicleToDto(saved);
    }

    @Override
    @Transactional
    public VehicleDto updateVehicle(Long vehicleId, VehicleDto dto, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + vehicleId));
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        if (dto.getConnectorTypeId() != null) {
            ConnectorType connector = connectorTypeRepository.findById(dto.getConnectorTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Connector type not found: " + dto.getConnectorTypeId()));
            vehicle.setConnectorType(connector);
        }

        if (dto.getMake() != null) vehicle.setMake(dto.getMake());
        if (dto.getModel() != null) vehicle.setModel(dto.getModel());
        if (dto.getVariant() != null) vehicle.setVariant(dto.getVariant());
        if (dto.getVehicleType() != null) vehicle.setVehicleType(dto.getVehicleType());
        if (dto.getBatteryCapacityKwh() != null) vehicle.setBatteryCapacityKwh(dto.getBatteryCapacityKwh());
        if (dto.getMaxChargingRateKw() != null) vehicle.setMaxChargingRateKw(dto.getMaxChargingRateKw());
        if (dto.getMaxAcChargingRateKw() != null) vehicle.setMaxAcChargingRateKw(dto.getMaxAcChargingRateKw());
        if (dto.getMaxDcChargingRateKw() != null) vehicle.setMaxDcChargingRateKw(dto.getMaxDcChargingRateKw());
        if (dto.getLicensePlate() != null) vehicle.setLicensePlate(dto.getLicensePlate());
        if (dto.getCurrentSocPercentage() != null) vehicle.setCurrentSocPercentage(dto.getCurrentSocPercentage());
        if (dto.getEstimatedRangeKm() != null) vehicle.setEstimatedRangeKm(dto.getEstimatedRangeKm());
        if (dto.getEnergyConsumptionWhPerKm() != null) vehicle.setEnergyConsumptionWhPerKm(dto.getEnergyConsumptionWhPerKm());

        if (dto.getIsDefault() != null && dto.getIsDefault()) {
            List<Vehicle> allUserVehicles = vehicleRepository.findByUserId(userId);
            allUserVehicles.forEach(v -> v.setIsDefault(false));
            vehicleRepository.saveAll(allUserVehicles);
            vehicle.setIsDefault(true);
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return mapVehicleToDto(updated);
    }

    @Override
    @Transactional
    public VehicleDto updateVehicleSoc(Long vehicleId, BigDecimal currentSoc, BigDecimal estimatedRange, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + vehicleId));
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        vehicle.setCurrentSocPercentage(currentSoc);
        if (estimatedRange != null) {
            vehicle.setEstimatedRangeKm(estimatedRange);
        } else {
            // Recompute from consumption
            BigDecimal consumption = vehicle.getEnergyConsumptionWhPerKm() != null ? vehicle.getEnergyConsumptionWhPerKm() : BigDecimal.valueOf(140.0);
            BigDecimal energyWh = vehicle.getBatteryCapacityKwh()
                    .multiply(currentSoc)
                    .multiply(BigDecimal.valueOf(10));
            BigDecimal calcRange = energyWh.divide(consumption, 1, RoundingMode.HALF_UP);
            vehicle.setEstimatedRangeKm(calcRange);
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return mapVehicleToDto(updated);
    }

    @Override
    @Transactional
    public VehicleDto setDefaultVehicle(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + vehicleId));
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        List<Vehicle> allUserVehicles = vehicleRepository.findByUserId(userId);
        allUserVehicles.forEach(v -> v.setIsDefault(v.getId().equals(vehicleId)));
        vehicleRepository.saveAll(allUserVehicles);

        return mapVehicleToDto(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        boolean wasDefault = Boolean.TRUE.equals(vehicle.getIsDefault());
        vehicleRepository.delete(vehicle);

        if (wasDefault) {
            List<Vehicle> remaining = vehicleRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                vehicleRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConnectorTypeDto> getAllConnectorTypes() {
        return connectorTypeRepository.findAll().stream().map(c ->
                new ConnectorTypeDto(c.getId(), c.getCode(), c.getName(), c.getCurrentType(), c.getMaxPowerKw(), c.getDescription())
        ).collect(Collectors.toList());
    }

    private VehicleDto mapVehicleToDto(Vehicle v) {
        VehicleDto dto = new VehicleDto();
        dto.setId(v.getId());
        dto.setUserId(v.getUser().getId());
        dto.setMake(v.getMake());
        dto.setModel(v.getModel());
        dto.setVariant(v.getVariant());
        dto.setVehicleType(v.getVehicleType());
        dto.setBatteryCapacityKwh(v.getBatteryCapacityKwh());
        dto.setMaxChargingRateKw(v.getMaxChargingRateKw());
        dto.setMaxAcChargingRateKw(v.getMaxAcChargingRateKw());
        dto.setMaxDcChargingRateKw(v.getMaxDcChargingRateKw());
        dto.setCurrentSocPercentage(v.getCurrentSocPercentage());
        dto.setEstimatedRangeKm(v.getEstimatedRangeKm());
        dto.setEnergyConsumptionWhPerKm(v.getEnergyConsumptionWhPerKm());
        dto.setIsDefault(v.getIsDefault());
        if (v.getConnectorType() != null) {
            dto.setConnectorTypeId(v.getConnectorType().getId());
            dto.setConnectorTypeCode(v.getConnectorType().getCode());
            dto.setConnectorTypeName(v.getConnectorType().getName());
        }
        dto.setLicensePlate(v.getLicensePlate());
        return dto;
    }
}
