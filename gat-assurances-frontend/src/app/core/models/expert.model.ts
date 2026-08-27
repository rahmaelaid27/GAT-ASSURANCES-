export interface Expert {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  specialite?: string;
  note?: number;
  disponibilite: boolean;
  missionsActives?: number;
  capaciteMax?: number;
  latitude?: number;
  longitude?: number;
  zoneIntervention?: string;
  createdAt?: string;
}
