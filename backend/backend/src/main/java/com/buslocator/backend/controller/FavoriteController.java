package com.buslocator.backend.controller;

import com.buslocator.backend.entity.Favorite;
import com.buslocator.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/")
    public ResponseEntity<Favorite> addFavorite(@RequestBody Map<String, Object> payload) {
        Long stopId = Long.valueOf(payload.get("arretId").toString());
        String alias = payload.get("alias").toString();
        return ResponseEntity.ok(favoriteService.addFavorite(stopId, alias));
    }

    @GetMapping("/")
    public ResponseEntity<List<Favorite>> getFavorites() {
        return ResponseEntity.ok(favoriteService.getUserFavorites());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable Long id) {
        favoriteService.deleteFavorite(id);
        return ResponseEntity.ok().build();
    }
}
