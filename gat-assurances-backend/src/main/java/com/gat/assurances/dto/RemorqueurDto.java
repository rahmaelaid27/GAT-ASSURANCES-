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
public class RemorqueurDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Boolean disponibilite;
    private String localisation;
    private Integer capacite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
