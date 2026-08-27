package com.gat.assurances.service;

import com.gat.assurances.dto.*;
import com.gat.assurances.entity.*;
import com.gat.assurances.entity.enums.*;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.mapper.*;
import com.gat.assurances.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SinistreRepository sinistreRepository;
    private final MissionRepository missionRepository;
    private final ClientRepository clientRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final GarageRepository garageRepository;
    private final ExpertRepository expertRepository;
    private final RemorqueurRepository remorqueurRepository;
        private final DemandeRemorquageRepository demandeRemorquageRepository;
    private final VehiculeRepository vehiculeRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SinistreMapper sinistreMapper;
    private final MissionMapper missionMapper;
    private final EvaluationRepository evaluationRepository;

    // ─── CLIENT ──────────────────────────────────────────────────────────────
    public DashboardClientDto dashboardClient(Authentication auth) {
        User user = getUser(auth);
        Client client = clientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        List<Sinistre> tous = sinistreRepository.findByClientId(client.getId());
        List<Sinistre> enCours = tous.stream()
                .filter(s -> s.getStatut() != StatutSinistre.CLOTURE && s.getStatut() != StatutSinistre.REFUSE)
                .collect(Collectors.toList());
        List<Sinistre> clotures = tous.stream()
                .filter(s -> s.getStatut() == StatutSinistre.CLOTURE)
                .collect(Collectors.toList());

        return DashboardClientDto.builder()
                .totalDossiers(tous.size())
                .dossiersEnCours(enCours.size())
                .dossiersClotures(clotures.size())
                .totalVehicules(vehiculeRepository.findByClientId(client.getId()).size())
                .notificationsNonLues(notificationRepository.countByUserIdAndLuFalse(user.getId()))
                .sinistresEnCours(enCours.stream().limit(5).map(sinistreMapper::toDto).collect(Collectors.toList()))
                .sinistresRecents(tous.stream().limit(10).map(sinistreMapper::toDto).collect(Collectors.toList()))
                .build();
    }

    // ─── GESTIONNAIRE ────────────────────────────────────────────────────────
    public DashboardGestionnaireDto dashboardGestionnaire(Authentication auth) {
        User user = getUser(auth);
        Gestionnaire g = gestionnaireRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gestionnaire introuvable"));

        List<Sinistre> tous = sinistreRepository.findByGestionnaireId(g.getId());
        List<Sinistre> actifs = tous.stream()
                .filter(s -> s.getStatut() != StatutSinistre.CLOTURE && s.getStatut() != StatutSinistre.REFUSE)
                .collect(Collectors.toList());
        List<Sinistre> aValider = sinistreRepository.findPendingValidationByGestionnaire(g.getId());
        List<Sinistre> urgents = sinistreRepository.findUrgentByGestionnaire(g.getId(), 7);
        long total = tous.size();
        long clos = tous.stream().filter(s -> s.getStatut() == StatutSinistre.CLOTURE).count();
        double taux = total > 0 ? Math.round((double) clos / total * 100 * 10) / 10.0 : 0;

        return DashboardGestionnaireDto.builder()
                .dossiersActifs(actifs.size())
                .dossiersAValider(aValider.size())
                .dossiersUrgents(urgents.size())
                .tauxResolution(taux)
                .notificationsNonLues(notificationRepository.countByUserIdAndLuFalse(user.getId()))
                .dossiersPrioritaires(urgents.stream().limit(10).map(sinistreMapper::toDto).collect(Collectors.toList()))
                .dossiersRecents(tous.stream().limit(10).map(sinistreMapper::toDto).collect(Collectors.toList()))
                .build();
    }

    // ─── GARAGE ──────────────────────────────────────────────────────────────
    public DashboardGarageDto dashboardGarage(Authentication auth) {
        User user = getUser(auth);
        Garage garage = garageRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Garage introuvable"));

        List<Mission> actives = missionRepository.findActiveMissionsByGarage(garage.getId());
        long enCours = actives.stream()
                .filter(m -> m.getStatut() == StatutMission.EN_COURS
                          || m.getStatut() == StatutMission.EN_REPARATION
                          || m.getStatut() == StatutMission.EN_DIAGNOSTIC).count();
        long devisEnAttente = actives.stream()
                .filter(m -> m.getDevis() == null).count();

        return DashboardGarageDto.builder()
                .missionsActives(actives.size())
                .missionsEnCours(enCours)
                .devisEnAttente(devisEnAttente)
                .noteMoyenne(noteGarage(garage))
                .notificationsNonLues(notificationRepository.countByUserIdAndLuFalse(user.getId()))
                .missionsActives_list(actives.stream().limit(5).map(missionMapper::toDto).collect(Collectors.toList()))
                .build();
    }

    // ─── EXPERT ──────────────────────────────────────────────────────────────
    public DashboardExpertDto dashboardExpert(Authentication auth) {
        User user = getUser(auth);
        Expert expert = expertRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expert introuvable"));

        List<Mission> missions = missionRepository.findByExpertIdOrderByCreatedAtDesc(expert.getId());
        long aPlanifier = missions.stream()
                .filter(m -> m.getStatut() == StatutMission.EN_ATTENTE
                          || m.getStatut() == StatutMission.ACCEPTEE).count();
        long rapportsDeposes = missions.stream()
                .filter(m -> m.getStatut() == StatutMission.RAPPORT_DEPOSE
                          || m.getStatut() == StatutMission.TERMINEE).count();

        return DashboardExpertDto.builder()
                .totalExpertisesMois(missions.size())
                .aPlanifier(aPlanifier)
                .rapportsDeposes(rapportsDeposes)
                .noteMoyenne(noteExpert(expert))
                .notificationsNonLues(notificationRepository.countByUserIdAndLuFalse(user.getId()))
                .missionsRecentes(missions.stream().limit(5).map(missionMapper::toDto).collect(Collectors.toList()))
                .build();
    }

    // ─── REMORQUEUR ──────────────────────────────────────────────────────────
    public DashboardRemorqueurDto dashboardRemorqueur(Authentication auth) {
        User user = getUser(auth);
        Remorqueur remorqueur = remorqueurRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur introuvable"));

        List<DemandeRemorquage> missions = demandeRemorquageRepository
                .findByRemorqueurId(remorqueur.getId());
        // Toutes les missions du remorqueur
        long enCours = missions.stream()
                .filter(m -> m.getStatut() != StatutRemorquage.LIVRE
                          && m.getStatut() != StatutRemorquage.ANNULE).count();

        return DashboardRemorqueurDto.builder()
                .missionsCeMois(missions.size())
                .missionsEnCours((int) enCours)
                .disponible(remorqueur.getDisponibilite())
                .notificationsNonLues(notificationRepository.countByUserIdAndLuFalse(user.getId()))
                .build();
    }

    // ─── MANAGER ────────────────────────────────────────────────────────────
    public DashboardManagerDto dashboardManager(Authentication auth) {
        long totalSinistres = sinistreRepository.count();
        long clotures = sinistreRepository.countByStatut(StatutSinistre.CLOTURE);
        long refuses = sinistreRepository.countByStatut(StatutSinistre.REFUSE);
        double taux = totalSinistres > 0 ? Math.round((double) clotures / totalSinistres * 100 * 10) / 10.0 : 0;
        Double satisfaction = evaluationRepository.averageNote();

        return DashboardManagerDto.builder()
                .totalSinistres(totalSinistres)
                .sinistresEnCours(totalSinistres - clotures - refuses)
                .sinistresClotures(clotures)
                .sinistresRefuses(refuses)
                .tauxResolutionGlobal(taux)
                .totalGarages(garageRepository.count())
                .totalExperts(expertRepository.count())
                .totalClients(clientRepository.count())
                .satisfactionMoyenne(satisfaction != null ? Math.round(satisfaction * 10) / 10.0 : 0)
                .build();
    }

    // ─── ADMIN ──────────────────────────────────────────────────────────────
    public DashboardAdminDto dashboardAdmin(Authentication auth) {
        return DashboardAdminDto.builder()
                .totalUtilisateurs(userRepository.count())
                .totalClients(clientRepository.count())
                .totalGarages(garageRepository.count())
                .totalExperts(expertRepository.count())
                .totalRemorqueurs(remorqueurRepository.count())
                .totalSinistres(sinistreRepository.count())
                .build();
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private double noteGarage(Garage garage) {
        Double moyenne = evaluationRepository.averageNoteByCibleIdAndType(
                garage.getId(), TypeEvaluation.GARAGE);
        return moyenne != null ? Math.round(moyenne * 10) / 10.0
                : (garage.getNote() != null ? garage.getNote() : 0);
    }

    private double noteExpert(Expert expert) {
        Double moyenne = evaluationRepository.averageNoteByCibleIdAndType(
                expert.getId(), TypeEvaluation.EXPERT);
        return moyenne != null ? Math.round(moyenne * 10) / 10.0
                : (expert.getNote() != null ? expert.getNote() : 0);
    }
}
