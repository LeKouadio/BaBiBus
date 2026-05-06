package com.buslocator.backend.controller;

import com.buslocator.backend.dto.StopDTO;
import com.buslocator.backend.service.StopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/navigation")
@RequiredArgsConstructor
public class NavigationController {

    private final StopService stopService;

    @GetMapping("/distance")
    public ResponseEntity<Map<String, Object>> getDistance(
            @RequestParam Long from,
            @RequestParam Long to
    ) {
        StopDTO stopFrom = stopService.getStopById(from);
        StopDTO stopTo = stopService.getStopById(to);
        
        double distance = calculateDistance(
                stopFrom.getLatitude(), stopFrom.getLongitude(),
                stopTo.getLatitude(), stopTo.getLongitude()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("from", stopFrom.getNom());
        response.put("to", stopTo.getNom());
        response.put("distance", distance);
        response.put("unit", "meters");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> getRoute(
            @RequestParam Long from,
            @RequestParam Long to
    ) {
        StopDTO stopFrom = stopService.getStopById(from);
        StopDTO stopTo = stopService.getStopById(to);
        
        double distance = calculateDistance(
                stopFrom.getLatitude(), stopFrom.getLongitude(),
                stopTo.getLatitude(), stopTo.getLongitude()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("distance", distance);
        response.put("dureeEstimee", (int)(distance / 500)); // Rough estimate: 500m/min
        response.put("arrets", List.of(stopFrom, stopTo));
        
        return ResponseEntity.ok(response);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // convert to meters
    }
}
