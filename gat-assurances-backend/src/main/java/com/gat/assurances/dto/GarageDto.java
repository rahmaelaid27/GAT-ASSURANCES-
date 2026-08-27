package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.StatutGarage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GarageDto {
    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String codePostal;
    private String telephone;
    private String email;
    private Integer capaciteMax;
    private Integer capaciteActuelle;
    private String specialites;
    private StatutGarage statut;
    private Double note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
