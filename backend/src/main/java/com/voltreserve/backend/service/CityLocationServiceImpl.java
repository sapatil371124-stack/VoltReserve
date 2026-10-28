package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.CityDto;
import com.voltreserve.backend.dto.LocationDto;
import com.voltreserve.backend.entity.City;
import com.voltreserve.backend.entity.Location;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.CityRepository;
import com.voltreserve.backend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityLocationServiceImpl implements CityLocationService {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CityDto> getAllCities() {
        return cityRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapCityToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CityDto getCityById(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with ID: " + id));
        return mapCityToDto(city);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDto> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::mapLocationToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDto> getLocationsByCity(Long cityId) {
        return locationRepository.findByCityId(cityId).stream()
                .map(this::mapLocationToDto)
                .collect(Collectors.toList());
    }

    private CityDto mapCityToDto(City c) {
        return new CityDto(c.getId(), c.getName(), c.getState(), c.getCountry(), c.getLatitude(), c.getLongitude());
    }

    private LocationDto mapLocationToDto(Location l) {
        LocationDto dto = new LocationDto();
        dto.setId(l.getId());
        dto.setCityId(l.getCity().getId());
        dto.setCityName(l.getCity().getName());
        dto.setName(l.getName());
        dto.setAddress(l.getAddress());
        dto.setLandmark(l.getLandmark());
        dto.setPostalCode(l.getPostalCode());
        dto.setLatitude(l.getLatitude());
        dto.setLongitude(l.getLongitude());
        return dto;
    }
}
