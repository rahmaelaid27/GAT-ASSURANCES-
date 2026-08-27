package com.gat.assurances.service;

import com.gat.assurances.entity.Expert;
import com.gat.assurances.entity.Mission;
import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.entity.enums.StatutMission;
import com.gat.assurances.entity.enums.TypeMission;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.repository.ExpertRepository;
import com.gat.assurances.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Affecte automatiquement l'expert le plus adapté à un sinistre.
 * Le client n'intervient jamais dans ce choix.
 *
 * Critères (ordre de priorité) :
 *  1. disponible = true
 *  2. spécialité match type véhicule
 *  3. missionsActives < capaciteMax
 *  4. distance minimale vs garage affecté
 *  5. note la plus haute
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertAffectationService {

    private final ExpertRepository expertRepository;
    private final MissionRepository missionRepository;
    private final NotificationService notificationService;
    private final GeoService geoService;

    @Transactional
    public Expert affecter(Sinistre sinistre) {
        String typeVehicule = sinistre.getVehicule() != null
                ? sinistre.getVehicule().getTypeVehicule().name() : "";

        // 1. Experts disponibles par spécialité
        List<Expert> candidats = expertRepository.findAvailableBySpecialite(typeVehicule);

        // 2. Si aucun spécialiste, on prend tous les disponibles
        if (candidats.isEmpty()) {
            candidats = expertRepository.findAvailableOrderByLoadAndNote();
        }

        if (candidats.isEmpty()) {
            throw new BusinessException("Aucun expert disponible pour ce sinistre.");
        }

        // 3. Tri par distance si le garage a des coordonnées GPS
        Expert bestExpert = candidats.stream()
                .min((a, b) -> compareExperts(a, b, sinistre))
                .orElse(candidats.get(0));

        // 4. Créer la mission d'expertise
        Mission mission = Mission.builder()
                .sinistre(sinistre)
                .garage(sinistre.getGarage())
                .expert(bestExpert)
                .typeMission(TypeMission.EXPERTISE)
                .statut(StatutMission.EN_ATTENTE)
                .description("Mission d'expertise auto-affectée pour le sinistre " + sinistre.getReference())
                .build();
        missionRepository.save(mission);

        // 5. Incrémenter le compteur de missions de l'expert
        bestExpert.setMissionsActives(
                bestExpert.getMissionsActives() != null ? bestExpert.getMissionsActives() + 1 : 1);
        expertRepository.save(bestExpert);

        log.info("Expert {} {} affecté au sinistre {}",
                bestExpert.getNom(), bestExpert.getPrenom(), sinistre.getReference());

        // 6. Notifications
        if (bestExpert.getUser() != null) {
            notificationService.envoyer(bestExpert.getUser(),
                    "Nouvelle expertise assignée",
                    "Vous avez été désigné expert pour le sinistre " + sinistre.getReference(),
                    com.gat.assurances.entity.enums.TypeNotification.INFO,
                    sinistre.getId());
        }
        if (sinistre.getClient() != null) {
            notificationService.envoyer(sinistre.getClient().getUser(),
                    "Expert désigné",
                    "Un expert a été désigné pour votre dossier " + sinistre.getReference(),
                    com.gat.assurances.entity.enums.TypeNotification.INFO,
                    sinistre.getId());
        }
        if (sinistre.getGestionnaire() != null) {
            notificationService.envoyer(sinistre.getGestionnaire().getUser(),
                    "Expert affecté",
                    "L'expert " + bestExpert.getNom() + " " + bestExpert.getPrenom()
                            + " a été affecté au sinistre " + sinistre.getReference(),
                    com.gat.assurances.entity.enums.TypeNotification.INFO,
                    sinistre.getId());
        }

        return bestExpert;
    }

    private int compareExperts(Expert a, Expert b, Sinistre sinistre) {
        // Si le garage a des coordonnées GPS, on favorise la proximité
        if (sinistre.getGarage() != null
                && sinistre.getGarage().getLatitude() != null
                && a.getLatitude() != null && b.getLatitude() != null) {
            double distA = geoService.distanceKm(
                    sinistre.getGarage().getLatitude(), sinistre.getGarage().getLongitude(),
                    a.getLatitude(), a.getLongitude());
            double distB = geoService.distanceKm(
                    sinistre.getGarage().getLatitude(), sinistre.getGarage().getLongitude(),
                    b.getLatitude(), b.getLongitude());
            if (Math.abs(distA - distB) > 5) return Double.compare(distA, distB);
        }
        // Sinon on trie par charge puis note
        int cmpCharge = Integer.compare(
                a.getMissionsActives() != null ? a.getMissionsActives() : 0,
                b.getMissionsActives() != null ? b.getMissionsActives() : 0);
        if (cmpCharge != 0) return cmpCharge;
        return Double.compare(
                b.getNote() != null ? b.getNote() : 0,
                a.getNote() != null ? a.getNote() : 0);
    }
}
