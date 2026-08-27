package com.gat.assurances.entity;

import com.gat.assurances.entity.enums.StatutGarage;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "garages")
@EntityListeners(AuditingEntityListener.class)
public class Garage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    @Column(nullable = false, length = 200)
    private String adresse;

    @Column(length = 100)
    private String ville;

    @Column(name = "code_postal", length = 10)
    private String codePostal;

    @Column(length = 20)
    private String telephone;

    @Email(message = "Format email invalide")
    @Column(length = 100)
    private String email;

    @Column(name = "capacite_max", nullable = false)
    private Integer capaciteMax;

    @Column(name = "capacite_actuelle")
    private Integer capaciteActuelle;

    @Column(columnDefinition = "TEXT")
    private String specialites;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutGarage statut;

    @Min(0) @Max(5)
    @Column(nullable = false)
    private Double note;

    /** Coordonnées GPS du garage. */
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    /** Convention GAT Assurances (garage partenaire officiel). */
    @Column(name = "convention_gat", nullable = false)
    private Boolean conventionGat = false;

    /** Délai moyen de réparation en jours (calculé historiquement). */
    @Column(name = "delai_moyen_jours")
    private Double delaiMoyenJours;

    /** Lien avec le User correspondant (accès plateforme). */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (statut == null) statut = StatutGarage.ACTIF;
        if (note == null) note = 0.0;
        if (capaciteActuelle == null) capaciteActuelle = 0;
    }
}

