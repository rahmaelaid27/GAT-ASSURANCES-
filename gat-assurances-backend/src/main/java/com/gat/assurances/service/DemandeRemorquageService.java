package com.gat.assurances.service;

import com.gat.assurances.entity.*;
import com.gat.assurances.entity.enums.*;
import com.gat.assurances.dto.RemorqueurDto;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemandeRemorquageService {

    private final DemandeRemorquageRepository demandeRepo;
    private final SinistreRepository sinistreRepository;
    private final RemorqueurRepository remorqueurRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
        private final JdbcTemplate jdbcTemplate;

        @jakarta.annotation.PostConstruct
        void migratePhotoColumn() {
                jdbcTemplate.execute("ALTER TABLE demandes_remorquage MODIFY COLUMN photos_intervention LONGTEXT");
        }

    @Transactional
    public DemandeRemorquage creer(Long sinistreId, String locDepart,
                                   String coordsDepart, String locDest,
                                   String coordsDest, Authentication auth) {
        Sinistre sinistre = sinistreRepository.findById(sinistreId)
                .orElseThrow(() -> new ResourceNotFoundException("Sinistre", sinistreId));

        DemandeRemorquage demande = DemandeRemorquage.builder()
                .sinistre(sinistre)
                .localisationDepart(locDepart)
                .coordonneesDepart(coordsDepart)
                .localisationDestination(locDest)
                .coordonneesDestination(coordsDest)
                .statut(StatutRemorquage.EN_ATTENTE)
                .build();
        demande = demandeRepo.save(demande);

        sinistre.setStatut(StatutSinistre.REMORQUAGE_EN_COURS);
        sinistreRepository.save(sinistre);

        // Notifier tous les remorqueurs disponibles
        List<Remorqueur> disponibles = remorqueurRepository.findByDisponibiliteTrue();
        for (Remorqueur r : disponibles) {
            if (r.getUser() != null) {
                notificationService.envoyer(r.getUser(),
                        "Demande de remorquage",
                        "Nouvelle demande de remorquage disponible pour le dossier " + sinistre.getReference(),
                        TypeNotification.ALERTE, sinistreId);
            }
        }
        log.info("Demande de remorquage créée pour sinistre {}", sinistre.getReference());
        return demande;
    }

    @Transactional
    public DemandeRemorquage accepter(Long id, Authentication auth) {
        DemandeRemorquage demande = getById(id);
        if (demande.getStatut() != StatutRemorquage.EN_ATTENTE)
            throw new BusinessException("Cette demande n'est plus disponible.");

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Remorqueur remorqueur = remorqueurRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur introuvable"));
        if (demande.getRemorqueur() != null
            && !demande.getRemorqueur().getId().equals(remorqueur.getId()))
            throw new BusinessException("Cette demande est réservée à un autre remorqueur.");

        demande.setRemorqueur(remorqueur);
        demande.setStatut(StatutRemorquage.ACCEPTE);
        demande.setDateAcceptation(LocalDateTime.now());
        remorqueur.setDisponibilite(false);
        remorqueurRepository.save(remorqueur);
        demande = demandeRepo.save(demande);

        Sinistre sinistre = demande.getSinistre();
        if (sinistre.getClient() != null)
            notificationService.envoyer(sinistre.getClient().getUser(),
                    "Remorqueur en route",
                    "Un remorqueur a accepté votre demande pour le dossier " + sinistre.getReference(),
                    TypeNotification.INFO, sinistre.getId());
        if (sinistre.getGestionnaire() != null)
            notificationService.envoyer(sinistre.getGestionnaire().getUser(),
                    "Remorqueur accepté",
                    remorqueur.getNom() + " " + remorqueur.getPrenom()
                            + " prend en charge le remorquage du dossier " + sinistre.getReference(),
                    TypeNotification.INFO, sinistre.getId());
        return demande;
    }

        @Transactional
        public DemandeRemorquage refuser(Long id, Authentication auth) {
                DemandeRemorquage demande = getById(id);
                if (demande.getStatut() != StatutRemorquage.EN_ATTENTE)
                        throw new BusinessException("Cette demande n'est plus disponible.");
                Remorqueur remorqueur = resolveRemorqueur(auth);
                if (demande.getRemorqueur() != null && !demande.getRemorqueur().getId().equals(remorqueur.getId()))
                        throw new BusinessException("Cette demande est réservée à un autre remorqueur.");
                demande.setRemorqueur(null);
                demande.setStatut(StatutRemorquage.ANNULE);
                demande = demandeRepo.save(demande);
                Sinistre sinistre = demande.getSinistre();
                if (sinistre.getGestionnaire() != null)
                        notificationService.envoyer(sinistre.getGestionnaire().getUser(), "Demande refusée",
                                        "Le remorqueur a refusé la demande du dossier " + sinistre.getReference(),
                                        TypeNotification.INFO, sinistre.getId());
                if (sinistre.getClient() != null)
                    notificationService.envoyer(sinistre.getClient().getUser(), "Demande de remorquage refusée",
                            "La demande de remorquage du dossier " + sinistre.getReference()
                            + " doit être réattribuée à un autre remorqueur.",
                            TypeNotification.INFO, sinistre.getId());
                return demande;
        }

    @Transactional
    public DemandeRemorquage avancer(Long id, StatutRemorquage statut,
                                     String photos, Authentication auth) {
        DemandeRemorquage demande = getById(id);
        verifierAccesRemorqueur(demande, auth);

        demande.setStatut(statut);
        if (photos != null && !photos.isBlank()) demande.setPhotosIntervention(photos);

        if (statut == StatutRemorquage.ARRIVE_SUR_PLACE)
            demande.setDateArrivee(LocalDateTime.now());

                Sinistre sinistre = demande.getSinistre();
                if (sinistre.getClient() != null)
                        notificationService.envoyer(sinistre.getClient().getUser(),
                                        "Suivi du remorquage",
                                        "Le remorqueur a mis à jour le dossier " + sinistre.getReference()
                                        + " : " + statutLabel(statut), TypeNotification.INFO, sinistre.getId());

        if (statut == StatutRemorquage.LIVRE) {
            demande.setDateLivraison(LocalDateTime.now());
                        sinistre.setStatut(StatutSinistre.EN_REPARATION);
                        sinistreRepository.save(sinistre);
            if (demande.getRemorqueur() != null) {
                demande.getRemorqueur().setDisponibilite(true);
                remorqueurRepository.save(demande.getRemorqueur());
            }
            if (sinistre.getGarage() != null)
                notificationService.envoyer(sinistre.getGarage().getUser(),
                        "Véhicule livré",
                        "Le véhicule du dossier " + sinistre.getReference() + " est arrivé.",
                        TypeNotification.INFO, sinistre.getId());
            if (sinistre.getClient() != null)
                notificationService.envoyer(sinistre.getClient().getUser(),
                        "Véhicule livré au garage",
                        "Votre véhicule a été livré au garage pour le dossier " + sinistre.getReference(),
                        TypeNotification.INFO, sinistre.getId());
        }
        return demandeRepo.save(demande);
    }

        private String statutLabel(StatutRemorquage statut) {
                return switch (statut) {
                        case EN_ROUTE -> "en route";
                        case ARRIVE_SUR_PLACE -> "arrivé sur place";
                        case VEHICULE_CHARGE -> "véhicule pris en charge";
                        case EN_TRANSIT -> "véhicule en transit";
                        case LIVRE -> "véhicule livré au garage";
                        default -> statut.name().toLowerCase().replace('_', ' ');
                };
        }

    public List<DemandeRemorquage> findByRemorqueur(Authentication auth) {
        Remorqueur r = resolveRemorqueur(auth);
        return demandeRepo.findActiveMissionsByRemorqueur(r.getId());
    }

    public List<DemandeRemorquage> findPending(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (user.getRole() == Role.ADMIN) return demandeRepo.findAllPending();
        Remorqueur remorqueur = resolveRemorqueur(auth);
        return demandeRepo.findPendingForRemorqueur(remorqueur.getId());
    }

        public List<DemandeRemorquage> findBySinistre(Long sinistreId) {
                return demandeRepo.findBySinistreId(sinistreId);
        }

    private Remorqueur resolveRemorqueur(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return remorqueurRepository.findByUserId(user.getId())
                .or(() -> remorqueurRepository.findByEmail(user.getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur introuvable"));
    }

    public List<RemorqueurDto> findAvailableRemorqueurs() {
        return remorqueurRepository.findByDisponibiliteTrue().stream()
                .map(r -> RemorqueurDto.builder()
                        .id(r.getId())
                        .nom(r.getNom())
                        .prenom(r.getPrenom())
                        .email(r.getEmail())
                        .telephone(r.getTelephone())
                        .disponibilite(r.getDisponibilite())
                        .localisation(r.getLocalisation())
                        .capacite(r.getCapacite())
                        .build())
                .toList();
    }

    public DemandeRemorquage getById(Long id) {
        return demandeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de remorquage", id));
    }

    private void verifierAccesRemorqueur(DemandeRemorquage demande, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (demande.getRemorqueur() == null
                || !demande.getRemorqueur().getUser().getId().equals(user.getId()))
            throw new BusinessException("Accès refusé à cette demande de remorquage.");
    }
}
