export type StatutSinistre =
  | 'DECLARE'
  | 'EN_INSTRUCTION'
  | 'INCOMPLET'
  | 'GARAGE_AFFECTE'
  | 'EXPERT_AFFECTE'
  | 'REMORQUAGE_EN_COURS'
  | 'EN_EXPERTISE'
  | 'EN_REPARATION'
  | 'EN_ATTENTE_VALIDATION'
  | 'APPROUVE'
  | 'CLOTURE'
  | 'REFUSE';

export type TypeSinistre =
  | 'COLLISION'
  | 'INCENDIE'
  | 'VOL'
  | 'BRIS_GLACE'
  | 'VANDALISME'
  | 'CATASTROPHE_NATURELLE'
  | 'ACCIDENT_TIERS'
  | 'AUTRE';

export interface Sinistre {
  id: number;
  reference: string;
  statut: StatutSinistre;
  typeSinistre: TypeSinistre;
  description: string;
  dateSinistre: string;
  /** Alias utilisé par les composants pré-existants */
  dateDeclaration?: string;
  gouvernorat: string;
  localite: string;
  /** Alias utilisé par suivi-sinistre */
  lieu?: string;
  coordonneesGps?: string;
  photos?: string;
  documents?: string;
  motifRejet?: string;
  clientId: number;
  clientNom: string;
  vehiculeId: number;
  vehiculeImmatriculation: string;
  /** Alias utilisé par les composants pré-existants */
  immatriculation?: string;
  garageId?: number;
  garageNom?: string;
  expertId?: number;
  expertNom?: string;
  gestionnaireId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SinistreCreateRequest {
  vehiculeImmatriculation: string;
  dateSinistre: string;
  gouvernorat: string;
  localite: string;
  coordonneesGps?: string;
  typeSinistre: TypeSinistre;
  description: string;
  photos?: string;
  documents?: string;
}

export const STATUT_LABELS: Record<StatutSinistre, string> = {
  DECLARE: 'Déclaré',
  EN_INSTRUCTION: 'En instruction',
  INCOMPLET: 'Incomplet',
  GARAGE_AFFECTE: 'Garage affecté',
  EXPERT_AFFECTE: 'Expert affecté',
  REMORQUAGE_EN_COURS: 'Remorquage en cours',
  EN_EXPERTISE: 'En expertise',
  EN_REPARATION: 'En réparation',
  EN_ATTENTE_VALIDATION: 'En attente de validation',
  APPROUVE: 'Approuvé',
  CLOTURE: 'Clôturé',
  REFUSE: 'Refusé',
};

export const STATUT_COLORS: Record<StatutSinistre, string> = {
  DECLARE: 'bg-blue-100 text-blue-800',
  EN_INSTRUCTION: 'bg-yellow-100 text-yellow-800',
  INCOMPLET: 'bg-red-100 text-red-800',
  GARAGE_AFFECTE: 'bg-purple-100 text-purple-800',
  EXPERT_AFFECTE: 'bg-indigo-100 text-indigo-800',
  REMORQUAGE_EN_COURS: 'bg-orange-100 text-orange-800',
  EN_EXPERTISE: 'bg-cyan-100 text-cyan-800',
  EN_REPARATION: 'bg-teal-100 text-teal-800',
  EN_ATTENTE_VALIDATION: 'bg-amber-100 text-amber-800',
  APPROUVE: 'bg-green-100 text-green-800',
  CLOTURE: 'bg-gray-100 text-gray-800',
  REFUSE: 'bg-red-200 text-red-900',
};
