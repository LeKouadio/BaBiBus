package com.buslocator.backend.controller;

import com.buslocator.backend.dto.StopDTO;
import com.buslocator.backend.service.LineService;
import com.buslocator.backend.service.StopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/live")
@RequiredArgsConstructor
public class LiveTrackingController {

    private final LineService lineService;
    private final StopService stopService;
    private final com.buslocator.backend.repository.BusRepository busRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllLiveBuses() {
        List<com.buslocator.backend.entity.Bus> allBuses = busRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (var b : allBuses) {
            result.add(mapBusToMap(b));
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/bus/{lineId}")
    public ResponseEntity<List<Map<String, Object>>> getLiveBuses(@PathVariable Long lineId) {
        List<com.buslocator.backend.entity.Bus> buses = busRepository.findByLineId(lineId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (var b : buses) {
            result.add(mapBusToMap(b));
        }
        
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> mapBusToMap(com.buslocator.backend.entity.Bus bus) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", bus.getNumeroBus());
        map.put("lineId", bus.getLine().getId());
        map.put("latitude", bus.getLatitude());
        map.put("longitude", bus.getLongitude());
        map.put("speed", bus.getVitesse());
        return map;
    }
}
