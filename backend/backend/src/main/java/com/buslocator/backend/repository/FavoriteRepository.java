package com.buslocator.backend.repository;

import com.buslocator.backend.entity.Favorite;
import com.buslocator.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
}
