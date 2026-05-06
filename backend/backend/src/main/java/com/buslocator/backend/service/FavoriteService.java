package com.buslocator.backend.service;

import com.buslocator.backend.entity.Favorite;
import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.entity.User;
import com.buslocator.backend.repository.FavoriteRepository;
import com.buslocator.backend.repository.StopRepository;
import com.buslocator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final StopRepository stopRepository;

    public Favorite addFavorite(Long stopId, String alias) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Stop stop = stopRepository.findById(stopId).orElseThrow();
        
        Favorite favorite = Favorite.builder()
                .user(user)
                .arret(stop)
                .alias(alias)
                .build();
        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getUserFavorites() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return favoriteRepository.findByUser(user);
    }

    public void deleteFavorite(Long id) {
        favoriteRepository.deleteById(id);
    }
}
