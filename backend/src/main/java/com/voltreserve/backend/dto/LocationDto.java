package com.voltreserve.backend.dto;

import java.math.BigDecimal;

public class LocationDto {
    private Long id;
    private Long cityId;
    private String cityName;
    private String name;
    private String address;
    private String landmark;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public LocationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
}
