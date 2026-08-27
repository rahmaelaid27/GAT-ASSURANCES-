import { Injectable } from '@angular/core';
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ForumService } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';
import { Commentaire, CommentaireCreateRequest } from '../../../core/models/commentaire.model';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">

      <!-- En-tête -->
      <div class="flex items-center gap-3">
        <button (click)="history.back()"
                class="text-gray-400 hover:text-gray-600 transition">
          ← Retour
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Forum du dossier</h1>
          <p class="text-sm text-gray-500">Dossier #{{ sinistreId() }}</p>
        </div>
      </div>

      <!-- Zone de saisie nouveau message -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">Nouveau message</h2>
        <textarea
          [(ngModel)]="newMessage"
          rows="3"
          placeholder="Votre message..."
          class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 resize-none">
        </textarea>
        <div class="flex items-center justify-between mt-3">
          <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden"
                   (change)="onFileChange($event)" />
            <span class="text-blue-500 hover:underline">📎 Joindre un fichier</span>
            @if (attachedFile) {
              <span class="text-xs text-gray-600">{{ attachedFile }}</span>
            }
          </label>
          <button
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || sending"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                   px-5 py-2 rounded-lg text-sm font-medium transition">
            {{ sending ? 'Envoi…' : 'Envoyer' }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-4">
        @if (loading()) {
          <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        } @else if (messages().length === 0) {
          <div class="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p class="text-gray-400 text-sm">Aucun message dans ce forum pour l'instant.</p>
            <p class="text-gray-400 text-xs mt-1">Soyez le premier à publier un message.</p>
          </div>
        } @else {
          @for (msg of rootMessages(); track msg.id) {
            <!-- Message racine -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <!-- Header message -->
              <div class="flex items-start gap-3 mb-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {{ initial(msg.user?.nom ?? msg.user?.prenom ?? '') }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-gray-900 text-sm">
                      {{ (msg.user?.nom ?? 'Utilisateur') + ' ' + (msg.user?.prenom ?? '') }}
                    </span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {{ roleLabel(msg.user?.role ?? '') }}
                    </span>
                    <span class="text-xs text-gray-400 ml-auto">
                      {{ msg.createdAt | date:'dd/MM/yyyy à HH:mm' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Corps -->
              <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ msg.contenu }}</p>

              <!-- Pièce jointe -->
              @if (msg.pieceJointe) {
                <div class="mt-3">
                  <a [href]="msg.pieceJointe" target="_blank"
                     class="inline-flex items-center gap-1 text-blue-600 text-xs hover:underline">
                    📎 Pièce jointe
                  </a>
                </div>
              }

              <!-- Actions -->
              <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                <button (click)="startReply(msg)"
                        class="text-xs text-gray-500 hover:text-blue-600 transition">
                  ↩ Répondre
                </button>
                @if (isOwner(msg)) {
                  <button (click)="startEdit(msg)"
                          class="text-xs text-gray-500 hover:text-amber-600 transition">
                    ✏️ Modifier
                  </button>
                  <button (click)="deleteMsg(msg)"
                          class="text-xs text-gray-500 hover:text-red-500 transition">
                    🗑 Supprimer
                  </button>
                }
              </div>

              <!-- Formulaire réponse -->
              @if (replyingTo() === msg.id) {
                <div class="mt-4 bg-gray-50 rounded-lg p-3">
                  <textarea [(ngModel)]="replyContent" rows="2"
                            placeholder="Votre réponse..."
                            class="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none
                                   focus:ring-2 focus:ring-blue-400 resize-none">
                  </textarea>
                  <div class="flex gap-2 mt-2 justify-end">
                    <button (click)="cancelReply()"
                            class="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-200">
                      Annuler
                    </button>
                    <button (click)="sendReply(msg.id)"
                            [disabled]="!replyContent.trim()"
                            class="bg-blue-600 text-white text-xs px-3 py-1 rounded disabled:opacity-50 hover:bg-blue-700 transition">
                      Envoyer
                    </button>
                  </div>
                </div>
              }

              <!-- Réponses imbriquées -->
              @if (msg.reponses && msg.reponses.length > 0) {
                <div class="mt-4 ml-6 space-y-3 border-l-2 border-blue-100 pl-4">
                  @for (rep of msg.reponses; track rep.id) {
                    <div class="bg-blue-50 rounded-lg p-3">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500
                                    flex items-center justify-center text-white text-xs font-bold">
                          {{ initial(rep.user?.nom ?? rep.user?.prenom ?? '') }}
                        </div>
                        <span class="text-sm font-medium text-gray-800">{{ (rep.user?.nom ?? 'Utilisateur') + ' ' + (rep.user?.prenom ?? '') }}</span>
                        <span class="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {{ roleLabel(rep.user?.role ?? '') }}
                        </span>
                        <span class="text-xs text-gray-400 ml-auto">
                          {{ rep.createdAt | date:'dd/MM HH:mm' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ rep.contenu }}</p>
                      @if (isOwner(rep)) {
                        <div class="flex gap-3 mt-2">
                          <button (click)="deleteMsg(rep)"
                                  class="text-xs text-red-400 hover:text-red-600">🗑 Supprimer</button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Formulaire édition -->
              @if (editingId() === msg.id) {
                <div class="mt-4 bg-yellow-50 rounded-lg p-3">
                  <textarea [(ngModel)]="editContent" rows="3"
                            class="w-full border border-yellow-200 rounded-lg p-2 text-sm focus:outline-none
                                   focus:ring-2 focus:ring-yellow-400 resize-none">
                  </textarea>
                  <div class="flex gap-2 mt-2 justify-end">
                    <button (click)="cancelEdit()"
                            class="text-xs text-gray-500 px-3 py-1 rounded border border-gray-200">
                      Annuler
                    </button>
                    <button (click)="saveEdit(msg)"
                            class="bg-amber-500 text-white text-xs px-3 py-1 rounded hover:bg-amber-600 transition">
                      Enregistrer
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ForumComponent implements OnInit {
  history = window.history;

  sinistreId = signal<number>(0);
  messages   = signal<Commentaire[]>([]);
  loading    = signal(true);

  newMessage  = '';
  attachedFile: string | null = null;
  sending     = false;

  replyingTo  = signal<number | null>(null);
  replyContent = '';

  editingId   = signal<number | null>(null);
  editContent = '';

  rootMessages = computed(() =>
    this.messages().filter(m => !m.parentId)
  );

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const url = this.route.snapshot.url.join('/');

    // Si la route contient 'missions' ou 'expertises' → l'id est un missionId
    // On charge d'abord la mission pour récupérer le vrai sinistreId
    if (url.includes('missions') || url.includes('expertises')) {
      this.http.get<any>(`http://localhost:8081/api/missions/${id}`)
        .subscribe({
          next: (mission: any) => {
            this.sinistreId.set(mission.sinistreId);
            this.load();
          },
          error: () => {
            // Fallback : utiliser l'id directement
            this.sinistreId.set(id);
            this.load();
          }
        });
    } else {
      this.sinistreId.set(id);
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.forumService.findAll(this.sinistreId()).subscribe({
      next: msgs => { this.messages.set(msgs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.sending = true;
    const req: CommentaireCreateRequest = { contenu: this.newMessage.trim() };
    if (this.attachedFile) req.pieceJointe = this.attachedFile;
    this.forumService.create(this.sinistreId(), req).subscribe({
      next: () => {
        this.newMessage = '';
        this.attachedFile = null;
        this.sending = false;
        this.load();
      },
      error: () => { this.sending = false; }
    });
  }

  sendReply(parentId: number): void {
    if (!this.replyContent.trim()) return;
    const req: CommentaireCreateRequest = { contenu: this.replyContent.trim(), parentId };
    this.forumService.create(this.sinistreId(), req).subscribe(() => {
      this.cancelReply();
      this.load();
    });
  }

  saveEdit(msg: Commentaire): void {
    if (!this.editContent.trim()) return;
    const req: CommentaireCreateRequest = { contenu: this.editContent.trim() };
    this.forumService.update(this.sinistreId(), msg.id, req).subscribe(() => {
      this.cancelEdit();
      this.load();
    });
  }

  deleteMsg(msg: Commentaire): void {
    if (!confirm('Supprimer ce message ?')) return;
    this.forumService.delete(this.sinistreId(), msg.id).subscribe(() => this.load());
  }

  startReply(msg: Commentaire): void {
    this.replyingTo.set(msg.id);
    this.replyContent = '';
    this.editingId.set(null);
  }

  cancelReply(): void { this.replyingTo.set(null); this.replyContent = ''; }

  startEdit(msg: Commentaire): void {
    this.editingId.set(msg.id);
    this.editContent = msg.contenu;
    this.replyingTo.set(null);
  }

  cancelEdit(): void { this.editingId.set(null); this.editContent = ''; }

  isOwner(msg: Commentaire): boolean {
    return msg.user?.id === this.authService.currentUser()?.user?.id;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.attachedFile = input.files[0].name;
  }

  initial(nom: string): string { return nom ? nom.charAt(0).toUpperCase() : '?'; }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      CLIENT: 'Client', GESTIONNAIRE: 'Gestionnaire', GARAGE: 'Garage',
      EXPERT: 'Expert', REMORQUEUR: 'Remorqueur', MANAGER: 'Manager', ADMIN: 'Admin'
    };
    return map[role] ?? role;
  }
}
