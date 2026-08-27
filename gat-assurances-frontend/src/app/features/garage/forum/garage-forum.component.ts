import { Component, OnInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface SinistreMission {
  id: number;
  reference: string;
  statut: string;
  clientNom: string | null;
  clientPrenom: string | null;
  vehiculeImmatriculation: string | null;
}

interface Message {
  id: number;
  contenu: string;
  pieceJointe?: string;
  parentId?: number;
  user?: { id?: number; nom?: string | null; prenom?: string | null; role?: string; };
  createdAt: string;
}

@Component({
  selector: 'app-garage-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="flex h-[calc(100vh-4rem)] animate-fade-in" style="background:#F8F7FB">

  <!-- Panneau gauche — liste des dossiers affectés au garage -->
  <div class="w-72 flex-shrink-0 bg-white border-r flex flex-col" style="border-color:#E8E2F0">

    <div class="px-4 py-4 border-b" style="border-color:#E8E2F0">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 rounded-full" style="background:linear-gradient(#F5A623,#6B2D8B)"></div>
        <h2 class="font-bold text-gray-900">Forum — Clients</h2>
      </div>
      <input type="text" [(ngModel)]="search" placeholder="Rechercher dossier..."
             class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#F5A623] transition-all"/>
    </div>

    <div class="flex-1 overflow-y-auto">
      @if (loading()) {
        <div class="flex justify-center py-10">
          <div class="w-7 h-7 border-2 border-t-[#F5A623] border-[#E8E2F0] rounded-full animate-spin"></div>
        </div>
      } @else if (dossiers().length === 0) {
        <div class="flex flex-col items-center justify-center h-full text-center px-4 py-10">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
               style="background:rgba(245,166,35,0.08)">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-600">Aucun dossier affecté</p>
          <p class="text-xs text-gray-400 mt-1">Les conversations apparaîtront ici dès qu'un sinistre vous sera affecté.</p>
        </div>
      } @else {
        @for (d of filteredDossiers(); track d.id) {
          <div (click)="selectDossier(d)"
               class="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b"
               [style.border-color]="'#F3F0F8'"
               [style.background]="selected()?.id === d.id ? 'rgba(245,166,35,0.08)' : 'transparent'">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                 [style.background]="selected()?.id === d.id ? 'linear-gradient(135deg,#F5A623,#6B2D8B)' : '#E8E2F0'"
                 [style.color]="selected()?.id === d.id ? 'white' : '#9CA3AF'">
              {{ getInitiales(d.clientPrenom, d.clientNom) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate"
                 [style.color]="selected()?.id === d.id ? '#D4891A' : '#1F2937'">
                {{ d.reference }}
              </p>
              <p class="text-xs text-gray-400 truncate mt-0.5">
                {{ d.clientPrenom }} {{ d.clientNom }} · {{ d.vehiculeImmatriculation }}
              </p>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 bg-amber-50 text-amber-700">
              {{ getStatutLabel(d.statut) }}
            </span>
          </div>
        }
      }
    </div>
  </div>

  <!-- Zone conversation -->
  <div class="flex-1 flex flex-col min-w-0">

    @if (!selected()) {
      <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
             style="background:linear-gradient(135deg,rgba(245,166,35,0.12),rgba(107,45,139,0.08))">
          <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Forum Garage</h3>
        <p class="text-gray-500 text-sm max-w-xs">
          Sélectionnez un dossier pour communiquer avec le client directement.
        </p>
        <div class="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          Messagerie sécurisée GAT
        </div>
      </div>

    } @else {
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3.5 bg-white border-b" style="border-color:#E8E2F0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
               style="background:linear-gradient(135deg,#F5A623,#6B2D8B)">
            {{ getInitiales(selected()?.clientPrenom, selected()?.clientNom) }}
          </div>
          <div>
            <p class="font-bold text-gray-900 text-sm">{{ selected()!.reference }}</p>
            <p class="text-xs text-gray-500">
              Client : {{ selected()!.clientPrenom }} {{ selected()!.clientNom }} ·
              {{ selected()!.vehiculeImmatriculation }}
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
            <div class="w-8 h-8 border-3 border-t-[#F5A623] border-[#E8E2F0] rounded-full animate-spin"></div>
          </div>
        } @else if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full py-16 text-center">
            <p class="text-gray-500 text-sm font-semibold">Aucun message pour l'instant</p>
            <p class="text-gray-400 text-xs mt-1">Commencez la conversation avec le client</p>
          </div>
        } @else {
          @for (msg of messages(); track msg.id) {
            <div class="flex gap-2.5 animate-slide-up" [class.flex-row-reverse]="isMe(msg)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1"
                   [style.background]="getRoleColor(msg.user?.role ?? '')">
                {{ getUserInitials(msg.user) }}
              </div>
              <div class="max-w-[70%] space-y-1">
                @if (!isMe(msg)) {
                  <div class="flex items-center gap-2 px-1">
                    <span class="text-xs font-semibold text-gray-700">{{ (msg.user?.prenom ?? 'Utilisateur') + ' ' + (msg.user?.nom ?? '') }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
                          [style.background]="getRoleColor(msg.user?.role ?? '')">
                      {{ getRoleLabel(msg.user?.role ?? '') }}
                    </span>
                  </div>
                }
                <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                     [class.rounded-tr-sm]="isMe(msg)"
                     [class.rounded-tl-sm]="!isMe(msg)"
                     [style.background]="isMe(msg) ? 'linear-gradient(135deg,#F5A623,#D4891A)' : 'white'"
                     [style.color]="isMe(msg) ? 'white' : '#1F2937'"
                     [style.border]="isMe(msg) ? 'none' : '1px solid #E8E2F0'">
                  {{ msg.contenu }}
                </div>
                <p class="text-[10px] text-gray-400 px-1" [class.text-right]="isMe(msg)">
                  {{ msg.createdAt | date:'dd/MM HH:mm' }}
                </p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Saisie -->
      <div class="bg-white border-t px-4 py-3" style="border-color:#E8E2F0">
        @if (replyTo()) {
          <div class="flex items-center justify-between mb-2 px-3 py-2 rounded-xl text-xs"
               style="background:rgba(245,166,35,0.06); border-left:3px solid #F5A623">
            <span class="text-gray-600">
              ↩ Répondre à <strong style="color:#D4891A">{{ replyTo()?.user?.prenom ?? 'Utilisateur' }}</strong>
            </span>
            <button (click)="replyTo.set(null)" class="text-gray-400 hover:text-red-500 ml-2 font-bold">×</button>
          </div>
        }
        <div class="flex items-end gap-2">
          <textarea [(ngModel)]="newMsg" rows="1"
                    (keydown.enter)="onEnter($any($event))"
                    placeholder="Écrire un message au client... (Entrée pour envoyer)"
                    class="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm resize-none
                           focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/10
                           bg-gray-50 focus:bg-white transition-all"
                    style="max-height:120px; min-height:40px"></textarea>
          <button (click)="sendMsg()" [disabled]="!newMsg.trim() || sending()"
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all
                         disabled:opacity-40 hover:-translate-y-0.5 shrink-0"
                  style="background:linear-gradient(135deg,#F5A623,#D4891A);box-shadow:0 3px 10px rgba(245,166,35,0.35)">
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
export class GarageForumComponent implements OnInit {
  @ViewChild('messagesZone') messagesZone!: ElementRef;

  private http  = inject(HttpClient);
  private auth  = inject(AuthService);
  private readonly API = 'http://localhost:8081/api';

  dossiers    = signal<SinistreMission[]>([]);
  selected    = signal<SinistreMission | null>(null);
  messages    = signal<Message[]>([]);
  loading     = signal(true);
  loadingMsgs = signal(false);
  sending     = signal(false);
  search      = '';
  newMsg      = '';
  replyTo     = signal<Message | null>(null);

  filteredDossiers() {
    const q = this.search.toLowerCase();
    return q ? this.dossiers().filter(d =>
      (d.reference ?? '').toLowerCase().includes(q) ||
      (d.clientNom ?? '').toLowerCase().includes(q) ||
      (d.vehiculeImmatriculation ?? '').toLowerCase().includes(q)
    ) : this.dossiers();
  }

  ngOnInit(): void {
    // Récupérer les sinistres affectés à ce garage
    this.http.get<SinistreMission[]>(`${this.API}/sinistres/mes-dossiers-garage`)
      .subscribe({
        next: d => { this.dossiers.set(d); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  selectDossier(d: SinistreMission): void {
    this.selected.set(d);
    this.messages.set([]);
    this.replyTo.set(null);
    this.newMsg = '';
    this.loadMessages();
  }

  loadMessages(): void {
    const s = this.selected();
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
    if (!text) return;
    const s = this.selected();
    if (!s) return;
    this.sending.set(true);
    const body: any = { contenu: text };
    if (this.replyTo()) body.parentId = this.replyTo()!.id;

    this.http.post<Message>(`${this.API}/sinistres/${s.id}/commentaires`, body)
      .subscribe({
        next: () => {
          this.newMsg = '';
          this.replyTo.set(null);
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

  isMe(msg: Message): boolean { return msg.user?.id === this.auth.getUserId(); }

  getInitiales(prenom?: string | null, nom?: string | null): string {
    const first = (prenom ?? '').charAt(0) || (nom ?? '').charAt(0) || '?';
    return first.toUpperCase();
  }

  getUserInitials(user?: { prenom?: string | null; nom?: string | null }): string {
    const prenom = user?.prenom ?? '';
    const nom = user?.nom ?? '';
    const first = (prenom || nom || '?').charAt(0).toUpperCase();
    return first || '?';
  }

  getRoleColor(role: string): string {
    const m: Record<string, string> = {
      CLIENT: '#6B2D8B', GARAGE: '#D4891A', GESTIONNAIRE: '#E5162A',
      EXPERT: '#0ea5e9', REMORQUEUR: '#16a34a', ADMIN: '#C4187A', MANAGER: '#6b7280'
    };
    return m[role] ?? '#6B2D8B';
  }

  getRoleLabel(role: string): string {
    const m: Record<string, string> = {
      CLIENT: 'Client', GARAGE: 'Garage', GESTIONNAIRE: 'Gestionnaire',
      EXPERT: 'Expert', REMORQUEUR: 'Remorqueur', ADMIN: 'Admin', MANAGER: 'Manager'
    };
    return m[role] ?? role;
  }

  getStatutLabel(s: string): string {
    const m: Record<string, string> = {
      DECLARE: 'Déclaré', GARAGE_AFFECTE: 'Affecté', EN_REPARATION: 'En réparation',
      REPARATION_TERMINEE: 'Terminée', CLOTURE: 'Clôturé', EN_EXPERTISE: 'Expertise'
    };
    return m[s] ?? s.replace(/_/g, ' ');
  }

  private scrollBottom(): void {
    try {
      const el = this.messagesZone?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
