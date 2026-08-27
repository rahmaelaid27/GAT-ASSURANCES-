package com.gat.assurances.repository;

import com.gat.assurances.entity.Gestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GestionnaireRepository extends JpaRepository<Gestionnaire, Long> {

    Optional<Gestionnaire> findByUserId(Long userId);

    /** Gestionnaires actifs triés par charge (Round-Robin pondéré). */
    @Query("SELECT g FROM Gestionnaire g WHERE g.actif = true " +
           "AND g.dossiersActifs < g.capaciteMax " +
           "ORDER BY g.dossiersActifs ASC, g.createdAt ASC")
    List<Gestionnaire> findAvailableOrderByLoad();

    List<Gestionnaire> findByActifTrue();

    @Query("SELECT g FROM Gestionnaire g WHERE g.user.email = :email")
    Optional<Gestionnaire> findByEmail(String email);
}
