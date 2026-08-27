package com.gat.assurances.repository;

import com.gat.assurances.entity.Expert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpertRepository extends JpaRepository<Expert, Long> {

    Optional<Expert> findByUserId(Long userId);

    List<Expert> findByDisponibiliteTrue();

    /** Experts disponibles avec coordonnées, triés par missions actives puis note. */
    @Query("SELECT e FROM Expert e WHERE e.disponibilite = true " +
           "AND e.missionsActives < e.capaciteMax " +
           "AND e.latitude IS NOT NULL AND e.longitude IS NOT NULL " +
           "ORDER BY e.missionsActives ASC, e.note DESC")
    List<Expert> findAvailableOrderByLoadAndNote();

    /** Experts disponibles par spécialité. */
    @Query("SELECT e FROM Expert e WHERE e.disponibilite = true " +
           "AND e.missionsActives < e.capaciteMax " +
           "AND LOWER(e.specialite) LIKE LOWER(CONCAT('%',:specialite,'%')) " +
           "ORDER BY e.missionsActives ASC, e.note DESC")
    List<Expert> findAvailableBySpecialite(String specialite);

    @Query("SELECT e FROM Expert e WHERE e.user.email = :email")
    Optional<Expert> findByEmail(String email);
}
