package com.voltreserve.backend.routing;

import com.voltreserve.backend.dto.RouteRequest;
import com.voltreserve.backend.dto.RouteResponse;
import com.voltreserve.backend.util.GeoUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class RoutingServiceImpl implements RoutingService {

    @Override
    public RouteResponse calculateRoute(RouteRequest request) {
        double oLat = request.getOriginLat().doubleValue();
        double oLng = request.getOriginLng().doubleValue();
        double dLat = request.getDestinationLat().doubleValue();
        double dLng = request.getDestinationLng().doubleValue();

        double straightDistance = GeoUtils.calculateHaversineDistanceKm(oLat, oLng, dLat, dLng);
        // Urban road winding factor (~1.22 multiplier)
        double roadDistance = BigDecimal.valueOf(straightDistance * 1.22)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        int durationMinutes = GeoUtils.estimateTravelMinutes(roadDistance);

        // Standard EV efficiency: ~0.16 kWh per km
        double estimatedKwh = BigDecimal.valueOf(roadDistance * 0.16)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        List<List<Double>> polyline = GeoUtils.generateRoutePolyline(oLat, oLng, dLat, dLng);

        String summary = String.format("Fastest route via arterial corridor (%.1f km, ~%d mins)", roadDistance, durationMinutes);

        return new RouteResponse(roadDistance, durationMinutes, polyline, summary, estimatedKwh);
    }
}
