package com.gat.assurances.repository;

import com.gat.assurances.entity.Garage;
import com.gat.assurances.entity.enums.StatutGarage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GarageRepository extends JpaRepository<Garage, Long> {

    List<Garage> findByStatut(StatutGarage statut);

    Optional<Garage> findByUserId(Long userId);

    /** Garages actifs ayant des slots disponibles. */
    @Query("SELECT g FROM Garage g WHERE g.statut = 'ACTIF' " +
           "AND g.capaciteActuelle < g.capaciteMax " +
           "AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL")
    List<Garage> findAvailableWithCoordinates();

    /** Tous les garages actifs (pour le moteur de recommandation). */
    List<Garage> findByStatutOrderByNoteDesc(StatutGarage statut);

    /** Garages conventionnés GAT. */
    @Query("SELECT g FROM Garage g WHERE g.statut = 'ACTIF' AND g.conventionGat = true")
    List<Garage> findConventionnesGat();

    @Query("SELECT g FROM Garage g WHERE g.user.email = :email")
    Optional<Garage> findByEmail(String email);
}
