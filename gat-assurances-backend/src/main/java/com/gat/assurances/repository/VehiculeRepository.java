package com.gat.assurances.repository;

import com.gat.assurances.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    Optional<Vehicule> findFirstByImmatriculation(String immatriculation);

    Optional<Vehicule> findByImmatriculation(String immatriculation);

    List<Vehicule> findByClientId(Long clientId);

    boolean existsByImmatriculation(String immatriculation);

    List<Vehicule> findByImmatriculationContainingIgnoreCase(String immatriculation);

    /** Compatibilité VehiculeService.search() */
    default List<Vehicule> findByImmatriculationLike(String pattern) {
        String term = pattern.replace("%", "");
        return findByImmatriculationContainingIgnoreCase(term);
    }
}
