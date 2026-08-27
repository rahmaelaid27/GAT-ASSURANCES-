export interface Commentaire {
  id: number;
  contenu: string;
  userId: number;
  userNom: string;
  userPrenom: string;
  userRole: string;
  sinistreId: number;
  parentId?: number;
  pieceJointe?: string;
  typePieceJointe?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Commentaire[];
  reactions?: Reaction[];
}

export interface Reaction {
  id: number;
  type: string;
  userId: number;
  commentaireId: number;
}

export interface CommentaireRequest {
  contenu: string;
  parentId?: number;
  pieceJointe?: string;
}

