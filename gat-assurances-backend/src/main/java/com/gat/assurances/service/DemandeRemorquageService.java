package com.gat.assurances.service;

import com.gat.assurances.entity.*;
import com.gat.assurances.entity.enums.*;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        List<Remorqueur> disponibles = remorqueurRepository.findAvailableWithCoordinates();
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
    public DemandeRemorquage avancer(Long id, StatutRemorquage statut,
                                     String photos, Authentication auth) {
        DemandeRemorquage demande = getById(id);
        verifierAccesRemorqueur(demande, auth);

        demande.setStatut(statut);
        if (photos != null && !photos.isBlank()) demande.setPhotosIntervention(photos);

        if (statut == StatutRemorquage.ARRIVE_SUR_PLACE)
            demande.setDateArrivee(LocalDateTime.now());

        if (statut == StatutRemorquage.LIVRE) {
            demande.setDateLivraison(LocalDateTime.now());
            if (demande.getRemorqueur() != null) {
                demande.getRemorqueur().setDisponibilite(true);
                remorqueurRepository.save(demande.getRemorqueur());
            }
            Sinistre sinistre = demande.getSinistre();
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

    public List<DemandeRemorquage> findByRemorqueur(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Remorqueur r = remorqueurRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur introuvable"));
        return demandeRepo.findActiveMissionsByRemorqueur(r.getId());
    }

    public List<DemandeRemorquage> findPending() {
        return demandeRepo.findAllPending();
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
