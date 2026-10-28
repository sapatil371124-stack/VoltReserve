package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.*;
import com.voltreserve.backend.entity.*;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.*;
import com.voltreserve.backend.util.GeoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChargingStationServiceImpl implements ChargingStationService {

    @Autowired
    private ChargingStationRepository chargingStationRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ChargingSlotRepository chargingSlotRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChargingStationDto> searchStations(Long cityId, Long locationId, Long connectorTypeId, String keyword, Double userLat, Double userLon) {
        return searchStations(cityId, null, locationId, connectorTypeId, keyword, userLat, userLon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingStationDto> searchStations(Long cityId, String cityName, Long locationId, Long connectorTypeId, String keyword, Double userLat, Double userLon) {
        Long resolvedCityId = cityId;
        String resolvedCityName = (cityName != null && !cityName.trim().isEmpty()) ? cityName.trim() : null;

        List<ChargingStation> stations = chargingStationRepository.searchStations(resolvedCityId, resolvedCityName, locationId, connectorTypeId, keyword);
        return stations.stream()
                .map(s -> mapToDto(s, userLat, userLon))
                .sorted((a, b) -> {
                    if (a.getDistanceKm() != null && b.getDistanceKm() != null) {
                        return Double.compare(a.getDistanceKm(), b.getDistanceKm());
                    }
                    return Long.compare(a.getId(), b.getId());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChargingStationDto getStationById(Long id, Double userLat, Double userLon) {
        ChargingStation station = chargingStationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + id));
        return mapToDto(station, userLat, userLon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingStationDto> compareStations(List<Long> stationIds, Double userLat, Double userLon) {
        if (stationIds == null || stationIds.isEmpty()) {
            return Collections.emptyList();
        }
        return stationIds.stream()
                .map(id -> chargingStationRepository.findById(id))
                .filter(Optional::isPresent)
                .map(opt -> mapToDto(opt.get(), userLat, userLon))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingStationDto> getRecommendations(Double userLat, Double userLon, Long vehicleId, String connectorCode, BigDecimal minPowerKw) {
        List<ChargingStation> stations = chargingStationRepository.findByIsActiveTrue();

        String requiredConnector = connectorCode;
        if (requiredConnector == null && vehicleId != null) {
            Optional<Vehicle> v = vehicleRepository.findById(vehicleId);
            if (v.isPresent()) {
                requiredConnector = v.get().getConnectorType().getCode();
            }
        }

        final String finalConnector = requiredConnector;

        List<ChargingStationDto> dtos = stations.stream()
                .map(s -> mapToDto(s, userLat, userLon))
                .filter(dto -> {
                    if (finalConnector != null && !dto.getSupportedConnectors().contains(finalConnector)) {
                        return false;
                    }
                    if (minPowerKw != null && dto.getMaxPowerKw().compareTo(minPowerKw) < 0) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Multi-criteria recommendation score:
        // Score = 40% (Proximity) + 25% (Availability) + 20% (Speed/Power) + 15% (Rating)
        dtos.sort((a, b) -> {
            double scoreA = calculateRecommendationScore(a);
            double scoreB = calculateRecommendationScore(b);
            return Double.compare(scoreB, scoreA); // descending
        });

        return dtos;
    }

    private double calculateRecommendationScore(ChargingStationDto s) {
        double score = 0.0;
        // Distance score (max 40 pts, full score if within 3 km, decays up to 50 km)
        if (s.getDistanceKm() != null) {
            double dist = Math.max(0.1, s.getDistanceKm());
            score += Math.max(0, 40.0 * (1.0 - (dist / 50.0)));
        } else {
            score += 20.0;
        }

        // Availability score (max 25 pts)
        if (s.getAvailableChargersCount() != null && s.getAvailableChargersCount() > 0) {
            score += Math.min(25.0, s.getAvailableChargersCount() * 10.0);
        }

        // Power/Speed score (max 20 pts)
        if (s.getMaxPowerKw() != null) {
            score += Math.min(20.0, (s.getMaxPowerKw().doubleValue() / 150.0) * 20.0);
        }

        // Rating score (max 15 pts)
        if (s.getRating() != null) {
            score += (s.getRating().doubleValue() / 5.0) * 15.0;
        }

        return score;
    }

    @Override
    @Transactional
    public ChargingStationDto createStation(ChargingStationDto dto) {
        Location location = locationRepository.findById(dto.getLocation().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with ID: " + dto.getLocation().getId()));

        ChargingStation station = new ChargingStation();
        station.setLocation(location);
        station.setName(dto.getName());
        station.setDescription(dto.getDescription());
        station.setOperatingHours(dto.getOperatingHours() != null ? dto.getOperatingHours() : "24/7");
        station.setAmenities(dto.getAmenities());
        station.setRating(dto.getRating() != null ? dto.getRating() : new BigDecimal("4.50"));
        station.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        station.setContactPhone(dto.getContactPhone());

        ChargingStation saved = chargingStationRepository.save(station);
        return mapToDto(saved, null, null);
    }

    @Override
    @Transactional
    public ChargingStationDto updateStation(Long id, ChargingStationDto dto) {
        ChargingStation station = chargingStationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with ID: " + id));

        if (dto.getLocation() != null && dto.getLocation().getId() != null) {
            Location loc = locationRepository.findById(dto.getLocation().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
            station.setLocation(loc);
        }

        if (dto.getName() != null) station.setName(dto.getName());
        if (dto.getDescription() != null) station.setDescription(dto.getDescription());
        if (dto.getOperatingHours() != null) station.setOperatingHours(dto.getOperatingHours());
        if (dto.getAmenities() != null) station.setAmenities(dto.getAmenities());
        if (dto.getRating() != null) station.setRating(dto.getRating());
        if (dto.getIsActive() != null) station.setIsActive(dto.getIsActive());
        if (dto.getContactPhone() != null) station.setContactPhone(dto.getContactPhone());

        ChargingStation updated = chargingStationRepository.save(station);
        return mapToDto(updated, null, null);
    }

    @Override
    @Transactional
    public void deleteStation(Long id) {
        ChargingStation station = chargingStationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with ID: " + id));
        chargingStationRepository.delete(station);
    }

    private ChargingStationDto mapToDto(ChargingStation s, Double userLat, Double userLon) {
        ChargingStationDto dto = new ChargingStationDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setDescription(s.getDescription());
        dto.setOperatingHours(s.getOperatingHours());
        dto.setAmenities(s.getAmenities());
        dto.setRating(s.getRating());
        dto.setIsActive(s.getIsActive());
        dto.setContactPhone(s.getContactPhone());

        if (s.getLocation() != null) {
            LocationDto locDto = new LocationDto();
            locDto.setId(s.getLocation().getId());
            locDto.setCityId(s.getLocation().getCity().getId());
            locDto.setCityName(s.getLocation().getCity().getName());
            locDto.setName(s.getLocation().getName());
            locDto.setAddress(s.getLocation().getAddress());
            locDto.setLandmark(s.getLocation().getLandmark());
            locDto.setPostalCode(s.getLocation().getPostalCode());
            locDto.setLatitude(s.getLocation().getLatitude());
            locDto.setLongitude(s.getLocation().getLongitude());
            dto.setLocation(locDto);

            if (userLat != null && userLon != null) {
                double dist = GeoUtils.calculateHaversineDistanceKm(
                        userLat, userLon,
                        s.getLocation().getLatitude().doubleValue(),
                        s.getLocation().getLongitude().doubleValue()
                );
                dto.setDistanceKm(dist);
                dto.setEstimatedTravelMinutes(GeoUtils.estimateTravelMinutes(dist));
            }
        }

        List<Charger> chargers = chargerRepository.findByStationId(s.getId());
        List<ChargerDto> chargerDtos = new ArrayList<>();
        Set<String> connectors = new HashSet<>();
        BigDecimal minPrice = null;
        BigDecimal maxPower = BigDecimal.ZERO;
        int availableCount = 0;

        for (Charger c : chargers) {
            ChargerDto cd = new ChargerDto();
            cd.setId(c.getId());
            cd.setStationId(s.getId());
            cd.setStationName(s.getName());
            cd.setConnectorTypeId(c.getConnectorType().getId());
            cd.setConnectorTypeCode(c.getConnectorType().getCode());
            cd.setConnectorTypeName(c.getConnectorType().getName());
            cd.setIdentifierCode(c.getIdentifierCode());
            cd.setPowerOutputKw(c.getPowerOutputKw());
            cd.setCurrentType(c.getCurrentType());
            cd.setPricePerKwh(c.getPricePerKwh());
            cd.setStatus(c.getStatus());

            if ("ACTIVE".equalsIgnoreCase(c.getStatus())) {
                availableCount++;
            }

            connectors.add(c.getConnectorType().getCode());

            if (minPrice == null || c.getPricePerKwh().compareTo(minPrice) < 0) {
                minPrice = c.getPricePerKwh();
            }
            if (c.getPowerOutputKw().compareTo(maxPower) > 0) {
                maxPower = c.getPowerOutputKw();
            }

            chargerDtos.add(cd);
        }

        dto.setChargers(chargerDtos);
        dto.setTotalChargersCount(chargers.size());
        dto.setAvailableChargersCount(availableCount);
        dto.setMinPricePerKwh(minPrice != null ? minPrice : BigDecimal.ZERO);
        dto.setMaxPowerKw(maxPower);
        dto.setSupportedConnectors(new ArrayList<>(connectors));

        // Estimation calculations for a 25 kWh session
        if (maxPower.compareTo(BigDecimal.ZERO) > 0) {
            double hours = 25.0 / maxPower.doubleValue();
            dto.setEstimatedChargingMinutes((int) Math.ceil(hours * 60.0));
        } else {
            dto.setEstimatedChargingMinutes(45);
        }

        if (minPrice != null) {
            dto.setEstimatedCost(minPrice.multiply(new BigDecimal("25.0")).setScale(2, RoundingMode.HALF_UP));
        } else {
            dto.setEstimatedCost(BigDecimal.ZERO);
        }

        return dto;
    }
}
