package com.buslocator.backend.repository;

import com.buslocator.backend.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByLineId(Long lineId);
}
