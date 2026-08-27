package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.TypeVehicule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiculeDto {

    private Long id;

    @NotBlank(message = "La marque est obligatoire")
    private String marque;

    @NotBlank(message = "Le modèle est obligatoire")
    private String modele;

    @NotNull(message = "L'année est obligatoire")
    private Integer annee;

    @NotBlank(message = "L'immatriculation est obligatoire")
    private String immatriculation;

    private String couleur;

    @NotNull(message = "Le type de véhicule est obligatoire")
    private TypeVehicule typeVehicule;

    private Long clientId;

    private String clientNom;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

