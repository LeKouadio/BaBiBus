package com.buslocator.backend.service;

import com.buslocator.backend.entity.Bus;
import com.buslocator.backend.repository.BusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BusTrackingService {

    private final BusRepository busRepository;
    private final Random random = new Random();

    /**
     * Simulates real-time bus movement every 3 seconds.
     * In a real application, this would be updated by GPS sensors on the buses.
     */
    @Scheduled(fixedRate = 3000)
    @Transactional
    public void simulateBusMovement() {
        List<Bus> buses = busRepository.findAll();
        for (Bus bus : buses) {
            // Small movement simulation (approx 10-20 meters)
            double deltaLat = (random.nextDouble() - 0.5) * 0.0005;
            double deltaLng = (random.nextDouble() - 0.5) * 0.0005;

            bus.setLatitude(bus.getLatitude() + deltaLat);
            bus.setLongitude(bus.getLongitude() + deltaLng);
            
            // Randomly update speed
            bus.setVitesse(20.0 + random.nextDouble() * 30.0);
            
            busRepository.save(bus);
        }
    }
}
