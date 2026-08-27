package com.gat.assurances.repository;

import com.gat.assurances.entity.Remorqueur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RemorqueurRepository extends JpaRepository<Remorqueur, Long> {

    Optional<Remorqueur> findByUserId(Long userId);

    List<Remorqueur> findByDisponibiliteTrue();

    /** Remorqueurs disponibles avec coordonnées GPS. */
    @Query("SELECT r FROM Remorqueur r WHERE r.disponibilite = true " +
           "AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL")
    List<Remorqueur> findAvailableWithCoordinates();

    @Query("SELECT r FROM Remorqueur r WHERE r.user.email = :email")
    Optional<Remorqueur> findByEmail(String email);
}
