export type StatutMission =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE'
  | 'EN_DIAGNOSTIC'
  | 'EN_COMMANDE_PIECES'
  | 'EN_COURS'
  | 'REPARATION_TERMINEE'
  | 'RAPPORT_DEPOSE'
  | 'FACTURE_DEPOSEE'
  | 'TERMINEE'
  | 'ANNULEE';

export type TypeMission = 'REMORQUAGE' | 'EXPERTISE' | 'REPARATION' | 'AUTRE';

export interface Mission {
  id: number;
  statut: StatutMission;
  typeMission: TypeMission;
  description: string;
  sinistreId: number;
  sinistreReference: string;
  garageId?: number;
  garageNom?: string;
  expertId?: number;
  expertNom?: string;
  devis?: string;
  montantDevis?: number;
  facture?: string;
  montantFacture?: number;
  photos?: string;
  avancementGarage?: string;
  dateExpertisePrevue?: string;
  motifRefus?: string;
  createdAt: string;
  updatedAt: string;
}
