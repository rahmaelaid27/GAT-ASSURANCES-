package com.gat.assurances.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Gestionnaire GAT Assurances — instruit les dossiers sinistres,
 * coordonne garages, experts et remorqueurs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "gestionnaires")
@EntityListeners(AuditingEntityListener.class)
public class Gestionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 50)
    private String matricule;

    @Column(length = 100)
    private String service;

    /** Nombre max de dossiers actifs simultanés. */
    @Column(name = "capacite_max", nullable = false)
    @Builder.Default
    private Integer capaciteMax = 50;

    /** Dossiers actifs en cours de traitement. */
    @Column(name = "dossiers_actifs")
    @Builder.Default
    private Integer dossiersActifs = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @OneToMany(mappedBy = "gestionnaire", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Sinistre> sinistres = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
