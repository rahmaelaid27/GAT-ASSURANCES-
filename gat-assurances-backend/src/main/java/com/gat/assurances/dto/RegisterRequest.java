package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    /** CIN optionnel à l'inscription */
    @Size(min = 8, max = 8, message = "Le CIN doit contenir exactement 8 chiffres")
    private String cin;

    private String telephone;

    /** Rôle souhaité — par défaut CLIENT si absent */
    private Role role;
}
