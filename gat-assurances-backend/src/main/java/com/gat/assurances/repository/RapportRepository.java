package com.gat.assurances.repository;

import com.gat.assurances.entity.Rapport;
import com.gat.assurances.entity.enums.StatutRapport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RapportRepository extends JpaRepository<Rapport, Long> {
    Optional<Rapport> findByMissionId(Long missionId);
    List<Rapport> findByExpertId(Long expertId);
    List<Rapport> findByStatut(StatutRapport statut);
    long countByExpertIdAndStatut(Long expertId, StatutRapport statut);
}
