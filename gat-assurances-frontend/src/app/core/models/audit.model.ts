export interface AuditLog {
  id: number;
  userId: number;
  userNom: string;
  userRole: string;
  action: string;
  description: string;
  tableConcernee: string;
  enregistrementId: number;
  ancienneValeur: string;
  nouvelleValeur: string;
  adresseIp: string;
  navigateur: string;
  date: Date;
  resultat: string;
}

