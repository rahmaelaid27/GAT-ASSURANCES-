package com.gat.assurances.entity.enums;

/**
 * Cycle de vie complet d'un dossier sinistre GAT Assurances.
 *
 *  DECLARE → EN_INSTRUCTION → INCOMPLET → GARAGE_AFFECTE
 *         → EXPERT_AFFECTE → REMORQUAGE_EN_COURS (optionnel)
 *         → EN_EXPERTISE → EN_REPARATION
 *         → EN_ATTENTE_VALIDATION → APPROUVE → CLOTURE
 *                                 → REFUSE
 */
public enum StatutSinistre {
    DECLARE,
    EN_INSTRUCTION,
    INCOMPLET,
    GARAGE_AFFECTE,
    EXPERT_AFFECTE,
    REMORQUAGE_EN_COURS,
    EN_EXPERTISE,
    EN_REPARATION,
    EN_ATTENTE_VALIDATION,
    APPROUVE,
    CLOTURE,
    REFUSE,
    EN_COURS,
    ACCEPTE,
    REMBOURSE
}
