import { Sinistre } from './sinistre.model';
import { Mission } from './mission.model';

export interface DashboardClient {
  totalDossiers: number;
  dossiersEnCours: number;
  dossiersClotures: number;
  totalVehicules: number;
  notificationsNonLues: number;
  sinistresEnCours: Sinistre[];
  sinistresRecents: Sinistre[];
}

export interface DashboardGestionnaire {
  dossiersActifs: number;
  dossiersAValider: number;
  dossiersUrgents: number;
  tauxResolution: number;
  notificationsNonLues: number;
  dossiersPrioritaires: Sinistre[];
  dossiersRecents: Sinistre[];
}

export interface DashboardGarage {
  missionsActives: number;
  missionsEnCours: number;
  devisEnAttente: number;
  noteMoyenne: number;
  notificationsNonLues: number;
  missionsActives_list: Mission[];
  missionsAujourdhui: Mission[];
}

export interface DashboardExpert {
  totalExpertisesMois: number;
  aPlanifier: number;
  rapportsDeposes: number;
  noteMoyenne: number;
  notificationsNonLues: number;
  missionsRecentes: Mission[];
}

export interface DashboardRemorqueur {
  missionsCeMois: number;
  missionsTotal: number;
  missionsTerminees: number;
  demandesDisponibles: number;
  missionsEnCours: number;
  disponible: boolean;
  notificationsNonLues: number;
}

export interface DashboardManager {
  totalSinistres: number;
  sinistresEnCours: number;
  sinistresClotures: number;
  sinistresRefuses: number;
  tauxResolutionGlobal: number;
  totalGarages: number;
  totalExperts: number;
  totalClients: number;
  delaiMoyenTraitement: number;
  satisfactionMoyenne: number;
}

export interface DashboardAdmin {
  totalUtilisateurs: number;
  totalClients: number;
  totalGarages: number;
  totalExperts: number;
  totalRemorqueurs: number;
  totalSinistres: number;
}
