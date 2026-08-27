package com.gat.assurances.entity.enums;

/**
 * Cycle de vie d'une mission.
 *
 * ─── FLUX EXPERTISE ──────────────────────────────────────────────────────
 *  EN_ATTENTE → PLANIFIEE → EN_DIAGNOSTIC → RAPPORT_EXPERT_DEPOSE
 *             → RAPPORT_EXPERT_VALIDE (par gestionnaire)
 *             → RAPPORT_EXPERT_INCOMPLET (gestionnaire demande correction)
 *
 * ─── FLUX DEVIS / RÉPARATION ─────────────────────────────────────────────
 *  EN_ATTENTE → EN_REPARATION → DEVIS_DEPOSE (garage)
 *             → DEVIS_EN_VERIFICATION_EXPERT
 *             → DEVIS_COMPLEMENT_DEMANDE (expert → garage)
 *             → DEVIS_VALIDE_EXPERT (expert → gestionnaire)
 *             → DEVIS_VALIDE_FINAL (gestionnaire accepte)
 *             → DEVIS_REFUSE (gestionnaire refuse → retour garage)
 *             → REPARATION_EN_COURS
 *             → REPARATION_TERMINEE
 *             → FACTURE_DEPOSEE
 *             → TERMINEE
 */
public enum StatutMission {

    // ─── États communs ────────────────────────────────────────────────────
    EN_ATTENTE,
    ACCEPTEE,
    REFUSEE,
    ANNULEE,
    TERMINEE,

    // ─── Flux Expertise ───────────────────────────────────────────────────
    /** Expert a planifié la date d'inspection */
    PLANIFIEE,
    /** Expert est en cours d'inspection du véhicule */
    EN_DIAGNOSTIC,
    /** Expert a déposé son rapport – en attente validation gestionnaire */
    RAPPORT_EXPERT_DEPOSE,
    /** Gestionnaire demande correction du rapport à l'expert */
    RAPPORT_EXPERT_INCOMPLET,
    /** Gestionnaire a validé le rapport – client notifié */
    RAPPORT_EXPERT_VALIDE,

    // ─── Flux Devis ───────────────────────────────────────────────────────
    /** Garage a commencé la réparation */
    EN_REPARATION,
    /** Garage a déposé un devis – en attente vérification expert */
    DEVIS_DEPOSE,
    /** Expert est en train de vérifier le devis */
    DEVIS_EN_VERIFICATION_EXPERT,
    /** Expert demande un complément au garage */
    DEVIS_COMPLEMENT_DEMANDE,
    /** Expert a validé techniquement le devis – envoyé au gestionnaire */
    DEVIS_VALIDE_EXPERT,
    /** Gestionnaire a validé le devis – garage peut continuer */
    DEVIS_VALIDE_FINAL,
    /** Gestionnaire a refusé le devis – retour garage/expert */
    DEVIS_REFUSE,

    // ─── Fin de mission ───────────────────────────────────────────────────
    /** Réparation terminée */
    REPARATION_TERMINEE,
    /** Facture déposée par le garage */
    FACTURE_DEPOSEE,

    // ─── Anciens états gardés pour compatibilité ─────────────────────────
    EN_COMMANDE_PIECES,
    EN_COURS,
    RAPPORT_DEPOSE
}
