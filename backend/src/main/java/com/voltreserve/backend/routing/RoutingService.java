package com.voltreserve.backend.routing;

import com.voltreserve.backend.dto.RouteRequest;
import com.voltreserve.backend.dto.RouteResponse;

public interface RoutingService {
    RouteResponse calculateRoute(RouteRequest request);
}
