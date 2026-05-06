package com.buslocator.backend.controller;

import com.buslocator.backend.repository.LineRepository;
import com.buslocator.backend.repository.StopRepository;
import com.buslocator.backend.repository.UserRepository;
import com.buslocator.backend.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class DashboardController {

    private final StopRepository stopRepository;
    private final LineRepository lineRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("stops", stopRepository.count());
        stats.put("lines", lineRepository.count());
        stats.put("users", userRepository.count());
        stats.put("favorites", favoriteRepository.count());
        return ResponseEntity.ok(stats);
    }
}
