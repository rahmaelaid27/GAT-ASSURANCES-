package com.gat.assurances.repository;

import com.gat.assurances.entity.DemandeRemorquage;
import com.gat.assurances.entity.enums.StatutRemorquage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeRemorquageRepository extends JpaRepository<DemandeRemorquage, Long> {

    List<DemandeRemorquage> findBySinistreId(Long sinistreId);

    List<DemandeRemorquage> findByRemorqueurId(Long remorqueurId);

    List<DemandeRemorquage> findByStatut(StatutRemorquage statut);

    @Query("SELECT d FROM DemandeRemorquage d WHERE d.statut = 'EN_ATTENTE' " +
           "AND (d.remorqueur IS NULL OR d.remorqueur.id = :remorqueurId) " +
           "ORDER BY d.createdAt ASC")
    List<DemandeRemorquage> findPendingForRemorqueur(Long remorqueurId);

    /** Demandes en attente visibles par les remorqueurs disponibles. */
    @Query("SELECT d FROM DemandeRemorquage d WHERE d.statut = 'EN_ATTENTE' " +
           "ORDER BY d.createdAt ASC")
    List<DemandeRemorquage> findAllPending();

    Optional<DemandeRemorquage> findBySinistreIdAndStatutNot(Long sinistreId, StatutRemorquage statut);

    /** Missions actives d'un remorqueur (non terminées, non annulées). */
    @Query("SELECT d FROM DemandeRemorquage d WHERE d.remorqueur.id = :remorqueurId " +
           "AND d.statut NOT IN ('LIVRE','ANNULE') ORDER BY d.createdAt DESC")
    List<DemandeRemorquage> findActiveMissionsByRemorqueur(Long remorqueurId);
}
