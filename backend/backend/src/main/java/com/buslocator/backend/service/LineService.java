package com.buslocator.backend.service;

import com.buslocator.backend.entity.Line;
import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.repository.LineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LineService {

    private final LineRepository lineRepository;

    public List<Line> getAllLines() {
        return lineRepository.findAll();
    }

    public Line getLineById(Long id) {
        return lineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Line not found"));
    }

    public List<Stop> getStopsForLine(Long id) {
        Line line = getLineById(id);
        return line.getLineStops().stream()
                .map(ls -> ls.getStop())
                .collect(Collectors.toList());
    }
}
