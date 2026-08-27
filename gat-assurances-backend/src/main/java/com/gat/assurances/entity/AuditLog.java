package com.gat.assurances.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_nom", length = 100)
    private String userNom;

    @Column(name = "user_role", length = 20)
    private String userRole;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "table_concernee", length = 50)
    private String tableConcernee;

    @Column(name = "enregistrement_id")
    private Long enregistrementId;

    @Column(name = "ancienne_valeur", columnDefinition = "TEXT")
    private String ancienneValeur;

    @Column(name = "nouvelle_valeur", columnDefinition = "TEXT")
    private String nouvelleValeur;

    @Column(name = "adresse_ip", length = 50)
    private String adresseIp;

    @Column(length = 200)
    private String navigateur;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(length = 20)
    private String resultat;

    @PrePersist
    public void prePersist() {
        if (date == null) date = LocalDateTime.now();
    }
}

