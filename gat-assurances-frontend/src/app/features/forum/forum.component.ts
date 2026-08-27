import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgIf, NgForOf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { Commentaire } from '@core/models/forum.model';
import { AuthResponse } from '@core/models/user.model';
import { MessageCardComponent } from './message-card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, DatePipe, MessageCardComponent, NgIf, NgForOf],
  template: `
    <div class="h-full flex flex-col bg-gray-50">
      <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <a [routerLink]="sinistreId ? ['/sinistres', sinistreId] : ['/dashboard']"
           class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-gray-900">Forum - Sinistre #{{ sinistreId }}</h1>
          <p class="text-xs text-gray-500">{{ commentaires.length }} messages</p>
        </div>
        <button (click)="refreshComments()" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      <ng-container *ngIf="!sinistreId">
        <div class="flex-1 flex items-center justify-center p-8 text-center">
          <p class="text-gray-500">Sélectionnez un sinistre pour accéder à son forum.</p>
        </div>
      </ng-container>

      <ng-container *ngIf="sinistreId">
        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4" #messagesContainer>
          <ng-container *ngIf="loading">
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-[#5E2B8A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </ng-container>
          <ng-container *ngIf="!loading && commentaires.length === 0">
            <div class="text-center py-16">
              <p class="text-gray-500">Aucun message pour le moment.</p>
            </div>
          </ng-container>
          <ng-container *ngIf="!loading && commentaires.length > 0">
            <ng-container *ngFor="let c of commentaires">
              <ng-container *ngIf="!c.parentId">
                <app-message-card [comment]="c" [currentUser]="userAsUser"
                  (reply)="startReply(c)"
                  (edit)="startEdit(c)"
                  (delete)="deleteCommentaire(c.id)">
                </app-message-card>
              </ng-container>
            </ng-container>
          </ng-container>
        </div>

        <div class="bg-white border-t border-gray-200 px-4 py-3">
          <ng-container *ngIf="editingComment">
            <div class="flex items-center justify-between mb-2 px-2">
              <span class="text-sm text-[#5E2B8A] font-medium">✏ Modification</span>
              <button (click)="cancelEdit()" class="text-sm text-gray-500">Annuler</button>
            </div>
          </ng-container>
          <ng-container *ngIf="replyTo">
            <div class="flex items-center justify-between mb-2 px-2 py-1 bg-gray-50 rounded-lg">
              <span class="text-sm text-gray-600">↩ Répondre à <strong>{{ replyTo.userPrenom }}</strong></span>
              <button (click)="cancelReply()" class="text-sm text-gray-500">Annuler</button>
            </div>
          </ng-container>
          <div class="flex items-end gap-3">
            <textarea [(ngModel)]="messageText"
              (keydown.enter)="onMessageKeydown($event)"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                     focus:border-[#5E2B8A] focus:ring-2 focus:ring-[#5E2B8A]/20 bg-gray-50"
              rows="2" placeholder="Écrivez votre message..."></textarea>
            <button (click)="sendMessage()"
              [disabled]="!messageText.trim() && !selectedFile"
              class="px-5 py-3 bg-gradient-to-r from-[#5E2B8A] to-[#C2173F] text-white
                     rounded-xl font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all">
              Envoyer
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ForumComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  sinistreId: number | null = null;
  commentaires: Commentaire[] = [];
  currentUser: AuthResponse | null = null;
  loading = false;
  replyTo: Commentaire | null = null;
  editingComment: Commentaire | null = null;
  selectedFile: File | null = null;
  messageText = '';

  /** Cast pour MessageCardComponent qui attend User */
  get userAsUser(): any { return this.currentUser; }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sinistreId');
    if (id) {
      this.sinistreId = +id;
      this.loadCommentaires();
    }
  }

  loadCommentaires(): void {
    if (!this.sinistreId) return;
    this.loading = true;
    this.api.get<Commentaire[]>(`sinistres/${this.sinistreId}/commentaires`).subscribe({
      next: (data) => {
        this.commentaires = data;
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => { this.commentaires = []; this.loading = false; }
    });
  }

  refreshComments(): void { this.loadCommentaires(); }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onMessageKeydown(event: any): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) { event.preventDefault(); this.sendMessage(); }
  }

  sendMessage(): void {
    const text = this.messageText?.trim();
    if (!text && !this.selectedFile) return;
    if (!this.sinistreId) return;
    if (this.editingComment) {
      this.api.put(`sinistres/${this.sinistreId}/commentaires`, this.editingComment.id, { contenu: text }).subscribe({
        next: () => { this.editingComment = null; this.messageText = ''; this.loadCommentaires(); }
      });
      return;
    }
    const payload: any = { contenu: text };
    if (this.replyTo) payload.parentId = this.replyTo.id;
    this.sendComment(payload);
  }

  private sendComment(payload: any): void {
    if (!this.sinistreId) return;
    this.api.post(`sinistres/${this.sinistreId}/commentaires`, payload).subscribe({
      next: () => { this.messageText = ''; this.selectedFile = null; this.replyTo = null; this.loadCommentaires(); }
    });
  }

  startReply(comment: Commentaire): void {
    this.replyTo = comment;
    this.editingComment = null;
    this.messageText = '@' + comment.userPrenom + ' ';
  }

  cancelReply(): void { this.replyTo = null; this.messageText = ''; }

  startEdit(comment: Commentaire): void {
    this.editingComment = comment;
    this.replyTo = null;
    this.messageText = comment.contenu;
  }

  cancelEdit(): void { this.editingComment = null; this.messageText = ''; }

  deleteCommentaire(id: number): void {
    Swal.fire({
      title: 'Supprimer le message ?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#C2173F',
      cancelButtonText: 'Annuler', confirmButtonText: 'Supprimer'
    }).then(result => {
      if (result.isConfirmed && this.sinistreId) {
        this.api.delete(`sinistres/${this.sinistreId}/commentaires`, id).subscribe({ next: () => this.loadCommentaires() });
      }
    });
  }

canEdit(comment: Commentaire): boolean { return (this.currentUser as any)?.id === comment.userId; }
  canDelete(comment: Commentaire): boolean {
    return (this.currentUser as any)?.id === comment.userId || (this.currentUser as any)?.role === 'ADMIN';
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
