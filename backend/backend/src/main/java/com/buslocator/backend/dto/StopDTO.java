package com.buslocator.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StopDTO {
    private Long id;
    private String nom;
    private String adresse;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private java.util.List<String> lignes;
}
