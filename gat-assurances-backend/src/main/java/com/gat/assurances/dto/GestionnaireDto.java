package com.gat.assurances.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GestionnaireDto {
    private Long id;
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String matricule;
    private String service;
    private Integer capaciteMax;
    private Integer dossiersActifs;
    private Boolean actif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
