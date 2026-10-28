package com.voltreserve.backend.dto;

import java.math.BigDecimal;

public class CityDto {
    private Long id;
    private String name;
    private String state;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public CityDto() {}

    public CityDto(Long id, String name, String state, String country, BigDecimal latitude, BigDecimal longitude) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
}
