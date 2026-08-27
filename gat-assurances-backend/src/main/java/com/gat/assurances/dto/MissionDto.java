package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.StatutMission;
import com.gat.assurances.entity.enums.TypeMission;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MissionDto {
    private Long id;
    private StatutMission statut;
    private TypeMission typeMission;
    private String description;
    // Champs legacy (compatibilité MissionService existant)
    private LocalDate dateDebut;
    private LocalDate dateFin;
    // Sinistre
    private Long sinistreId;
    private String sinistreReference;
    private String sinistreImmatriculation;
    // Garage
    private Long garageId;
    private String garageNom;
    // Expert
    private Long expertId;
    private String expertNom;
    // Remorqueur
    private Long remorqueurId;
    private String remorqueurNom;
    // Workflow garage
    private String devis;
    private BigDecimal montantDevis;
    private String facture;
    private BigDecimal montantFacture;
    private String photos;
    private String avancementGarage;
    private LocalDateTime dateExpertisePrevue;
    private String motifRefus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
