package com.gat.assurances.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpertDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String specialite;
    private String zoneIntervention;
    private Boolean disponibilite;
    private Integer missionsActives;
    private Double note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
