package com.buslocator.backend.repository;

import com.buslocator.backend.entity.Stop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StopRepository extends JpaRepository<Stop, Long> {
    @Query("SELECT s FROM Stop s WHERE LOWER(s.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.adresse) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Stop> searchByKeyword(@Param("query") String query, Pageable pageable);
    
    @Query(value = "SELECT s.*, (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude)))) AS distance " +
           "FROM stops s " +
           "HAVING distance <= :radius " +
           "ORDER BY distance ASC", nativeQuery = true)
    List<Object[]> findNearbyStops(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radius") Double radius);

    @Query("SELECT DISTINCT l.numero FROM Line l JOIN l.lineStops ls WHERE ls.stop.id = :stopId")
    List<String> findLinesForStop(@Param("stopId") Long stopId);
}
