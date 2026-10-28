package com.voltreserve.backend.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates great-circle distance between two points in kilometers using Haversine formula.
     */
    public static double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;

        return BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Estimates travel duration in minutes given road distance in km.
     * Assumes average speed of 35 km/h in mixed urban/suburban conditions with traffic margin.
     */
    public static int estimateTravelMinutes(double distanceKm) {
        if (distanceKm <= 0.1) return 1;
        double hours = distanceKm / 35.0; // 35 km/h avg traffic speed
        int minutes = (int) Math.ceil(hours * 60.0);
        return Math.max(minutes, 2);
    }

    /**
     * Generates a realistic road-like waypoint polyline between origin and destination
     * for map rendering without requiring external paid routing API keys.
     */
    public static List<List<Double>> generateRoutePolyline(double startLat, double startLng, double endLat, double endLng) {
        List<List<Double>> points = new ArrayList<>();
        points.add(List.of(startLat, startLng));

        int segments = Math.max(8, (int) Math.min(25, calculateHaversineDistanceKm(startLat, startLng, endLat, endLng) * 2));

        for (int i = 1; i < segments; i++) {
            double fraction = (double) i / segments;
            double interLat = startLat + fraction * (endLat - startLat);
            double interLng = startLng + fraction * (endLng - startLng);

            // Add slight curve offset perpendicular to straight vector for road simulation
            double offset = Math.sin(fraction * Math.PI) * 0.003 * ((i % 2 == 0) ? 1.0 : -0.7);
            double latWiggle = interLat + offset * 0.4;
            double lngWiggle = interLng + offset * 0.8;

            points.add(List.of(
                    BigDecimal.valueOf(latWiggle).setScale(6, RoundingMode.HALF_UP).doubleValue(),
                    BigDecimal.valueOf(lngWiggle).setScale(6, RoundingMode.HALF_UP).doubleValue()
            ));
        }

        points.add(List.of(endLat, endLng));
        return points;
    }
}
