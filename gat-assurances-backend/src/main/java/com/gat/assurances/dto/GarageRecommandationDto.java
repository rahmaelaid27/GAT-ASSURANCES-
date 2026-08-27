package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.StatutGarage;
import lombok.*;

/**
 * Résultat du moteur de recommandation de garages.
 * Retourné trié par score décroissant.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GarageRecommandationDto {

    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String telephone;
    private String email;
    private String specialites;
    private StatutGarage statut;
    private Double note;
    private Integer capaciteMax;
    private Integer capaciteActuelle;
    private Integer slotsDisponibles;
    private Boolean conventionGat;
    private Double delaiMoyenJours;
    private Double latitude;
    private Double longitude;

    /** Distance calculée en km depuis le lieu du sinistre. */
    private Double distanceKm;

    /** Score global calculé /100. */
    private Double score;

    /** Détail de la contribution par critère (debug / affichage). */
    private Double scoreDistance;
    private Double scoreDisponibilite;
    private Double scoreNote;
    private Double scoreDelai;
    private Double scoreConvention;
    private Double scoreSpecialite;
    private Double scorePerformance;
}
