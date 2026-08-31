import { Component, OnInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface Sinistre { id: number; reference: string; statut: string; vehiculeImmatriculation: string; }
interface Message {
  id: number;
  contenu: string;
  pieceJointe?: string;
  parentId?: number;
  reponses?: Message[];
  user?: { id?: number; nom?: string | null; prenom?: string | null; role?: string; };
  createdAt: string;
}

@Component({
  selector: 'app-client-forum',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="flex h-[calc(100vh-4rem)] animate-fade-in" style="background:#F8F7FB">

  <!-- Panneau gauche — liste des dossiers -->
  <div class="w-72 flex-shrink-0 bg-white border-r flex flex-col" style="border-color:#E8E2F0">

    <!-- Header -->
    <div class="px-4 py-4 border-b" style="border-color:#E8E2F0">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 rounded-full" style="background:linear-gradient(#6B2D8B,#E5162A)"></div>
        <h2 class="font-bold text-gray-900">Forum</h2>
      </div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" [(ngModel)]="search" placeholder="Rechercher..."
               class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#6B2D8B] transition-all"/>
      </div>
    </div>

    <!-- Liste sinistres -->
    <div class="flex-1 overflow-y-auto">
      @if (sinistres().length === 0) {
        <div class="flex flex-col items-center justify-center h-full text-center px-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
               style="background:rgba(107,45,139,0.08)">
            <svg class="w-7 h-7" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-600">Aucun dossier</p>
          <p class="text-xs text-gray-400 mt-1 mb-3">Déclarez un sinistre pour accéder au forum</p>
          <a routerLink="/client/sinistres/nouveau"
             class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
             style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">
            Déclarer un sinistre
          </a>
        </div>
      } @else {
        @for (s of filteredSinistres(); track s.id) {
          <div (click)="selectSinistre(s)"
               class="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b"
               [style.border-color]="'#F3F0F8'"
               [style.background]="selectedSinistre()?.id === s.id ? 'rgba(107,45,139,0.08)' : 'transparent'">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                 [style.background]="selectedSinistre()?.id === s.id ? 'linear-gradient(135deg,#6B2D8B,#E5162A)' : '#E8E2F0'"
                 [style.color]="selectedSinistre()?.id === s.id ? 'white' : '#9CA3AF'">
              {{ initialFrom(s.vehiculeImmatriculation) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate"
                 [style.color]="selectedSinistre()?.id === s.id ? '#6B2D8B' : '#1F2937'">
                {{ s.reference }}
              </p>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ s.vehiculeImmatriculation }}</p>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                  [style.background]="getStatutBg(s.statut)"
                  [style.color]="getStatutColor(s.statut)">
              {{ getStatutLabel(s.statut) }}
            </span>
          </div>
        }
      }
    </div>
  </div>

  <!-- Zone de conversation -->
  <div class="flex-1 flex flex-col min-w-0">

    @if (!selectedSinistre()) {
      <!-- Placeholder aucune conversation sélectionnée -->
      <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
             style="background:linear-gradient(135deg,rgba(107,45,139,0.12),rgba(229,22,42,0.08))">
          <svg class="w-10 h-10" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Forum GAT Assurances</h3>
        <p class="text-gray-500 text-sm max-w-xs">
          Sélectionnez un dossier à gauche pour communiquer avec votre garage et le gestionnaire.
        </p>
        <div class="mt-6 flex items-center gap-2 text-xs text-[#6B2D8B]">
          <span class="w-2 h-2 rounded-full bg-[#F5A623]"></span>
          Messagerie sécurisée GAT
        </div>
      </div>

    } @else {
      <!-- Header conversation -->
      <div class="flex items-center justify-between px-5 py-3.5 bg-white border-b"
           style="border-color:#E8E2F0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
               style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">
            {{ initialFrom(selectedSinistre()?.vehiculeImmatriculation) }}
          </div>
          <div>
            <p class="font-bold text-gray-900 text-sm">{{ selectedSinistre()!.reference }}</p>
            <p class="text-xs text-gray-500">{{ selectedSinistre()!.vehiculeImmatriculation }} —
              <span [style.color]="getStatutColor(selectedSinistre()!.statut)">
                {{ getStatutLabel(selectedSinistre()!.statut) }}
              </span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="loadMessages()" title="Actualiser"
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <span class="text-xs text-gray-400">{{ messages().length }} messages</span>
        </div>
      </div>

      <!-- Messages -->
      <div #messagesZone class="flex-1 overflow-y-auto px-5 py-4 space-y-3" style="background:#F8F7FB">

        @if (loadingMsgs()) {
          <div class="flex justify-center py-10">
            <div class="w-8 h-8 border-3 border-t-[#6B2D8B] border-[#E8E2F0] rounded-full animate-spin"></div>
          </div>
        } @else if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full py-16 text-center">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                 style="background:rgba(107,45,139,0.08)">
              <svg class="w-8 h-8" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p class="text-gray-600 font-semibold text-sm">Aucun message pour l'instant</p>
            <p class="text-gray-400 text-xs mt-1">Commencez la conversation avec votre garage</p>
          </div>
        } @else {
          @for (msg of messages(); track msg.id) {
            <!-- Bulle message -->
            <div class="flex gap-2.5 animate-slide-up"
                 [class.flex-row-reverse]="isMe(msg)">
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1"
                   [style.background]="getRoleColor(msg.user?.role ?? '')">
                {{ getInitiales(msg.user) }}
              </div>
              <!-- Bulle -->
              <div class="max-w-[70%] space-y-1" [class.items-end]="isMe(msg)">
                <!-- Nom + rôle (affiché seulement si pas moi) -->
                @if (!isMe(msg)) {
                  <div class="flex items-center gap-2 px-1">
                    <span class="text-xs font-semibold text-gray-700">{{ (msg.user?.prenom ?? 'Utilisateur') + ' ' + (msg.user?.nom ?? '') }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
                          [style.background]="getRoleColor(msg.user?.role ?? '')">
                      {{ getRoleLabel(msg.user?.role ?? '') }}
                    </span>
                  </div>
                }
                <!-- Contenu bulle -->
                <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                     [class.rounded-tr-sm]="isMe(msg)"
                     [class.rounded-tl-sm]="!isMe(msg)"
                     [style.background]="isMe(msg) ? 'linear-gradient(135deg,#6B2D8B,#E5162A)' : 'white'"
                     [style.color]="isMe(msg) ? 'white' : '#1F2937'"
                     [style.border]="isMe(msg) ? 'none' : '1px solid #E8E2F0'">
                  {{ msg.contenu }}
                  @if (msg.pieceJointe) {
                    <div class="mt-2 pt-2 flex items-center gap-2"
                         [style.border-top]="isMe(msg) ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E8E2F0'">
                      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      <a [href]="msg.pieceJointe" target="_blank"
                         class="text-xs underline hover:opacity-80">Pièce jointe</a>
                    </div>
                  }
                </div>
                <!-- Heure -->
                <p class="text-[10px] text-gray-400 px-1" [class.text-right]="isMe(msg)">
                  {{ msg.createdAt | date:'dd/MM HH:mm' }}
                </p>
                <!-- Répondre -->
                @if (!isMe(msg)) {
                  <button (click)="startReply(msg)"
                          class="text-[10px] text-gray-400 hover:text-[#6B2D8B] transition px-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                    </svg>
                    Répondre
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Barre de saisie -->
      <div class="bg-white border-t px-4 py-3" style="border-color:#E8E2F0">

        <!-- Répondre à -->
        @if (replyTo()) {
          <div class="flex items-center justify-between mb-2 px-3 py-2 rounded-xl text-xs"
               style="background:rgba(107,45,139,0.06); border-left:3px solid #6B2D8B">
            <span class="text-gray-600">
             ↩ Répondre à <strong style="color:#6B2D8B">{{ replyTo()?.user?.prenom ?? 'Utilisateur' }}</strong> :
              <em class="text-gray-500">"{{ replyTo()!.contenu | slice:0:40 }}{{ replyTo()!.contenu.length > 40 ? '...' : '' }}"</em>
            </span>
            <button (click)="replyTo.set(null)" class="text-gray-400 hover:text-red-500 ml-2 text-base font-bold">×</button>
          </div>
        }

        <!-- Pièce jointe sélectionnée -->
        @if (attachedFile()) {
          <div class="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs"
               style="background:rgba(229,22,42,0.06);border:1px solid rgba(229,22,42,0.15)">
            <svg class="w-3.5 h-3.5 shrink-0" style="color:#E5162A" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            <span class="truncate text-gray-600">{{ attachedFile() }}</span>
            <button (click)="attachedFile.set(null)" class="ml-auto text-gray-400 hover:text-red-500 font-bold">×</button>
          </div>
        }

        <div class="flex items-end gap-2">
          <!-- Pièce jointe -->
          <label class="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer text-[#6B2D8B]
                         hover:text-[#E5162A] hover:bg-[#F8F0FB] transition-all shrink-0">
            <input type="file" class="hidden" accept="image/*,.pdf,.doc,.docx" (change)="onFileSelect($event)"/>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
          </label>

          <!-- Textarea -->
          <textarea [(ngModel)]="newMsg" rows="1"
                    (keydown.enter)="onEnter($any($event))"
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    class="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm resize-none
                           focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10
                           bg-gray-50 focus:bg-white transition-all"
                    style="max-height:120px; min-height:40px"></textarea>

          <!-- Envoyer -->
            <button (click)="sendMsg()" [disabled]="(!newMsg.trim() && !attachedFile()) || sending()"
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all
                         disabled:opacity-40 hover:-translate-y-0.5 shrink-0"
              style="background:linear-gradient(135deg,#6B2D8B,#C4187A);box-shadow:0 3px 10px rgba(107,45,139,0.35)">
            @if (sending()) {
              <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            }
          </button>
        </div>
      </div>
    }
  </div>
</div>
  `
})
export class ClientForumComponent implements OnInit {
  @ViewChild('messagesZone') messagesZone!: ElementRef;

  private http      = inject(HttpClient);
  private auth      = inject(AuthService);
  private readonly API = 'http://localhost:8081/api';

  sinistres        = signal<Sinistre[]>([]);
  selectedSinistre = signal<Sinistre | null>(null);
  messages         = signal<Message[]>([]);
  loadingMsgs      = signal(false);
  sending          = signal(false);
  search           = '';
  newMsg           = '';
  replyTo          = signal<Message | null>(null);
  attachedFile     = signal<string | null>(null);

  filteredSinistres() {
    const q = this.search.toLowerCase();
    return q
      ? this.sinistres().filter(s => s.reference.toLowerCase().includes(q) || s.vehiculeImmatriculation.toLowerCase().includes(q))
      : this.sinistres();
  }

  ngOnInit(): void {
    this.http.get<Sinistre[]>(`${this.API}/sinistres/mes-sinistres`)
      .subscribe({ next: s => this.sinistres.set(s), error: () => {} });
  }

  selectSinistre(s: Sinistre): void {
    this.selectedSinistre.set(s);
    this.messages.set([]);
    this.replyTo.set(null);
    this.newMsg = '';
    this.loadMessages();
  }

  loadMessages(): void {
    const s = this.selectedSinistre();
    if (!s) return;
    this.loadingMsgs.set(true);
    this.http.get<Message[]>(`${this.API}/sinistres/${s.id}/commentaires`)
      .subscribe({
        next: m => {
          this.messages.set(m);
          this.loadingMsgs.set(false);
          setTimeout(() => this.scrollBottom(), 80);
        },
        error: () => this.loadingMsgs.set(false)
      });
  }

  sendMsg(): void {
    const text = this.newMsg.trim();
    if (!text && !this.attachedFile()) return;
    const s = this.selectedSinistre();
    if (!s) return;
    this.sending.set(true);
    const body: any = { contenu: text || '📎' };
    if (this.replyTo()) body.parentId = this.replyTo()!.id;
    if (this.attachedFile()) body.pieceJointe = this.attachedFile();

    this.http.post<Message>(`${this.API}/sinistres/${s.id}/commentaires`, body)
      .subscribe({
        next: () => {
          this.newMsg = '';
          this.replyTo.set(null);
          this.attachedFile.set(null);
          this.sending.set(false);
          this.loadMessages();
        },
        error: () => this.sending.set(false)
      });
  }

  onEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) { e.preventDefault(); this.sendMsg(); }
  }

  startReply(msg: Message): void { this.replyTo.set(msg); }

  onFileSelect(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.attachedFile.set(f.name);
  }

  isMe(msg: Message): boolean {
    return msg.user?.id === this.auth.getUserId();
  }

  getInitiales(user?: { prenom?: string | null; nom?: string | null }): string {
    const prenom = user?.prenom ?? '';
    const nom = user?.nom ?? '';
    const first = (prenom || nom || '?').charAt(0).toUpperCase();
    return first || '?';
  }

  initialFrom(value?: string | null): string {
    return (value ?? '').charAt(0) || '?';
  }

  getRoleColor(role: string): string {
    const m: Record<string,string> = {
      CLIENT:'#6B2D8B', GARAGE:'#16a34a', GESTIONNAIRE:'#E5162A',
      EXPERT:'#F5A623', REMORQUEUR:'#0ea5e9', ADMIN:'#C4187A', MANAGER:'#6b7280'
    };
    return m[role] ?? '#6B2D8B';
  }

  getRoleLabel(role: string): string {
    const m: Record<string,string> = {
      CLIENT:'Client', GARAGE:'Garage', GESTIONNAIRE:'Gestionnaire',
      EXPERT:'Expert', REMORQUEUR:'Remorqueur', ADMIN:'Admin', MANAGER:'Manager'
    };
    return m[role] ?? role;
  }

  getStatutLabel(s: string): string {
    const m: Record<string,string> = {
      DECLARE:'Déclaré', EN_INSTRUCTION:'En instruction', INCOMPLET:'Incomplet',
      GARAGE_AFFECTE:'Garage affecté', EXPERT_AFFECTE:'Expert affecté',
      EN_REPARATION:'En réparation', EN_EXPERTISE:'En expertise',
      EN_ATTENTE_VALIDATION:'En validation', APPROUVE:'Approuvé',
      CLOTURE:'Clôturé', REFUSE:'Refusé', REMORQUAGE_EN_COURS:'Remorquage'
    };
    return m[s] ?? s;
  }

  getStatutBg(s: string): string {
    const m: Record<string,string> = {
      DECLARE:'rgba(59,130,246,0.1)', EN_INSTRUCTION:'rgba(245,166,35,0.1)',
      INCOMPLET:'rgba(229,22,42,0.1)', GARAGE_AFFECTE:'rgba(107,45,139,0.1)',
      EXPERT_AFFECTE:'rgba(107,45,139,0.1)', EN_REPARATION:'rgba(245,166,35,0.1)',
      EN_EXPERTISE:'rgba(107,45,139,0.1)', APPROUVE:'rgba(34,197,94,0.1)',
      CLOTURE:'rgba(107,114,128,0.1)', REFUSE:'rgba(229,22,42,0.1)'
    };
    return m[s] ?? 'rgba(107,45,139,0.1)';
  }

  getStatutColor(s: string): string {
    const m: Record<string,string> = {
      DECLARE:'#3b82f6', EN_INSTRUCTION:'#D4891A', INCOMPLET:'#E5162A',
      GARAGE_AFFECTE:'#6B2D8B', EXPERT_AFFECTE:'#6B2D8B',
      EN_REPARATION:'#D4891A', EN_EXPERTISE:'#6B2D8B',
      APPROUVE:'#16a34a', CLOTURE:'#6b7280', REFUSE:'#E5162A'
    };
    return m[s] ?? '#6B2D8B';
  }

  private scrollBottom(): void {
    try {
      const el = this.messagesZone?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
