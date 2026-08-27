package com.gat.assurances.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDto {
    private Long id;
    @NotBlank @Email
    private String email;
    private String password;
    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    private String telephone;
    @NotBlank
    private String adresse;
    @NotBlank
    private String ville;
    private String codePostal;
    @NotBlank
    private String numeroPolice;
    private String cin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

