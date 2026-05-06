package com.buslocator.backend.controller;

import com.buslocator.backend.dto.StopDTO;
import com.buslocator.backend.service.StopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stops")
@RequiredArgsConstructor
public class StopController {

    private final StopService stopService;

    @GetMapping("/nearby")
    public ResponseEntity<List<StopDTO>> getNearbyStops(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "2.0") Double radius
    ) {
        return ResponseEntity.ok(stopService.getNearbyStops(lat, lng, radius));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<StopDTO>> searchStops(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(stopService.searchStops(name, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StopDTO> getStopById(@PathVariable Long id) {
        return ResponseEntity.ok(stopService.getStopById(id));
    }
}
