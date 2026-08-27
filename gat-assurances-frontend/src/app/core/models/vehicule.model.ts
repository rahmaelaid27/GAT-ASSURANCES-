export interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  typeVehicule: TypeVehicule;
  clientId: number;
  clientNom: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TypeVehicule {
  VOITURE_PARTICULIERE = 'VOITURE_PARTICULIERE',
  VEHICULE_UTILITAIRE  = 'VEHICULE_UTILITAIRE',
  MOTO                 = 'MOTO',
  CAMION               = 'CAMION',
  BUS                  = 'BUS',
  AUTRE                = 'AUTRE',
  // Aliases pré-existants (compatibilité)
  VOITURE              = 'VOITURE_PARTICULIERE',
  UTILITAIRE           = 'VEHICULE_UTILITAIRE'
}

export interface VehiculeRequest {
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  typeVehicule: TypeVehicule;
  clientId: number;
}
