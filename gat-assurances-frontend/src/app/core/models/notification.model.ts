export type TypeNotification = 'INFO' | 'ALERTE' | 'SUCCES' | 'ERREUR';

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: TypeNotification;
  sinistreId?: number;
  lu: boolean;
  createdAt: string;
}

export const NOTIF_ICON: Record<TypeNotification, string> = {
  INFO: 'ℹ️',
  ALERTE: '⚠️',
  SUCCES: '✅',
  ERREUR: '❌',
};

export const NOTIF_COLOR: Record<TypeNotification, string> = {
  INFO: 'bg-blue-50 border-blue-200',
  ALERTE: 'bg-yellow-50 border-yellow-200',
  SUCCES: 'bg-green-50 border-green-200',
  ERREUR: 'bg-red-50 border-red-200',
};
