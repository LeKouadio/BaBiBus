package com.buslocator.backend.service;

import com.buslocator.backend.dto.StopDTO;
import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StopService {

    private final StopRepository stopRepository;

    public Stop createStop(Stop stop) {
        return stopRepository.save(stop);
    }

    public Stop updateStop(Long id, Stop stopDetails) {
        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stop not found"));
        stop.setNom(stopDetails.getNom());
        stop.setAdresse(stopDetails.getAdresse());
        stop.setLatitude(stopDetails.getLatitude());
        stop.setLongitude(stopDetails.getLongitude());
        return stopRepository.save(stop);
    }

    public void deleteStop(Long id) {
        stopRepository.deleteById(id);
    }


    public List<StopDTO> getNearbyStops(Double lat, Double lng, Double radius) {
        List<Object[]> results = stopRepository.findNearbyStops(lat, lng, radius);
        return results.stream().map(result -> {
            // result order matches init-db.sql: id, nom, adresse, latitude, longitude + distance
            Long id = ((Number) result[0]).longValue();
            String nom = (String) result[1];
            String adresse = (String) result[2];
            Double latitude = (Double) result[3];
            Double longitude = (Double) result[4];
            Double distance = (Double) result[5];
            
            List<String> lines = stopRepository.findLinesForStop(id);
            return StopDTO.builder()
                    .id(id)
                    .nom(nom)
                    .adresse(adresse)
                    .latitude(latitude)
                    .longitude(longitude)
                    .distance(distance)
                    .lignes(lines)
                    .build();
        }).collect(Collectors.toList());
    }

    public Page<StopDTO> searchStops(String name, Pageable pageable) {
        return stopRepository.searchByKeyword(name, pageable)
                .map(this::convertToDTO);
    }

    public StopDTO getStopById(Long id) {
        return stopRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Stop not found"));
    }

    private StopDTO convertToDTO(Stop stop) {
        List<String> lines = stopRepository.findLinesForStop(stop.getId());
        return StopDTO.builder()
                .id(stop.getId())
                .nom(stop.getNom())
                .adresse(stop.getAdresse())
                .latitude(stop.getLatitude())
                .longitude(stop.getLongitude())
                .lignes(lines)
                .build();
    }
}
