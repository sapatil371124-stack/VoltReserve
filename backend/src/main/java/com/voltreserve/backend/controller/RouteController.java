package com.voltreserve.backend.controller;

import com.voltreserve.backend.dto.RouteRequest;
import com.voltreserve.backend.dto.RouteResponse;
import com.voltreserve.backend.routing.RoutingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RoutingService routingService;

    @PostMapping
    public ResponseEntity<RouteResponse> calculateRoute(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routingService.calculateRoute(request));
    }
}
