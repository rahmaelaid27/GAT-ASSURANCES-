package com.gat.assurances.entity;

import com.gat.assurances.entity.enums.StatutRemorquage;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Demande de remorquage liée à un sinistre.
 * Créée par le gestionnaire quand le véhicule est immobilisé.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "demandes_remorquage")
@EntityListeners(AuditingEntityListener.class)
public class DemandeRemorquage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sinistre_id", nullable = false)
    private Sinistre sinistre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remorqueur_id")
    private Remorqueur remorqueur;

    @Column(name = "localisation_depart", nullable = false, length = 300)
    private String localisationDepart;

    @Column(name = "coordonnees_depart", length = 50)
    private String coordonneesDepart;

    @Column(name = "localisation_destination", nullable = false, length = 300)
    private String localisationDestination;

    @Column(name = "coordonnees_destination", length = 50)
    private String coordonneesDestination;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatutRemorquage statut = StatutRemorquage.EN_ATTENTE;

    @Column(name = "photos_intervention", columnDefinition = "TEXT")
    private String photosIntervention;

    @Column(name = "date_acceptation")
    private LocalDateTime dateAcceptation;

    @Column(name = "date_arrivee")
    private LocalDateTime dateArrivee;

    @Column(name = "date_livraison")
    private LocalDateTime dateLivraison;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
