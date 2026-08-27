import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8081/api';

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PLANIFIEE: 'Planifiée',
  EN_DIAGNOSTIC: 'En diagnostic',
  EN_REPARATION: 'En réparation',
  EN_COMMANDE_PIECES: 'Commande pièces',
  REPARATION_TERMINEE: 'Réparation terminée',
  DEVIS_DEPOSE: '📋 Devis déposé — en attente expert',
  DEVIS_EN_VERIFICATION_EXPERT: '🔍 Devis en vérification expert',
  DEVIS_COMPLEMENT_DEMANDE: '⚠️ Complément devis demandé',
  DEVIS_VALIDE_EXPERT: '✅ Devis validé expert — en attente gestionnaire',
  DEVIS_VALIDE_FINAL: '✅✅ Devis approuvé — réparation autorisée',
  DEVIS_REFUSE: '❌ Devis refusé',
  FACTURE_DEPOSEE: 'Facture déposée',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const STATUT_COLOR: Record<string, string> = {
  EN_ATTENTE: '#6b7280',
  PLANIFIEE: '#0ea5e9',
  EN_DIAGNOSTIC: '#f59e0b',
  EN_REPARATION: '#f59e0b',
  EN_COMMANDE_PIECES: '#f59e0b',
  REPARATION_TERMINEE: '#22c55e',
  DEVIS_DEPOSE: '#6B2D8B',
  DEVIS_EN_VERIFICATION_EXPERT: '#0ea5e9',
  DEVIS_COMPLEMENT_DEMANDE: '#E5162A',
  DEVIS_VALIDE_EXPERT: '#22c55e',
  DEVIS_VALIDE_FINAL: '#16a34a',
  DEVIS_REFUSE: '#dc2626',
  FACTURE_DEPOSEE: '#22c55e',
  TERMINEE: '#16a34a',
  ANNULEE: '#6b7280',
};

interface Mission {
  id: number; statut: string; typeMission: string; description: string;
  sinistreReference: string; sinistreImmatriculation: string;
  garageNom: string; expertNom: string;
  devis: string | null; montantDevis: number | null;
  facture: string | null; montantFacture: number | null;
  avancementGarage: string | null; motifRefus: string | null;
  dateExpertisePrevue: string | null;
  createdAt: string; updatedAt: string;
}

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

  <!-- Header -->
  <div class="flex items-center gap-3">
    <a routerLink="/garage/missions"
       class="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
      ←
    </a>
    @if (m()) {
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ m()!.sinistreReference }}</h1>
        <p class="text-xs text-gray-400 mt-0.5">{{ m()!.sinistreImmatriculation }} — {{ m()!.typeMission }}</p>
      </div>
      <span class="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold text-white"
            [style.background]="statutColor(m()!.statut)">
        {{ statutLabel(m()!.statut) }}
      </span>
    }
  </div>

  @if (!m()) {
    <div class="flex justify-center py-20">
      <div class="w-10 h-10 border-2 border-t-[#6B2D8B] rounded-full animate-spin"></div>
    </div>
  } @else {

    <!-- Alerte motif refus ou complément -->
    @if (m()!.motifRefus && (m()!.statut === 'DEVIS_COMPLEMENT_DEMANDE' || m()!.statut === 'DEVIS_REFUSE')) {
      <div class="flex items-start gap-3 p-4 rounded-xl border"
           [style.background]="m()!.statut === 'DEVIS_REFUSE' ? 'rgba(220,38,38,0.06)' : 'rgba(245,158,11,0.08)'"
           [style.border-color]="m()!.statut === 'DEVIS_REFUSE' ? '#fca5a5' : '#fcd34d'">
        <span class="text-xl shrink-0">{{ m()!.statut === 'DEVIS_REFUSE' ? '❌' : '⚠️' }}</span>
        <div>
          <p class="text-sm font-semibold" [style.color]="m()!.statut === 'DEVIS_REFUSE' ? '#dc2626' : '#d97706'">
            {{ m()!.statut === 'DEVIS_REFUSE' ? 'Devis refusé par le gestionnaire' : 'Complément demandé par l\'expert' }}
          </p>
          <p class="text-sm text-gray-700 mt-1">{{ m()!.motifRefus }}</p>
          <p class="text-xs text-gray-400 mt-1.5">→ Veuillez corriger et redéposer un devis.</p>
        </div>
      </div>
    }

    <!-- Infos -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Expert</p>
        <p class="font-medium text-gray-900">{{ m()!.expertNom || '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Date expertise prévue</p>
        <p class="font-medium text-gray-900">
          {{ m()!.dateExpertisePrevue ? (m()!.dateExpertisePrevue | date:'dd/MM/yyyy HH:mm') : '—' }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Devis</p>
        <p class="font-medium" [style.color]="m()!.montantDevis ? '#16a34a' : '#6b7280'">
          {{ m()!.montantDevis ? (m()!.montantDevis | number:'1.3-3') + ' TND' : 'Non déposé' }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Facture</p>
        <p class="font-medium" [style.color]="m()!.montantFacture ? '#16a34a' : '#6b7280'">
          {{ m()!.montantFacture ? (m()!.montantFacture | number:'1.3-3') + ' TND' : 'Non déposée' }}
        </p>
      </div>
      @if (m()!.avancementGarage) {
        <div class="col-span-2">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Avancement actuel</p>
          <p class="font-medium text-gray-900">{{ formatAvancement(m()!.avancementGarage!) }}</p>
        </div>
      }
    </div>

    <!-- ═══ SECTION DEVIS ═══ -->
    @if (canDeposeDevis()) {
      <div class="bg-white rounded-2xl border-2 p-5 space-y-4"
           style="border-color:rgba(107,45,139,0.3)">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                style="background:#6B2D8B">💰</span>
          {{ m()!.statut === 'DEVIS_COMPLEMENT_DEMANDE' || m()!.statut === 'DEVIS_REFUSE'
             ? 'Redéposer un devis corrigé' : 'Déposer le devis de réparation' }}
        </h2>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Détail du devis <span class="text-red-500">*</span>
            </label>
            <textarea [(ngModel)]="devisTexte" rows="4"
                      placeholder="Détailler les travaux : pièces, main d'œuvre, délai estimé..."
                      class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]
                             resize-none bg-gray-50 focus:bg-white"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Montant estimé (TND) <span class="text-red-500">*</span>
            </label>
            <input type="number" min="0" step="0.001" [(ngModel)]="devisMontant"
                   placeholder="Ex: 1250.000"
                   class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                          focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
          </div>
        </div>

        @if (erreur()) {
          <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ {{ erreur() }}</div>
        }

        <button (click)="deposerDevis()" [disabled]="saving()"
                class="w-full py-3 rounded-xl font-bold text-white text-sm transition-all
                       disabled:opacity-50 hover:-translate-y-0.5"
                style="background:linear-gradient(135deg,#6B2D8B,#E5162A);box-shadow:0 4px 14px rgba(107,45,139,0.3)">
          {{ saving() ? 'Envoi en cours…' : '📤 Envoyer le devis à l\'expert' }}
        </button>
      </div>
    }

    <!-- ═══ SECTION AVANCEMENT ═══ (visible seulement si devis approuvé) -->
    @if (canMajAvancement()) {
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                style="background:#f59e0b">🔧</span>
          Mettre à jour l'avancement
        </h2>
        <div class="flex gap-3">
          <select [(ngModel)]="avancement"
                  class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30">
            <option value="EN_DIAGNOSTIC">En diagnostic</option>
            <option value="EN_COMMANDE_PIECES">En commande de pièces</option>
            <option value="EN_REPARATION">En réparation</option>
            <option value="REPARATION_TERMINEE">Réparation terminée</option>
          </select>
          <button (click)="majAvancement()" [disabled]="saving()"
                  class="px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                  style="background:#f59e0b">
            Mettre à jour
          </button>
        </div>
      </div>
    }

    <!-- ═══ SECTION FACTURE ═══ -->
    @if (canDeposeFacture()) {
      <div class="bg-white rounded-2xl border-2 border-green-200 p-5 space-y-4">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center bg-green-600">🧾</span>
          Déposer la facture finale
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Détail facture <span class="text-red-500">*</span></label>
            <textarea [(ngModel)]="factureTexte" rows="3"
                      placeholder="Récapitulatif travaux effectués, pièces remplacées..."
                      class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Montant final (TND) <span class="text-red-500">*</span></label>
            <input type="number" min="0" step="0.001" [(ngModel)]="factureMontant"
                   placeholder="Ex: 1180.000"
                   class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"/>
          </div>
        </div>
        <button (click)="deposerFacture()" [disabled]="saving()"
                class="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 bg-green-600 hover:bg-green-700 transition-all">
          🧾 Déposer la facture
        </button>
      </div>
    }

    <!-- Statut devis en cours de traitement -->
    @if (['DEVIS_DEPOSE','DEVIS_EN_VERIFICATION_EXPERT','DEVIS_VALIDE_EXPERT'].includes(m()!.statut)) {
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
        <div>
          <p class="text-sm font-semibold text-blue-800">{{ statutLabel(m()!.statut) }}</p>
          @if (m()!.statut === 'DEVIS_DEPOSE')              { <p class="text-xs text-blue-600 mt-0.5">L'expert vérifie votre devis.</p> }
          @if (m()!.statut === 'DEVIS_EN_VERIFICATION_EXPERT') { <p class="text-xs text-blue-600 mt-0.5">L'expert est en train d'analyser votre devis.</p> }
          @if (m()!.statut === 'DEVIS_VALIDE_EXPERT')       { <p class="text-xs text-blue-600 mt-0.5">L'expert a validé — le gestionnaire doit approuver.</p> }
        </div>
      </div>
    }

    <!-- Message succès -->
    @if (succes()) {
      <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
        ✅ {{ succes() }}
      </div>
    }

    <!-- Forum -->
    <div class="flex gap-3">
      <a [routerLink]="['/garage/forum']"
         class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
         style="background:#6B2D8B">
        💬 Forum
      </a>
    </div>
  }
</div>
  `
})
export class MissionDetailComponent implements OnInit {
  m       = signal<Mission | null>(null);
  saving  = signal(false);
  erreur  = signal<string | null>(null);
  succes  = signal<string | null>(null);

  devisTexte   = '';
  devisMontant: number | null = null;
  factureTexte  = '';
  factureMontant: number | null = null;
  avancement   = 'EN_REPARATION';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Mission>(`${API}/missions/${id}`).subscribe(ms => {
      this.m.set(ms);
      if (ms.avancementGarage) this.avancement = ms.avancementGarage;
      if (ms.devis)            this.devisTexte  = ms.devis;
      if (ms.montantDevis)     this.devisMontant = ms.montantDevis;
    });
  }

  canDeposeDevis(): boolean {
    const s = this.m()?.statut ?? '';
    return ['EN_ATTENTE','EN_REPARATION','EN_DIAGNOSTIC','EN_COMMANDE_PIECES',
            'DEVIS_COMPLEMENT_DEMANDE','DEVIS_REFUSE','DEVIS_VALIDE_FINAL'].includes(s);
  }

  canMajAvancement(): boolean {
    const s = this.m()?.statut ?? '';
    return ['DEVIS_VALIDE_FINAL','EN_REPARATION','EN_DIAGNOSTIC',
            'EN_COMMANDE_PIECES','EN_ATTENTE'].includes(s);
  }

  canDeposeFacture(): boolean {
    return this.m()?.statut === 'REPARATION_TERMINEE';
  }

  deposerDevis(): void {
    if (!this.devisTexte.trim())                 { this.erreur.set('Le détail du devis est obligatoire.'); return; }
    if (!this.devisMontant || this.devisMontant <= 0) { this.erreur.set('Le montant doit être supérieur à 0.'); return; }
    this.saving.set(true); this.erreur.set(null);
    this.http.put<Mission>(`${API}/missions/${this.m()!.id}/deposer-devis`,
      { devis: this.devisTexte, montant: String(this.devisMontant) })
      .subscribe({
        next: ms => { this.m.set(ms); this.saving.set(false); this.succes.set('Devis envoyé à l\'expert avec succès.'); },
        error: e  => { this.saving.set(false); this.erreur.set(e.error?.message ?? 'Erreur lors du dépôt.'); }
      });
  }

  majAvancement(): void {
    this.saving.set(true);
    this.http.put<Mission>(`${API}/missions/${this.m()!.id}/avancement`, null,
      { params: { avancement: this.avancement } })
      .subscribe({ next: ms => { this.m.set(ms); this.saving.set(false); this.succes.set('Avancement mis à jour.'); },
                   error: () => this.saving.set(false) });
  }

  deposerFacture(): void {
    if (!this.factureTexte.trim())                    { this.erreur.set('Le détail de la facture est obligatoire.'); return; }
    if (!this.factureMontant || this.factureMontant <= 0) { this.erreur.set('Le montant de la facture doit être > 0.'); return; }
    this.saving.set(true); this.erreur.set(null);
    this.http.put<Mission>(`${API}/missions/${this.m()!.id}/deposer-facture`,
      { facture: this.factureTexte, montant: String(this.factureMontant) })
      .subscribe({
        next: ms => { this.m.set(ms); this.saving.set(false); this.succes.set('Facture déposée avec succès.'); },
        error: e  => { this.saving.set(false); this.erreur.set(e.error?.message ?? 'Erreur.'); }
      });
  }

  statutLabel(s: string): string { return STATUT_LABEL[s] ?? s.replace(/_/g, ' '); }
  statutColor(s: string): string { return STATUT_COLOR[s] ?? '#6b7280'; }
  formatAvancement(s: string): string { return s.split('_').join(' '); }
}
