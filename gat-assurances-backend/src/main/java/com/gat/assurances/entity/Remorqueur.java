package com.gat.assurances.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
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
@Table(name = "remorqueurs")
@EntityListeners(AuditingEntityListener.class)
public class Remorqueur {

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
    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(nullable = false)
    private Boolean disponibilite;

    @Column(length = 200)
    private String localisation;

    /** Latitude GPS courante. */
    @Column(name = "latitude")
    private Double latitude;

    /** Longitude GPS courante. */
    @Column(name = "longitude")
    private Double longitude;

    /** Rayon d'intervention en km. */
    @Column(name = "rayon_intervention")
    private Integer rayonIntervention = 30;

    /** Lien avec le User correspondant (accès à la plateforme). */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Integer capacite;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (disponibilite == null) disponibilite = true;
        if (capacite == null) capacite = 1;
    }
}

