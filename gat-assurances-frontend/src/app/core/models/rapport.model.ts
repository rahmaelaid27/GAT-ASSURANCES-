export interface Rapport {
  id: number;
  description: string;
  dateDepot: Date;
  statut: StatutRapport;
  missionId: number;
  missionDescription: string;
  expertId: number;
  expertNom: string;
  fichiers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum StatutRapport {
  DEPOSE = 'DEPOSE',
  EN_REVISION = 'EN_REVISION',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export interface RapportRequest {
  description: string;
  missionId: number;
}

