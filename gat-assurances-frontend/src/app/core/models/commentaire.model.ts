export interface Commentaire {
  id: number;
  sinistreId: number;
  contenu: string;
  pieceJointe?: string;
  parentId?: number;
  reponses?: Commentaire[];
  user?: {
    id?: number;
    nom?: string | null;
    prenom?: string | null;
    role?: string;
    photoProfil?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CommentaireCreateRequest {
  contenu: string;
  pieceJointe?: string;
  parentId?: number;
}
