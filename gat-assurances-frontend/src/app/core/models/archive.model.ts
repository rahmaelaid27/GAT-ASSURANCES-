export interface Archive {
  id: number;
  tableSource: string;
  enregistrementId: number;
  donnees: string;
  dateArchivage: Date;
  archivePar: string;
  restaure: boolean;
}

