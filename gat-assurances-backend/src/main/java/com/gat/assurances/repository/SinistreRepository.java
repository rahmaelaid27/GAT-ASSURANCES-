package com.gat.assurances.repository;

import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.entity.enums.StatutSinistre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SinistreRepository extends JpaRepository<Sinistre, Long> {

    Optional<Sinistre> findByReference(String reference);

    List<Sinistre> findByClientId(Long clientId);

    List<Sinistre> findByGestionnaireId(Long gestionnaireId);

    List<Sinistre> findByGarageId(Long garageId);

    List<Sinistre> findByExpertId(Long expertId);

    List<Sinistre> findByStatut(StatutSinistre statut);

    List<Sinistre> findByVehiculeImmatriculation(String immatriculation);

    long countByStatut(StatutSinistre statut);

    long countByGestionnaireId(Long gestionnaireId);

    /** Dossiers urgents : affectés depuis plus de N jours sans clôture. */
    @Query("SELECT s FROM Sinistre s WHERE s.gestionnaire.id = :gestionnaireId " +
           "AND s.statut NOT IN ('CLOTURE','REFUSE') " +
           "AND DATEDIFF(CURRENT_DATE, s.dateDeclaration) > :joursMax " +
           "ORDER BY s.dateDeclaration ASC")
    List<Sinistre> findUrgentByGestionnaire(Long gestionnaireId, int joursMax);

    /** Recherche globale sur référence, nom client, immatriculation. */
    @Query("SELECT s FROM Sinistre s WHERE " +
           "LOWER(s.reference) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(s.client.user.nom) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(s.client.user.prenom) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(s.vehicule.immatriculation) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Sinistre> search(String q);

    /** Dossiers en attente de validation pour un gestionnaire. */
    @Query("SELECT s FROM Sinistre s WHERE s.gestionnaire.id = :gestionnaireId " +
           "AND s.statut = 'EN_ATTENTE_VALIDATION'")
    List<Sinistre> findPendingValidationByGestionnaire(Long gestionnaireId);

    /** Stats globales pour le manager. */
    @Query("SELECT s.statut, COUNT(s) FROM Sinistre s GROUP BY s.statut")
    List<Object[]> countGroupByStatut();
}
