package com.gat.assurances.service;

import com.gat.assurances.dto.MissionDto;
import com.gat.assurances.entity.*;
import com.gat.assurances.entity.enums.StatutMission;
import com.gat.assurances.entity.enums.TypeNotification;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository   missionRepository;
    private final SinistreRepository  sinistreRepository;
    private final GarageRepository    garageRepository;
    private final ExpertRepository    expertRepository;
    private final UserRepository      userRepository;
    private final NotificationService notificationService;

    // ═══════════════════════════════════════════════════════════════════════
    //  READ
    // ═══════════════════════════════════════════════════════════════════════

    public List<MissionDto> findAll() {
        return missionRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MissionDto> findBySinistre(Long sinistreId) {
        return missionRepository.findBySinistreId(sinistreId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MissionDto findById(Long id) {
        return mapToDto(getMission(id));
    }

    public List<MissionDto> findByGarage(Authentication auth) {
        User user = getUser(auth);
        Garage garage = garageRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Garage introuvable"));
        return missionRepository.findByGarageIdOrderByCreatedAtDesc(garage.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MissionDto> findByExpert(Authentication auth) {
        User user = getUser(auth);
        Expert expert = expertRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expert introuvable"));
        return missionRepository.findByExpertIdOrderByCreatedAtDesc(expert.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CRUD basique
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public MissionDto create(MissionDto dto) {
        Mission m = new Mission();
        m.setDescription(dto.getDescription());
        m.setTypeMission(dto.getTypeMission());
        if (dto.getSinistreId() != null)
            m.setSinistre(sinistreRepository.findById(dto.getSinistreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sinistre", dto.getSinistreId())));
        return mapToDto(missionRepository.save(m));
    }

    @Transactional
    public MissionDto update(Long id, MissionDto dto) {
        Mission m = getMission(id);
        if (dto.getDescription() != null) m.setDescription(dto.getDescription());
        if (dto.getTypeMission()  != null) m.setTypeMission(dto.getTypeMission());
        if (dto.getDateDebut()    != null) m.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin()      != null) m.setDateFin(dto.getDateFin());
        if (dto.getStatut()       != null) m.setStatut(dto.getStatut());
        return mapToDto(missionRepository.save(m));
    }

    public void delete(Long id) {
        if (!missionRepository.existsById(id)) throw new ResourceNotFoundException("Mission", id);
        missionRepository.deleteById(id);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FLUX EXPERTISE : Expert → rapport → Gestionnaire
    // ═══════════════════════════════════════════════════════════════════════

    /** Expert planifie la date d'inspection. */
    @Transactional
    public MissionDto planifier(Long id, String datePrevue, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        LocalDateTime date = parseDateTime(datePrevue);
        m.setDateExpertisePrevue(date);
        m.setStatut(StatutMission.PLANIFIEE);
        m = missionRepository.save(m);
        notifClient(m, "Expertise planifiée",
                "L'expertise de votre dossier " + ref(m) + " est planifiée le " + date.toLocalDate());
        return mapToDto(m);
    }

    /** Expert démarre l'inspection. */
    @Transactional
    public MissionDto demarrerInspection(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        m.setStatut(StatutMission.EN_DIAGNOSTIC);
        return mapToDto(missionRepository.save(m));
    }

    /**
     * Expert dépose le rapport d'expertise et l'envoie au gestionnaire.
     * Mission.devis = contenu du rapport (champ réutilisé).
     */
    @Transactional
    public MissionDto deposerRapportExpert(Long id, String rapport, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        if (rapport == null || rapport.isBlank())
            throw new BusinessException("Le rapport ne peut pas être vide.");
        m.setDevis(rapport);  // stocké dans le champ devis
        m.setStatut(StatutMission.RAPPORT_EXPERT_DEPOSE);
        m = missionRepository.save(m);
        // Notifier le gestionnaire
        notifGestionnaire(m, "Rapport d'expertise déposé",
                "L'expert a déposé son rapport pour le dossier " + ref(m) + ". Vérification requise.");
        log.info("Rapport expert déposé — mission {}", id);
        return mapToDto(m);
    }

    /** Gestionnaire valide le rapport d'expertise → client notifié. */
    @Transactional
    public MissionDto validerRapport(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGestionnaire(m, auth);
        if (m.getStatut() != StatutMission.RAPPORT_EXPERT_DEPOSE
                && m.getStatut() != StatutMission.RAPPORT_EXPERT_INCOMPLET)
            throw new BusinessException("Aucun rapport en attente de validation.");
        m.setStatut(StatutMission.RAPPORT_EXPERT_VALIDE);
        m = missionRepository.save(m);
        notifClient(m, "Rapport d'expertise validé",
                "Le rapport d'expertise pour votre dossier " + ref(m) + " a été validé.");
        notifExpert(m, "Rapport validé",
                "Votre rapport pour le dossier " + ref(m) + " a été validé par le gestionnaire.");
        log.info("Rapport expert validé — mission {}", id);
        return mapToDto(m);
    }

    /** Gestionnaire demande une correction du rapport à l'expert. */
    @Transactional
    public MissionDto rejeterRapport(Long id, String motif, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGestionnaire(m, auth);
        if (motif == null || motif.isBlank())
            throw new BusinessException("Un motif de rejet est obligatoire.");
        m.setStatut(StatutMission.RAPPORT_EXPERT_INCOMPLET);
        m.setMotifRefus(motif);
        m = missionRepository.save(m);
        notifExpert(m, "Correction rapport demandée",
                "Le gestionnaire demande une correction de votre rapport (dossier " + ref(m) + ") : " + motif);
        log.info("Rapport expert rejeté — mission {} : {}", id, motif);
        return mapToDto(m);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FLUX DEVIS : Garage → Expert → Gestionnaire
    // ═══════════════════════════════════════════════════════════════════════

    /** Garage dépose le devis et l'envoie à l'expert pour vérification. */
    @Transactional
    public MissionDto deposerDevis(Long id, String devisTexte, BigDecimal montant, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGarage(m, auth);
        if (devisTexte == null || devisTexte.isBlank())
            throw new BusinessException("Le contenu du devis est obligatoire.");
        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0)
            throw new BusinessException("Le montant du devis doit être supérieur à 0.");
        m.setDevis(devisTexte);
        m.setMontantDevis(montant);
        m.setStatut(StatutMission.DEVIS_DEPOSE);
        m.setMotifRefus(null); // reset motif précédent
        m = missionRepository.save(m);
        // Notifier l'expert
        notifExpert(m, "Nouveau devis à vérifier",
                "Le garage a déposé un devis de " + montant + " TND pour le dossier " + ref(m) + ". Veuillez le vérifier.");
        log.info("Devis déposé — mission {} : {} TND", id, montant);
        return mapToDto(m);
    }

    /** Expert commence la vérification du devis. */
    @Transactional
    public MissionDto commencerVerificationDevis(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        m.setStatut(StatutMission.DEVIS_EN_VERIFICATION_EXPERT);
        return mapToDto(missionRepository.save(m));
    }

    /**
     * Expert demande un complément au garage (devis incomplet ou insuffisant).
     * Le garage doit redéposer un devis corrigé.
     */
    @Transactional
    public MissionDto demanderComplementDevis(Long id, String motif, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        if (motif == null || motif.isBlank())
            throw new BusinessException("Un motif est obligatoire pour demander un complément.");
        m.setStatut(StatutMission.DEVIS_COMPLEMENT_DEMANDE);
        m.setMotifRefus(motif);
        m = missionRepository.save(m);
        notifGarage(m, "Complément devis demandé",
                "L'expert demande un complément sur votre devis (dossier " + ref(m) + ") : " + motif);
        log.info("Complément devis demandé — mission {} : {}", id, motif);
        return mapToDto(m);
    }

    /**
     * Expert valide techniquement le devis et l'envoie au gestionnaire.
     */
    @Transactional
    public MissionDto validerDevisExpert(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesExpert(m, auth);
        if (m.getStatut() != StatutMission.DEVIS_DEPOSE
                && m.getStatut() != StatutMission.DEVIS_EN_VERIFICATION_EXPERT
                && m.getStatut() != StatutMission.DEVIS_COMPLEMENT_DEMANDE)
            throw new BusinessException("Aucun devis en attente de validation expert.");
        m.setStatut(StatutMission.DEVIS_VALIDE_EXPERT);
        m.setMotifRefus(null);
        m = missionRepository.save(m);
        notifGestionnaire(m, "Devis validé par l'expert",
                "L'expert a validé le devis de " + m.getMontantDevis() + " TND pour le dossier "
                + ref(m) + ". Validation administrative requise.");
        log.info("Devis validé par expert — mission {}", id);
        return mapToDto(m);
    }

    /**
     * Gestionnaire valide définitivement le devis → garage peut commencer.
     */
    @Transactional
    public MissionDto validerDevisFinal(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGestionnaire(m, auth);
        if (m.getStatut() != StatutMission.DEVIS_VALIDE_EXPERT)
            throw new BusinessException("Le devis doit d'abord être validé par l'expert.");
        m.setStatut(StatutMission.DEVIS_VALIDE_FINAL);
        m.setMotifRefus(null);
        m = missionRepository.save(m);
        notifGarage(m, "Devis approuvé — vous pouvez commencer",
                "Votre devis de " + m.getMontantDevis() + " TND a été approuvé. Vous pouvez démarrer la réparation du dossier " + ref(m) + ".");
        notifClient(m, "Devis approuvé",
                "Le devis de réparation de " + m.getMontantDevis() + " TND pour votre dossier " + ref(m) + " a été approuvé.");
        log.info("Devis validé final — mission {}", id);
        return mapToDto(m);
    }

    /**
     * Gestionnaire refuse le devis → retour vers garage et expert.
     */
    @Transactional
    public MissionDto refuserDevis(Long id, String motif, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGestionnaire(m, auth);
        if (motif == null || motif.isBlank())
            throw new BusinessException("Un motif de refus est obligatoire.");
        m.setStatut(StatutMission.DEVIS_REFUSE);
        m.setMotifRefus(motif);
        m = missionRepository.save(m);
        notifGarage(m, "Devis refusé",
                "Votre devis pour le dossier " + ref(m) + " a été refusé : " + motif);
        notifExpert(m, "Devis refusé",
                "Le gestionnaire a refusé le devis du dossier " + ref(m) + " : " + motif);
        log.info("Devis refusé — mission {} : {}", id, motif);
        return mapToDto(m);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  AVANCEMENT GARAGE (réparation physique)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public MissionDto majAvancement(Long id, String avancement, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGarage(m, auth);
        m.setAvancementGarage(avancement);
        switch (avancement) {
            case "EN_DIAGNOSTIC"       -> m.setStatut(StatutMission.EN_DIAGNOSTIC);
            case "EN_COMMANDE_PIECES"  -> m.setStatut(StatutMission.EN_COMMANDE_PIECES);
            case "EN_REPARATION"       -> m.setStatut(StatutMission.EN_REPARATION);
            case "REPARATION_TERMINEE" -> m.setStatut(StatutMission.REPARATION_TERMINEE);
        }
        m = missionRepository.save(m);
        notifClient(m, "Avancement réparation",
                "Votre dossier " + ref(m) + " : " + avancement.replace("_", " "));
        return mapToDto(m);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FACTURE (garage → clôture)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public MissionDto deposerFacture(Long id, String facture, BigDecimal montant, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGarage(m, auth);
        m.setFacture(facture);
        m.setMontantFacture(montant);
        m.setStatut(StatutMission.FACTURE_DEPOSEE);
        m = missionRepository.save(m);
        notifClient(m, "Facture disponible",
                "La facture de " + montant + " TND est disponible pour votre dossier " + ref(m) + ".");
        notifGestionnaire(m, "Facture déposée",
                "Le garage a déposé la facture de " + montant + " TND pour le dossier " + ref(m) + ".");
        return mapToDto(m);
    }

    @Transactional
    public MissionDto terminer(Long id, Authentication auth) {
        Mission m = getMission(id);
        verifierAccesGarage(m, auth);
        m.setStatut(StatutMission.TERMINEE);
        m.setAvancementGarage("REPARATION_TERMINEE");
        return mapToDto(missionRepository.save(m));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  HELPERS PRIVÉS
    // ═══════════════════════════════════════════════════════════════════════

    private Mission getMission(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mission", id));
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private void verifierAccesExpert(Mission m, Authentication auth) {
        User user = getUser(auth);
        boolean ok = "ADMIN".equals(user.getRole().name())
                || (m.getExpert() != null
                    && m.getExpert().getUser() != null
                    && m.getExpert().getUser().getId().equals(user.getId()));
        if (!ok) throw new BusinessException("Vous n'êtes pas l'expert affecté à cette mission.");
    }

    private void verifierAccesGarage(Mission m, Authentication auth) {
        User user = getUser(auth);
        boolean ok = "ADMIN".equals(user.getRole().name())
                || (m.getGarage() != null
                    && m.getGarage().getUser() != null
                    && m.getGarage().getUser().getId().equals(user.getId()));
        if (!ok) throw new BusinessException("Vous n'êtes pas le garage affecté à cette mission.");
    }

    private void verifierAccesGestionnaire(Mission m, Authentication auth) {
        User user = getUser(auth);
        boolean ok = "ADMIN".equals(user.getRole().name())
                || "GESTIONNAIRE".equals(user.getRole().name());
        if (!ok) throw new BusinessException("Accès réservé au gestionnaire.");
    }

    private String ref(Mission m) {
        return m.getSinistre() != null ? m.getSinistre().getReference() : "#" + m.getId();
    }

    private void notifClient(Mission m, String titre, String msg) {
        if (m.getSinistre() != null && m.getSinistre().getClient() != null)
            notificationService.envoyer(m.getSinistre().getClient().getUser(),
                    titre, msg, TypeNotification.INFO,
                    m.getSinistre().getId());
    }

    private void notifGestionnaire(Mission m, String titre, String msg) {
        if (m.getSinistre() != null && m.getSinistre().getGestionnaire() != null)
            notificationService.envoyer(m.getSinistre().getGestionnaire().getUser(),
                    titre, msg, TypeNotification.ALERTE,
                    m.getSinistre().getId());
    }

    private void notifExpert(Mission m, String titre, String msg) {
        if (m.getExpert() != null && m.getExpert().getUser() != null)
            notificationService.envoyer(m.getExpert().getUser(),
                    titre, msg, TypeNotification.INFO,
                    m.getSinistre() != null ? m.getSinistre().getId() : null);
    }

    private void notifGarage(Mission m, String titre, String msg) {
        if (m.getGarage() != null && m.getGarage().getUser() != null)
            notificationService.envoyer(m.getGarage().getUser(),
                    titre, msg, TypeNotification.INFO,
                    m.getSinistre() != null ? m.getSinistre().getId() : null);
    }

    private static LocalDateTime parseDateTime(String s) {
        // Accepte "2026-08-10T14:30" ou "2026-08-10T14:30:00"
        return LocalDateTime.parse(s.length() == 16 ? s + ":00" : s.substring(0, 19));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  MAPPER
    // ═══════════════════════════════════════════════════════════════════════

    MissionDto mapToDto(Mission m) {
        MissionDto.MissionDtoBuilder b = MissionDto.builder()
                .id(m.getId())
                .description(m.getDescription())
                .dateDebut(m.getDateDebut())
                .dateFin(m.getDateFin())
                .statut(m.getStatut())
                .typeMission(m.getTypeMission())
                .devis(m.getDevis())
                .montantDevis(m.getMontantDevis())
                .facture(m.getFacture())
                .montantFacture(m.getMontantFacture())
                .photos(m.getPhotos())
                .avancementGarage(m.getAvancementGarage())
                .dateExpertisePrevue(m.getDateExpertisePrevue())
                .motifRefus(m.getMotifRefus())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt());

        if (m.getSinistre() != null) {
            b.sinistreId(m.getSinistre().getId())
             .sinistreReference(m.getSinistre().getReference())
             .sinistreImmatriculation(m.getSinistre().getVehicule() != null
                     ? m.getSinistre().getVehicule().getImmatriculation() : null);
        }
        if (m.getGarage()     != null) b.garageId(m.getGarage().getId())
                                        .garageNom(m.getGarage().getNom());
        if (m.getExpert()     != null) b.expertId(m.getExpert().getId())
                                        .expertNom(m.getExpert().getNom() + " " + m.getExpert().getPrenom());
        if (m.getRemorqueur() != null) b.remorqueurId(m.getRemorqueur().getId())
                                        .remorqueurNom(m.getRemorqueur().getNom() + " " + m.getRemorqueur().getPrenom());
        return b.build();
    }
}
