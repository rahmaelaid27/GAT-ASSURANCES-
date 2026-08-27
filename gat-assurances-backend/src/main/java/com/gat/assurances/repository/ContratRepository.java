package com.gat.assurances.repository;

import com.gat.assurances.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {

    Optional<Contrat> findByNumeroContrat(String numeroContrat);

    List<Contrat> findByClientId(Long clientId);

    List<Contrat> findByVehiculeId(Long vehiculeId);

    Optional<Contrat> findByVehiculeIdAndActifTrue(Long vehiculeId);

    /** Contrat actif couvrant la date donnée. */
    @Query("SELECT c FROM Contrat c WHERE c.vehicule.id = :vehiculeId " +
           "AND c.actif = true AND c.dateDebut <= :date AND c.dateFin >= :date")
    Optional<Contrat> findActiveContratForVehiculeAtDate(Long vehiculeId, LocalDate date);

    List<Contrat> findByClientIdAndActifTrue(Long clientId);
}
