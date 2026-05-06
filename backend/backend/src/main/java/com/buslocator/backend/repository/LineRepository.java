package com.buslocator.backend.repository;

import com.buslocator.backend.entity.Line;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LineRepository extends JpaRepository<Line, Long> {
    Optional<Line> findByNumero(String numero);
}
