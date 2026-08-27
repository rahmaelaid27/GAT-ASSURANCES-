package com.gat.assurances.entity;

import com.gat.assurances.entity.enums.StatutMission;
import com.gat.assurances.entity.enums.TypeMission;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "missions")
@EntityListeners(AuditingEntityListener.class)
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutMission statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_mission", nullable = false, length = 20)
    private TypeMission typeMission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sinistre_id", nullable = false)
    private Sinistre sinistre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garage_id")
    private Garage garage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_id")
    private Expert expert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remorqueur_id")
    private Remorqueur remorqueur;

    /** Devis déposé par le garage (chemin fichier ou JSON structuré). */
    @Column(name = "devis", columnDefinition = "TEXT")
    private String devis;

    /** Montant estimé du devis. */
    @Column(name = "montant_devis", precision = 10, scale = 3)
    private java.math.BigDecimal montantDevis;

    /** Facture finale déposée par le garage. */
    @Column(name = "facture", columnDefinition = "TEXT")
    private String facture;

    /** Montant de la facture finale. */
    @Column(name = "montant_facture", precision = 10, scale = 3)
    private java.math.BigDecimal montantFacture;

    /** Photos liées à la mission (avant/pendant/après). */
    @Column(name = "photos", columnDefinition = "TEXT")
    private String photos;

    /** Sous-statut d'avancement garage. */
    @Column(name = "avancement_garage", length = 40)
    private String avancementGarage;

    /** Date planifiée de l'expertise. */
    @Column(name = "date_expertise_prevue")
    private java.time.LocalDateTime dateExpertisePrevue;

    /** Motif de refus si la mission est annulée. */
    @Column(name = "motif_refus", columnDefinition = "TEXT")
    private String motifRefus;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (statut == null) statut = StatutMission.EN_ATTENTE;
    }
}

