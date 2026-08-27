import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe, NgIf, NgForOf } from '@angular/common';
import { Commentaire } from '@core/models/forum.model';

@Component({
  selector: 'app-message-card',
  standalone: true,
  imports: [DatePipe, NgIf, NgForOf],
  template: `
    <div class="flex gap-3 group">
      <div class="flex-shrink-0">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
             [class]="getRoleColor(comment.userRole || '')">
          {{ getInitials(comment.userPrenom || '', comment.userNom || '') }}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="bg-white rounded-2xl shadow-card border border-gat-gray-border p-4">
          <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-sm text-gray-900">
                {{ comment.userPrenom }} {{ comment.userNom }}
              </span>
              <span class="badge text-white text-[10px]" [class]="getRoleColor(comment.userRole || '')">
                {{ getRoleLabel(comment.userRole || '') }}
              </span>
              <span class="text-xs text-gray-400">{{ comment.createdAt | date:'dd/MM HH:mm' }}</span>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="onReply()" title="Répondre"
                      class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-gat-violet transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
              </button>
              <ng-container *ngIf="canEdit()">
                <button (click)="onEdit()" title="Modifier"
                        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </ng-container>
              <ng-container *ngIf="canDelete()">
                <button (click)="onDelete()" title="Supprimer"
                        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-accent-500 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </ng-container>
            </div>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{{ comment.contenu }}</p>
          <ng-container *ngIf="comment.pieceJointe">
            <div class="mt-3 flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span class="text-base">📎</span>
              <a [href]="comment.pieceJointe" target="_blank"
                 class="text-sm text-gat-violet hover:text-gat-red hover:underline font-medium transition-colors">
                Voir la pièce jointe
              </a>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class MessageCardComponent {
  @Input() comment!: Commentaire;
  @Input() currentUser: any = null;
  @Output() reply  = new EventEmitter<void>();
  @Output() edit   = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() react  = new EventEmitter<string>();

  roleColors: Record<string, string> = {
    CLIENT: 'bg-blue-500', GESTIONNAIRE: 'bg-gat-violet',
    EXPERT: 'bg-gat-gold', GARAGE: 'bg-green-500',
    REMORQUEUR: 'bg-gat-red', ADMIN: 'bg-gat-magenta', MANAGER: 'bg-gray-500'
  };

  roleLabels: Record<string, string> = {
    CLIENT: 'Client', GESTIONNAIRE: 'Gestionnaire', EXPERT: 'Expert',
    GARAGE: 'Garage', REMORQUEUR: 'Remorqueur', ADMIN: 'Admin', MANAGER: 'Manager'
  };

  getInitials(nom: string, prenom: string): string {
    return ((prenom[0] ?? '') + (nom[0] ?? '')).toUpperCase();
  }
  getRoleColor(role: string): string  { return this.roleColors[role]  || 'bg-gray-500'; }
  getRoleLabel(role: string): string  { return this.roleLabels[role]  || role; }

  canEdit(): boolean   { return (this.currentUser as any)?.id === this.comment.userId; }
  canDelete(): boolean { return this.canEdit() || (this.currentUser as any)?.role === 'ADMIN'; }

  onReply(): void  { this.reply.emit(); }
  onEdit(): void   { this.edit.emit(); }
  onDelete(): void { this.delete.emit(); }
  onReact(e: string): void { this.react.emit(e); }
}
