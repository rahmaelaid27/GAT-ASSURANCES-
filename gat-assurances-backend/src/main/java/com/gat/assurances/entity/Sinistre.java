package com.gat.assurances.entity;

import com.gat.assurances.entity.enums.StatutSinistre;
import com.gat.assurances.entity.enums.TypeSinistre;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sinistres")
@EntityListeners(AuditingEntityListener.class)
public class Sinistre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String reference;

    @NotNull(message = "La date du sinistre est obligatoire")
    @Column(name = "date_sinistre", nullable = false)
    private LocalDate dateSinistre;

    @Column(name = "date_declaration", nullable = false)
    private LocalDate dateDeclaration;

    @Column(length = 200)
    private String lieu;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String gouvernorat;

    @Column(length = 100)
    private String localite;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_sinistre", length = 30)
    private TypeSinistre typeSinistre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutSinistre statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    /** Gestionnaire affecté automatiquement après déclaration. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestionnaire_id")
    private Gestionnaire gestionnaire;

    /** Garage choisi par le client via le moteur de recommandation. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garage_id")
    private Garage garage;

    /** Expert auto-affecté par le système après choix du garage. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_id")
    private Expert expert;

    /** Photos du sinistre (liste de chemins séparés par ',') */
    @Column(name = "photos", columnDefinition = "TEXT")
    private String photos;

    /** Documents justificatifs (PV police, constat amiable…) */
    @Column(name = "documents", columnDefinition = "TEXT")
    private String documents;

    /** Coordonnées GPS : "latitude,longitude" */
    @Column(name = "coordonnees_gps", length = 50)
    private String coordonneesGps;

    /** Motif de refus ou d'incomplétude */
    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @Column(name = "date_cloture")
    private java.time.LocalDate dateCloture;

    @OneToMany(mappedBy = "sinistre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Mission> missions = new ArrayList<>();

    @OneToMany(mappedBy = "sinistre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Commentaire> commentaires = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (reference == null) {
            reference = "SIN-" + System.currentTimeMillis() % 1000000;
        }
        if (dateDeclaration == null) {
            dateDeclaration = LocalDate.now();
        }
        if (statut == null) {
            statut = StatutSinistre.DECLARE;
        }
    }
}

