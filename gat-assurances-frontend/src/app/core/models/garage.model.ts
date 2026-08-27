export type StatutGarage = 'ACTIF' | 'INACTIF' | 'SUSPENDU';

export interface Garage {
  id: number;
  nom: string;
  adresse: string;
  ville?: string;
  telephone: string;
  email?: string;
  specialites?: string;
  statut: StatutGarage;
  note: number;
  capaciteMax: number;
  capaciteActuelle: number;
  conventionGat: boolean;
  delaiMoyenJours?: number;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface GarageRecommandation extends Garage {
  distanceKm: number;
  score: number;
  slotsDisponibles: number;
  scoreDistance: number;
  scoreDisponibilite: number;
  scoreNote: number;
  scoreDelai: number;
  scoreConvention: number;
  scoreSpecialite: number;
  scorePerformance: number;
}
