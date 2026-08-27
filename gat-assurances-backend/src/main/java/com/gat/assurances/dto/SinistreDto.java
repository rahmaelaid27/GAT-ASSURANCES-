package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.StatutSinistre;
import com.gat.assurances.entity.enums.TypeSinistre;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SinistreDto {
    private Long id;
    private String reference;
    private StatutSinistre statut;
    private TypeSinistre typeSinistre;
    private String description;
    private LocalDate dateSinistre;
    private String gouvernorat;
    private String localite;
    private String coordonneesGps;
    private String photos;
    private String documents;
    private String motifRejet;
    private Long clientId;
    private String clientNom;
    private Long vehiculeId;
    private String vehiculeImmatriculation;
    private Long garageId;
    private String garageNom;
    private Long expertId;
    private String expertNom;
    private Long gestionnaireId;
    // Champs optionnels pour création auto du véhicule
    private String vehiculeMarque;
    private String vehiculeModele;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
