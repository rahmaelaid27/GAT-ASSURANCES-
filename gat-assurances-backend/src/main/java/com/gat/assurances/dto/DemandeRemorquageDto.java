package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.StatutRemorquage;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DemandeRemorquageDto {
    private Long id;
    private Long sinistreId;
    private String sinistreReference;
    private Long remorqueurId;
    private String remorqueurNom;
    private String localisationDepart;
    private String coordonneesDepart;
    private String localisationDestination;
    private String coordonneesDestination;
    private StatutRemorquage statut;
    private String photosIntervention;
    private LocalDateTime dateAcceptation;
    private LocalDateTime dateArrivee;
    private LocalDateTime dateLivraison;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
