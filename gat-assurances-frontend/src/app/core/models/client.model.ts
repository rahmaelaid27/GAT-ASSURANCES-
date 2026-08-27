import { User } from './user.model';
import { Vehicule } from './vehicule.model';
import { Sinistre } from './sinistre.model';

export interface Client {
  id: number;
  user: User;
  adresse: string;
  ville: string;
  codePostal: string;
  dateNaissance: Date;
  numeroPolice: string;
  vehicules: Vehicule[];
  sinistres: Sinistre[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  dateNaissance: Date;
  numeroPolice: string;
}

