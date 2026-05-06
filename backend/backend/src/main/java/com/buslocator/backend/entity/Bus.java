package com.buslocator.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "line_id", nullable = false)
    private Line line;

    @Column(name = "numero_bus", nullable = false)
    private String numeroBus;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column
    private Double vitesse;

    @Column(name = "derniere_mise_a_jour")
    private LocalDateTime derniereMiseAJour;

    @PreUpdate
    @PrePersist
    public void updateTimestamp() {
        derniereMiseAJour = LocalDateTime.now();
    }
}
