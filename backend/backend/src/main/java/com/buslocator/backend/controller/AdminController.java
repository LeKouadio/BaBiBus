package com.buslocator.backend.controller;

import com.buslocator.backend.entity.Line;
import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.repository.LineRepository;
import com.buslocator.backend.repository.NotificationRepository;
import com.buslocator.backend.repository.StopRepository;
import com.buslocator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StopRepository stopRepository;
    private final LineRepository lineRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    // Stops Management
    @PostMapping({"/stops", "/stops/"})
    public ResponseEntity<Stop> createStop(@RequestBody Stop stop) {
        return ResponseEntity.ok(stopRepository.save(stop));
    }

    @PutMapping({"/stops/{id}", "/stops/{id}/"})
    public ResponseEntity<Stop> updateStop(@PathVariable Long id, @RequestBody Stop stop) {
        stop.setId(id);
        return ResponseEntity.ok(stopRepository.save(stop));
    }

    @DeleteMapping("/stops/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long id) {
        stopRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Lines Management
    @PostMapping({"/lines", "/lines/"})
    public ResponseEntity<Line> createLine(@RequestBody Line line) {
        if (line.getLineStops() != null) {
            line.getLineStops().forEach(ls -> ls.setLine(line));
        }
        return ResponseEntity.ok(lineRepository.save(line));
    }

    @PutMapping({"/lines/{id}", "/lines/{id}/"})
    public ResponseEntity<Line> updateLine(@PathVariable Long id, @RequestBody Line line) {
        Line existingLine = lineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Line not found"));
        
        existingLine.setNumero(line.getNumero());
        existingLine.setNom(line.getNom());
        existingLine.setCouleur(line.getCouleur());
        existingLine.setType(line.getType());
        existingLine.setHasWiFi(line.getHasWiFi());
        existingLine.setHasAC(line.getHasAC());
        existingLine.setIsAccessible(line.getIsAccessible());

        if (line.getLineStops() != null) {
            // Clear existing stops and add new ones to handle orphanRemoval correctly
            existingLine.getLineStops().clear();
            line.getLineStops().forEach(ls -> {
                ls.setLine(existingLine);
                existingLine.getLineStops().add(ls);
            });
        }
        
        return ResponseEntity.ok(lineRepository.save(existingLine));
    }

    @DeleteMapping("/lines/{id}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long id) {
        lineRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Users Management

    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.buslocator.backend.entity.User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping({"/users", "/users/"})
    public ResponseEntity<com.buslocator.backend.entity.User> createUser(@RequestBody com.buslocator.backend.entity.User user) {
        if (user.getMotDePasse() != null) {
            user.setMotDePasse(passwordEncoder.encode(user.getMotDePasse()));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping({"/users/{id}", "/users/{id}/"})
    public ResponseEntity<com.buslocator.backend.entity.User> updateUser(@PathVariable Long id, @RequestBody com.buslocator.backend.entity.User user) {
        com.buslocator.backend.entity.User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        existingUser.setNom(user.getNom());
        existingUser.setEmail(user.getEmail());
        existingUser.setTelephone(user.getTelephone());
        existingUser.setRole(user.getRole());
        existingUser.setLanguage(user.getLanguage());
        existingUser.setEnabled(user.isEnabled());
        
        if (user.getMotDePasse() != null && !user.getMotDePasse().isEmpty()) {
            existingUser.setMotDePasse(passwordEncoder.encode(user.getMotDePasse()));
        }
        
        return ResponseEntity.ok(userRepository.save(existingUser));
    }

    // Notifications Management

    @PostMapping("/notifications")
    public ResponseEntity<com.buslocator.backend.entity.Notification> createNotification(@RequestBody com.buslocator.backend.entity.Notification notification) {
        notification.setTime(java.time.LocalDateTime.now());
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
