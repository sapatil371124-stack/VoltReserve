package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.CityDto;
import com.voltreserve.backend.dto.LocationDto;

import java.util.List;

public interface CityLocationService {
    List<CityDto> getAllCities();
    CityDto getCityById(Long id);
    List<LocationDto> getAllLocations();
    List<LocationDto> getLocationsByCity(Long cityId);
}
