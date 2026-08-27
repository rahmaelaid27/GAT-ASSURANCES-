export interface Evaluation {
  id: number;
  note: number;
  commentaire: string;
  typeEvaluation: TypeEvaluation;
  evaluateurId: number;
  evaluateurNom: string;
  sinistreId: number;
  createdAt: Date;
}

export enum TypeEvaluation {
  GARAGE = 'GARAGE',
  EXPERT = 'EXPERT'
}

export interface EvaluationRequest {
  note: number;
  commentaire: string;
  typeEvaluation: TypeEvaluation;
  sinistreId: number;
  cibleId: number;
}

