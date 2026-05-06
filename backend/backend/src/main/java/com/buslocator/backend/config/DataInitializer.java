package com.buslocator.backend.config;

import com.buslocator.backend.entity.Stop;
import com.buslocator.backend.entity.User;
import com.buslocator.backend.repository.StopRepository;
import com.buslocator.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import com.buslocator.backend.entity.Notification;
import com.buslocator.backend.repository.NotificationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StopRepository stopRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure Admin exists
        userRepository.findByEmail("admin@babibus.com").ifPresentOrElse(
            admin -> {
                admin.setMotDePasse(passwordEncoder.encode("password123"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
            },
            () -> {
                userRepository.save(User.builder()
                        .nom("Admin BaBiBUS")
                        .email("admin@babibus.com")
                        .motDePasse(passwordEncoder.encode("password123"))
                        .role(User.Role.ADMIN)
                        .build());
            }
        );

        if (userRepository.findByEmail("kouadio@example.com").isEmpty()) {
            // Create Test User
            userRepository.save(User.builder()
                    .nom("Kouadio N'Guessan")
                    .email("kouadio@example.com")
                    .motDePasse(passwordEncoder.encode("password123"))
                    .role(User.Role.USER)
                    .build());
        }

        if (stopRepository.count() == 0) {
            stopRepository.save(Stop.builder().nom("Arrêt Plateau").latitude(5.3183).longitude(-4.0195).build());
            stopRepository.save(Stop.builder().nom("Arrêt Cocody").latitude(5.3421).longitude(-3.9856).build());
            stopRepository.save(Stop.builder().nom("Arrêt Riviera").latitude(5.36).longitude(-3.98).build());
            stopRepository.save(Stop.builder().nom("Arrêt Marcory").latitude(5.3023).longitude(-3.9806).build());
        }

        if (notificationRepository.count() == 0) {
            notificationRepository.save(Notification.builder()
                    .title("Nouveau trajet disponible")
                    .description("La ligne 01 a été mise à jour avec de nouveaux horaires.")
                    .time(LocalDateTime.now().minusHours(2))
                    .isRead(false)
                    .icon("Clock")
                    .color("#F57C00")
                    .build());
            notificationRepository.save(Notification.builder()
                    .title("Perturbation sur la ligne 12")
                    .description("Retards de 10 min à prévoir suite à des travaux.")
                    .time(LocalDateTime.now().minusHours(5))
                    .isRead(true)
                    .icon("Info")
                    .color("#2E7D32")
                    .build());
            notificationRepository.save(Notification.builder()
                    .title("Bienvenue sur BaBiBUS")
                    .description("Découvrez toutes les fonctionnalités de votre nouveau localisateur de bus.")
                    .time(LocalDateTime.now().minusDays(1))
                    .isRead(true)
                    .icon("Bell")
                    .color("#1976D2")
                    .build());
        }
    }
}
