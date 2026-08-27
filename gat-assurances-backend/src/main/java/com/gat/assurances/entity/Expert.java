package com.gat.assurances.entity;

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
@Table(name = "experts")
@EntityListeners(AuditingEntityListener.class)
public class Expert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 50)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false, length = 50)
    private String prenom;

    @Email(message = "Format email invalide")
    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(nullable = false, length = 100)
    private String specialite;

    @Column(name = "zone_intervention", length = 200)
    private String zoneIntervention;

    /** Coordonnées GPS de base de l'expert. */
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    /** Capacité max de missions simultanées. */
    @Column(name = "capacite_max")
    private Integer capaciteMax = 10;

    /** Lien avec le User correspondant (accès plateforme). */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Boolean disponibilite;

    @Column(name = "missions_actives")
    private Integer missionsActives;

    @Min(0) @Max(5)
    @Column(nullable = false)
    private Double note;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (disponibilite == null) disponibilite = true;
        if (missionsActives == null) missionsActives = 0;
        if (note == null) note = 0.0;
    }
}

