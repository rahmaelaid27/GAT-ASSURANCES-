export type StatutRemorquage =
  | 'EN_ATTENTE'
  | 'ACCEPTE'
  | 'EN_ROUTE'
  | 'ARRIVE_SUR_PLACE'
  | 'VEHICULE_CHARGE'
  | 'EN_TRANSIT'
  | 'LIVRE'
  | 'ANNULE';

export interface Remorqueur {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  disponibilite: boolean;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  rayonIntervention?: number;
  capacite: number;
}

export interface DemandeRemorquage {
  id: number;
  sinistreId: number;
  sinistreReference: string;
  remorqueurId?: number;
  remorqueurNom?: string;
  localisationDepart: string;
  coordonneesDepart?: string;
  localisationDestination: string;
  coordonneesDestination?: string;
  statut: StatutRemorquage;
  photosIntervention?: string;
  dateAcceptation?: string;
  dateArrivee?: string;
  dateLivraison?: string;
  notes?: string;
  createdAt: string;
}
