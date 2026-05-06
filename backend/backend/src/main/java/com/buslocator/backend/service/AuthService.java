package com.buslocator.backend.service;

import com.buslocator.backend.dto.AuthRequest;
import com.buslocator.backend.dto.AuthResponse;
import com.buslocator.backend.dto.RegisterRequest;
import com.buslocator.backend.entity.User;
import com.buslocator.backend.repository.UserRepository;
import com.buslocator.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.buslocator.backend.dto.ForgotPasswordRequest;
import com.buslocator.backend.dto.ResetPasswordRequest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        var user = User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getMotDePasse())
                .roles(user.getRole().name())
                .build();
        
        var jwtToken = jwtUtils.generateToken(userDetails);
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getMotDePasse())
                .roles(user.getRole().name())
                .build();
        
        var jwtToken = jwtUtils.generateToken(userDetails);
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // In a real application, you would send an email here
        System.out.println("DEBUG: Reset link for " + user.getEmail() + " : http://localhost:5173/reset-password?token=" + token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        var user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Jeton de réinitialisation invalide"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le jeton de réinitialisation a expiré");
        }

        user.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
