package com.buslocator.backend.controller;

import com.buslocator.backend.entity.Line;
import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.service.LineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lines")
@RequiredArgsConstructor
public class LineController {

    private final LineService lineService;

    @GetMapping("/")
    public ResponseEntity<List<Line>> getAllLines() {
        return ResponseEntity.ok(lineService.getAllLines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Line> getLineById(@PathVariable Long id) {
        return ResponseEntity.ok(lineService.getLineById(id));
    }

    @GetMapping("/{id}/stops")
    public ResponseEntity<List<Stop>> getStopsForLine(@PathVariable Long id) {
        return ResponseEntity.ok(lineService.getStopsForLine(id));
    }
}
