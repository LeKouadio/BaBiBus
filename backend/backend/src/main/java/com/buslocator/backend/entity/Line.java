package com.buslocator.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bus_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Line {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String couleur;

    @JsonProperty("hasWiFi")
    @Column(name = "has_wifi", nullable = false)
    @Builder.Default
    private Boolean hasWiFi = false;

    @JsonProperty("hasAC")
    @Column(name = "has_ac", nullable = false)
    @Builder.Default
    private Boolean hasAC = false;

    @JsonProperty("isAccessible")
    @Column(name = "is_accessible", nullable = false)
    @Builder.Default
    private Boolean isAccessible = false;

    @Column
    private String type; // Express, Standard, Navette

    @OneToMany(mappedBy = "line", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<LineStop> lineStops = new ArrayList<>();

    @OneToMany(mappedBy = "line", cascade = CascadeType.ALL)
    private List<Bus> buses = new ArrayList<>();
}
