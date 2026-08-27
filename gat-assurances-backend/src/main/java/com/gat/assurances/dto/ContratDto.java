package com.gat.assurances.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ContratDto {
    private Long id;
    private String numeroContrat;
    private Long vehiculeId;
    private String vehiculeImmatriculation;
    private Long clientId;
    private String clientNom;
    private String typeCouverture;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal primeAnnuelle;
    private Boolean actif;
    private LocalDateTime createdAt;
}
