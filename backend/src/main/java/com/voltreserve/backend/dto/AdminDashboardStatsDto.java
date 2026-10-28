package com.voltreserve.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalStations;
    private long totalChargers;
    private long availableChargers;
    private long activeBookings;
    private long todayBookings;
    private long completedSessions;
    private BigDecimal totalRevenue;
    private double stationUtilizationRate;
    private long verifiedBlockchainBlocks;
    private List<Map<String, Object>> recentBookings;
    private List<Map<String, Object>> chargerStatusBreakdown;

    public AdminDashboardStatsDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalStations() { return totalStations; }
    public void setTotalStations(long totalStations) { this.totalStations = totalStations; }
    public long getTotalChargers() { return totalChargers; }
    public void setTotalChargers(long totalChargers) { this.totalChargers = totalChargers; }
    public long getAvailableChargers() { return availableChargers; }
    public void setAvailableChargers(long availableChargers) { this.availableChargers = availableChargers; }
    public long getActiveBookings() { return activeBookings; }
    public void setActiveBookings(long activeBookings) { this.activeBookings = activeBookings; }
    public long getTodayBookings() { return todayBookings; }
    public void setTodayBookings(long todayBookings) { this.todayBookings = todayBookings; }
    public long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public double getStationUtilizationRate() { return stationUtilizationRate; }
    public void setStationUtilizationRate(double stationUtilizationRate) { this.stationUtilizationRate = stationUtilizationRate; }
    public long getVerifiedBlockchainBlocks() { return verifiedBlockchainBlocks; }
    public void setVerifiedBlockchainBlocks(long verifiedBlockchainBlocks) { this.verifiedBlockchainBlocks = verifiedBlockchainBlocks; }
    public List<Map<String, Object>> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<Map<String, Object>> recentBookings) { this.recentBookings = recentBookings; }
    public List<Map<String, Object>> getChargerStatusBreakdown() { return chargerStatusBreakdown; }
    public void setChargerStatusBreakdown(List<Map<String, Object>> chargerStatusBreakdown) { this.chargerStatusBreakdown = chargerStatusBreakdown; }
}
