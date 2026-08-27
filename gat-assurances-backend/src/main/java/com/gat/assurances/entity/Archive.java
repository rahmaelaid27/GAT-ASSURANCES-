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
@Table(name = "archives")
public class Archive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_source", nullable = false, length = 50)
    private String tableSource;

    @Column(name = "enregistrement_id", nullable = false)
    private Long enregistrementId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String donnees;

    @Column(name = "date_archivage", nullable = false)
    private LocalDateTime dateArchivage;

    @Column(name = "archive_par", length = 100)
    private String archivePar;

    @Column(nullable = false)
    private boolean restaure;

    @PrePersist
    public void prePersist() {
        if (dateArchivage == null) dateArchivage = LocalDateTime.now();
        restaure = false;
    }
}

