package com.gat.assurances.repository;

import com.gat.assurances.entity.Mission;
import com.gat.assurances.entity.enums.StatutMission;
import com.gat.assurances.entity.enums.TypeMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findBySinistreId(Long sinistreId);

    List<Mission> findByGarageId(Long garageId);

    List<Mission> findByExpertId(Long expertId);

    List<Mission> findByRemorqueurId(Long remorqueurId);

    List<Mission> findByStatut(StatutMission statut);

    List<Mission> findByTypeMission(TypeMission typeMission);

    /** Missions actives d'un garage (non terminées/annulées). */
    @Query("SELECT m FROM Mission m WHERE m.garage.id = :garageId " +
           "AND m.statut NOT IN ('TERMINEE','ANNULEE') ORDER BY m.createdAt DESC")
    List<Mission> findActiveMissionsByGarage(Long garageId);

    /** Missions actives d'un expert. */
    @Query("SELECT m FROM Mission m WHERE m.expert.id = :expertId " +
           "AND m.statut NOT IN ('TERMINEE','ANNULEE') ORDER BY m.createdAt DESC")
    List<Mission> findActiveMissionsByExpert(Long expertId);

    /** Toutes missions d'un expert (pour ses propres dashboards). */
    List<Mission> findByExpertIdOrderByCreatedAtDesc(Long expertId);

    /** Toutes missions d'un garage (pour son dashboard). */
    List<Mission> findByGarageIdOrderByCreatedAtDesc(Long garageId);

    long countByGarageIdAndStatutNot(Long garageId, StatutMission statut);

    Optional<Mission> findBySinistreIdAndTypeMission(Long sinistreId, TypeMission typeMission);
}
