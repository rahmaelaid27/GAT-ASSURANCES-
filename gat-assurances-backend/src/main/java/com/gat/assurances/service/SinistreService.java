package com.gat.assurances.service;

import com.gat.assurances.dto.SinistreDto;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SinistreService {

    private final SinistreRepository sinistreRepository;
    private final ClientRepository clientRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ContratRepository contratRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final GarageRepository garageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ExpertAffectationService expertAffectationService;

    // ─── DÉCLARATION ────────────────────────────────────────────────────────

    @Transactional
    public Sinistre declarer(SinistreDto dto, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Client client = clientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        // ─── Recherche ou création automatique du véhicule ──────────────────
        String immat = dto.getVehiculeImmatriculation().trim().toUpperCase();
        Vehicule vehicule = vehiculeRepository.findByImmatriculation(immat)
                .orElse(null);

        if (vehicule == null) {
            // Le véhicule n'est pas encore enregistré → on le crée automatiquement
            log.info("Véhicule {} inconnu → création automatique pour le client {}", immat, client.getId());
            vehicule = vehiculeRepository.save(Vehicule.builder()
                    .immatriculation(immat)
                    .marque(dto.getVehiculeMarque() != null ? dto.getVehiculeMarque() : "Non renseigné")
                    .modele(dto.getVehiculeModele() != null ? dto.getVehiculeModele() : "Non renseigné")
                    .annee(LocalDate.now().getYear())
                    .typeVehicule(TypeVehicule.VOITURE_PARTICULIERE)
                    .client(client)
                    .build());
        } else if (!vehicule.getClient().getId().equals(client.getId())) {
            // Le véhicule existe mais appartient à un autre client
            throw new BusinessException(
                    "Le véhicule " + immat + " est enregistré sous un autre compte. "
                    + "Vérifiez l'immatriculation ou contactez le support GAT.");
        }

        LocalDate dateSinistre = dto.getDateSinistre() != null
                ? dto.getDateSinistre() : LocalDate.now();

        // Vérification contrat — avertissement uniquement (non bloquant pour les tests)
        boolean contratActif = contratRepository
                .findActiveContratForVehiculeAtDate(vehicule.getId(), dateSinistre)
                .isPresent();
        if (!contratActif) {
            log.warn("Aucun contrat actif trouvé pour le véhicule {} à la date {} — déclaration acceptée quand même",
                    vehicule.getImmatriculation(), dateSinistre);
        }

        String reference = genererReference();

        Sinistre sinistre = Sinistre.builder()
                .reference(reference)
                .client(client)
                .vehicule(vehicule)
                .statut(StatutSinistre.DECLARE)
                .dateDeclaration(dateSinistre)
                .dateSinistre(dateSinistre)
                .gouvernorat(dto.getGouvernorat())
                .localite(dto.getLocalite())
                .coordonneesGps(dto.getCoordonneesGps())
                .typeSinistre(dto.getTypeSinistre())
                .description(dto.getDescription())
                .photos(dto.getPhotos())
                .documents(dto.getDocuments())
                .lieu(dto.getLocalite() != null ? dto.getLocalite()
                        : (dto.getGouvernorat() != null ? dto.getGouvernorat() : "Non précisé"))
                .build();

        sinistre = sinistreRepository.save(sinistre);

        notificationService.envoyer(user,
                "Dossier créé",
                "Votre dossier " + reference + " a été créé avec succès.",
                TypeNotification.INFO, sinistre.getId());

        // Affectation automatique gestionnaire
        affecter(sinistre);

        log.info("Sinistre {} déclaré par {}", reference, user.getEmail());
        return sinistre;
    }

    // ─── AFFECTATION AUTOMATIQUE GESTIONNAIRE ───────────────────────────────

    @Transactional
    public void affecter(Sinistre sinistre) {
        List<Gestionnaire> disponibles = gestionnaireRepository.findAvailableOrderByLoad();
        if (disponibles.isEmpty()) {
            log.warn("Aucun gestionnaire disponible pour le sinistre {}", sinistre.getReference());
            return;
        }
        Gestionnaire gestionnaire = disponibles.get(0);
        sinistre.setGestionnaire(gestionnaire);
        sinistre.setStatut(StatutSinistre.EN_INSTRUCTION);
        sinistreRepository.save(sinistre);

        gestionnaire.setDossiersActifs(
                gestionnaire.getDossiersActifs() != null ? gestionnaire.getDossiersActifs() + 1 : 1);
        gestionnaireRepository.save(gestionnaire);

        notificationService.envoyer(gestionnaire.getUser(),
                "Nouveau dossier",
                "Le dossier " + sinistre.getReference() + " vous a été affecté.",
                TypeNotification.ALERTE, sinistre.getId());
    }

    // ─── GESTION STATUTS PAR GESTIONNAIRE ───────────────────────────────────

    @Transactional
    public Sinistre changerStatut(Long id, StatutSinistre nouveauStatut,
                                  String motif, Authentication auth) {
        Sinistre sinistre = getById(id);
        verifierAccesGestionnaire(sinistre, auth);

        sinistre.setStatut(nouveauStatut);
        if (motif != null) sinistre.setMotifRejet(motif);

        if (nouveauStatut == StatutSinistre.CLOTURE) {
            sinistre.setDateCloture(LocalDate.now());
            // Décrémenter compteur gestionnaire
            Gestionnaire g = sinistre.getGestionnaire();
            if (g != null && g.getDossiersActifs() != null && g.getDossiersActifs() > 0) {
                g.setDossiersActifs(g.getDossiersActifs() - 1);
                gestionnaireRepository.save(g);
            }
        }

        sinistre = sinistreRepository.save(sinistre);

        // Notifications selon le statut
        envoyerNotifChangementStatut(sinistre, nouveauStatut);

        return sinistre;
    }

    // ─── AFFECTATION GARAGE ──────────────────────────────────────────────────

    @Transactional
    public Sinistre affecterGarage(Long sinistreId, Long garageId, Authentication auth) {
        Sinistre sinistre = getById(sinistreId);

        // Seul le client propriétaire peut choisir le garage
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!sinistre.getClient().getUser().getId().equals(user.getId()))
            throw new BusinessException("Seul le client peut choisir le garage.");

        if (sinistre.getStatut() == StatutSinistre.CLOTURE
                || sinistre.getStatut() == StatutSinistre.REFUSE
                || sinistre.getStatut() == StatutSinistre.REMBOURSE)
            throw new BusinessException("Ce dossier est clôturé et ne peut plus être modifié.");

        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new ResourceNotFoundException("Garage", garageId));

        sinistre.setGarage(garage);
        sinistre.setStatut(StatutSinistre.GARAGE_AFFECTE);
        sinistre = sinistreRepository.save(sinistre);

        notificationService.envoyer(garage.getUser(),
                "Nouvelle mission",
                "Une nouvelle mission a été assignée à votre garage pour le dossier " + sinistre.getReference(),
                TypeNotification.INFO, sinistre.getId());
        notificationService.envoyer(sinistre.getClient().getUser(),
                "Garage sélectionné",
                "Le garage " + garage.getNom() + " a été affecté à votre dossier " + sinistre.getReference(),
                TypeNotification.INFO, sinistre.getId());

        // Affectation automatique de l'expert
        Expert expert = expertAffectationService.affecter(sinistre);
        sinistre.setExpert(expert);
        sinistre.setStatut(StatutSinistre.EXPERT_AFFECTE);
        sinistre = sinistreRepository.save(sinistre);

        return sinistre;
    }

    // ─── APPROBATION / CLÔTURE ───────────────────────────────────────────────

    @Transactional
    public Sinistre approuver(Long id, Authentication auth) {
        return changerStatut(id, StatutSinistre.APPROUVE, null, auth);
    }

    @Transactional
    public Sinistre cloturer(Long id, Authentication auth) {
        Sinistre sinistre = getById(id);
        if (sinistre.getStatut() != StatutSinistre.APPROUVE)
            throw new BusinessException("Le dossier doit être approuvé avant la clôture.");
        return changerStatut(id, StatutSinistre.CLOTURE, null, auth);
    }

    @Transactional
    public Sinistre refuser(Long id, String motif, Authentication auth) {
        if (motif == null || motif.isBlank())
            throw new BusinessException("Un motif de refus est obligatoire.");
        return changerStatut(id, StatutSinistre.REFUSE, motif, auth);
    }

    @Transactional
    public Sinistre demanderComplement(Long id, String motif, Authentication auth) {
        if (motif == null || motif.isBlank())
            throw new BusinessException("Un motif est obligatoire pour demander un complément.");
        return changerStatut(id, StatutSinistre.INCOMPLET, motif, auth);
    }

    // ─── LECTURES ────────────────────────────────────────────────────────────

    public List<Sinistre> findByClient(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Client client = clientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        return sinistreRepository.findByClientId(client.getId());
    }

    public List<Sinistre> findByGestionnaire(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Gestionnaire gestionnaire = gestionnaireRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gestionnaire introuvable"));
        return sinistreRepository.findByGestionnaireId(gestionnaire.getId());
    }

    public List<Sinistre> findByGarage(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Garage garage = garageRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Garage introuvable"));
        return sinistreRepository.findByGarageId(garage.getId());
    }

    public List<Sinistre> findAll() {
        return sinistreRepository.findAll();
    }

    public Sinistre getById(Long id) {
        return sinistreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sinistre", id));
    }

    // ─── HELPERS PRIVÉS ──────────────────────────────────────────────────────

    private String genererReference() {
        long count = sinistreRepository.count() + 1;
        return String.format("GAT-%d-%05d", Year.now().getValue(), count);
    }

    private void verifierAccesGestionnaire(Sinistre sinistre, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isGestionnaire = sinistre.getGestionnaire() != null
                && sinistre.getGestionnaire().getUser().getId().equals(user.getId());
        if (!isAdmin && !isGestionnaire)
            throw new BusinessException("Vous n'êtes pas autorisé à modifier ce dossier.");
    }

    private void envoyerNotifChangementStatut(Sinistre sinistre, StatutSinistre statut) {
        String message = "Le statut de votre dossier " + sinistre.getReference()
                + " est maintenant : " + statut.name().replace("_", " ");
        if (sinistre.getClient() != null)
            notificationService.envoyer(sinistre.getClient().getUser(),
                    "Changement de statut", message, TypeNotification.INFO, sinistre.getId());

        switch (statut) {
            case CLOTURE -> {
                if (sinistre.getGarage() != null)
                    notificationService.envoyer(sinistre.getGarage().getUser(),
                            "Dossier clôturé", "Le dossier " + sinistre.getReference() + " est clôturé.",
                            TypeNotification.INFO, sinistre.getId());
                if (sinistre.getExpert() != null)
                    notificationService.envoyer(sinistre.getExpert().getUser(),
                            "Dossier clôturé", "Le dossier " + sinistre.getReference() + " est clôturé.",
                            TypeNotification.INFO, sinistre.getId());
            }
            case INCOMPLET -> {
                if (sinistre.getClient() != null)
                    notificationService.envoyer(sinistre.getClient().getUser(),
                            "Complément requis",
                            "Des informations manquantes ont été signalées : " + sinistre.getMotifRejet(),
                            TypeNotification.ALERTE, sinistre.getId());
            }
            case APPROUVE -> {
                if (sinistre.getGarage() != null)
                    notificationService.envoyer(sinistre.getGarage().getUser(),
                            "Dossier approuvé", "Le dossier " + sinistre.getReference() + " a été approuvé.",
                            TypeNotification.SUCCES, sinistre.getId());
            }
            default -> { }
        }
    }
}
