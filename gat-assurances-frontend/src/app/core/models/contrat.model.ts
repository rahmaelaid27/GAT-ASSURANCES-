export interface Contrat {
  id: number;
  numeroContrat: string;
  vehiculeId: number;
  vehiculeImmatriculation: string;
  clientId: number;
  clientNom: string;
  typeCouverture: string;
  dateDebut: string;
  dateFin: string;
  primeAnnuelle?: number;
  actif: boolean;
  createdAt?: string;
}
