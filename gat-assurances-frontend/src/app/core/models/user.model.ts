export type Role =
  | 'ADMIN' | 'MANAGER' | 'GESTIONNAIRE'
  | 'CLIENT' | 'GARAGE' | 'EXPERT' | 'REMORQUEUR';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  cin?: string;
  telephone?: string;
  role: Role;
  photoProfil?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthRequest  { email: string; password: string; }

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  // Aliases à plat pour compatibilité composants existants
  readonly token?:   string;
  readonly userId?:  number;
  readonly nom?:     string;
  readonly prenom?:  string;
  readonly email?:   string;
  readonly role?:    Role;
}

export interface RegisterRequest {
  nom: string; prenom: string;
  email: string; password: string;
  cin?: string; telephone?: string;
  role?: Role;
}
