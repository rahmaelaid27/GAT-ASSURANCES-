import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8081/api';

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PLANIFIEE: 'Planifiée',
  EN_DIAGNOSTIC: 'En diagnostic / inspection',
  EN_REPARATION: 'En réparation',
  DEVIS_DEPOSE: '📋 Devis à vérifier',
  DEVIS_EN_VERIFICATION_EXPERT: '🔍 Vérification en cours',
  DEVIS_COMPLEMENT_DEMANDE: '⚠️ Complément demandé au garage',
  DEVIS_VALIDE_EXPERT: '✅ Devis transmis au gestionnaire',
  DEVIS_VALIDE_FINAL: '✅ Devis approuvé',
  DEVIS_REFUSE: '❌ Devis refusé',
  RAPPORT_EXPERT_DEPOSE: '📄 Rapport déposé — en attente gestionnaire',
  RAPPORT_EXPERT_INCOMPLET: '⚠️ Correction rapport demandée',
  RAPPORT_EXPERT_VALIDE: '✅ Rapport validé',
  REPARATION_TERMINEE: 'Réparation terminée',
  FACTURE_DEPOSEE: 'Facture déposée',
  TERMINEE: 'Terminée',
};

const STATUT_COLOR: Record<string, string> = {
  EN_ATTENTE: '#6b7280', PLANIFIEE: '#0ea5e9', EN_DIAGNOSTIC: '#f59e0b',
  DEVIS_DEPOSE: '#6B2D8B', DEVIS_EN_VERIFICATION_EXPERT: '#0ea5e9',
  DEVIS_COMPLEMENT_DEMANDE: '#E5162A', DEVIS_VALIDE_EXPERT: '#22c55e',
  DEVIS_VALIDE_FINAL: '#16a34a', DEVIS_REFUSE: '#dc2626',
  RAPPORT_EXPERT_DEPOSE: '#6B2D8B', RAPPORT_EXPERT_INCOMPLET: '#E5162A',
  RAPPORT_EXPERT_VALIDE: '#16a34a', REPARATION_TERMINEE: '#22c55e',
  FACTURE_DEPOSEE: '#22c55e', TERMINEE: '#16a34a',
};

interface Mission {
  id: number; statut: string; typeMission: string; description: string;
  sinistreReference: string; sinistreImmatriculation: string;
  garageNom: string | null; expertNom: string | null;
  devis: string | null; montantDevis: number | null;
  facture: string | null; montantFacture: number | null;
  avancementGarage: string | null; motifRefus: string | null;
  dateExpertisePrevue: string | null;
  createdAt: string; updatedAt: string;
}

@Component({
  selector: 'app-expertise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

  <!-- Header -->
  <div class="flex items-center gap-3">
    <a routerLink="/expert/expertises"
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

    <!-- Alerte correction rapport -->
    @if (m()!.statut === 'RAPPORT_EXPERT_INCOMPLET' && m()!.motifRefus) {
      <div class="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
        <span class="text-xl shrink-0">⚠️</span>
        <div>
          <p class="text-sm font-semibold text-amber-800">Correction demandée par le gestionnaire</p>
          <p class="text-sm text-gray-700 mt-1">{{ m()!.motifRefus }}</p>
          <p class="text-xs text-gray-400 mt-1.5">→ Veuillez corriger et redéposer votre rapport.</p>
        </div>
      </div>
    }

    <!-- Infos dossier -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Garage</p>
        <p class="font-medium text-gray-900">{{ m()!.garageNom || '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Date expertise prévue</p>
        <p class="font-medium text-gray-900">
          {{ m()!.dateExpertisePrevue ? (m()!.dateExpertisePrevue | date:'dd/MM/yyyy HH:mm') : 'Non planifiée' }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Devis garage</p>
        <p class="font-medium" [style.color]="m()!.montantDevis ? '#16a34a' : '#6b7280'">
          {{ m()!.montantDevis ? (m()!.montantDevis | number:'1.3-3') + ' TND' : 'Pas encore déposé' }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Avancement garage</p>
        <p class="font-medium text-gray-900">{{ m()!.avancementGarage ? formatAvancement(m()!.avancementGarage!) : '—' }}</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         SECTION A : PLANIFIER L'INSPECTION
    ═══════════════════════════════════════════════════════════════ -->
    @if (m()!.statut === 'EN_ATTENTE' || m()!.statut === 'PLANIFIEE') {
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center bg-blue-500">📅</span>
          Planifier l'inspection
        </h2>
        <div class="flex gap-3">
          <input type="datetime-local" [(ngModel)]="datePrevue"
                 [value]="datePrevue"
                 class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          <button (click)="planifier()" [disabled]="saving()"
                  class="px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50 bg-blue-500 hover:bg-blue-600 transition">
            Planifier
          </button>
        </div>
        @if (m()!.statut === 'PLANIFIEE') {
          <button (click)="demarrerInspection()" [disabled]="saving()"
                  class="w-full py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50 bg-amber-500 hover:bg-amber-600 transition">
            🔍 Démarrer l'inspection maintenant
          </button>
        }
      </div>
    }

    <!-- ═══════════════════════════════════════════════════════════════
         SECTION B : VÉRIFIER LE DEVIS DU GARAGE
    ═══════════════════════════════════════════════════════════════ -->
    @if (showSectionDevis()) {
      <div class="bg-white rounded-2xl border-2 p-5 space-y-4"
           style="border-color:rgba(107,45,139,0.3)">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                style="background:#6B2D8B">📋</span>
          Vérification du devis garage
        </h2>

        <!-- Afficher le devis -->
        @if (m()!.devis) {
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Contenu du devis</p>
            <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ m()!.devis }}</p>
            <p class="text-sm font-bold mt-3" style="color:#6B2D8B">
              Montant : {{ m()!.montantDevis | number:'1.3-3' }} TND
            </p>
          </div>
        }

        @if (m()!.statut === 'DEVIS_DEPOSE') {
          <button (click)="commencerVerificationDevis()" [disabled]="saving()"
                  class="w-full py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                  style="background:#0ea5e9">
            🔍 Commencer la vérification
          </button>
        }

        @if (m()!.statut === 'DEVIS_DEPOSE' || m()!.statut === 'DEVIS_EN_VERIFICATION_EXPERT') {
          <!-- Actions expert sur le devis -->
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Motif (obligatoire pour demande de complément)
              </label>
              <textarea [(ngModel)]="motifDevis" rows="2"
                        placeholder="Précisez ce qui manque ou doit être corrigé dans le devis..."
                        class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none"></textarea>
            </div>
            <button (click)="demanderComplementDevis()" [disabled]="saving()"
                    class="py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50
                           bg-amber-500 hover:bg-amber-600 transition">
              ⚠️ Demander complément
            </button>
            <button (click)="validerDevisExpert()" [disabled]="saving()"
                    class="py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50
                           bg-green-600 hover:bg-green-700 transition">
              ✅ Valider et transmettre
            </button>
          </div>
        }

        @if (m()!.statut === 'DEVIS_COMPLEMENT_DEMANDE') {
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            ⏳ Complément demandé au garage — en attente de leur nouveau devis.
          </div>
        }

        @if (m()!.statut === 'DEVIS_VALIDE_EXPERT') {
          <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
            ✅ Devis transmis au gestionnaire — en attente de sa validation finale.
          </div>
        }
      </div>
    }

    <!-- ═══════════════════════════════════════════════════════════════
         SECTION C : RAPPORT D'EXPERTISE
    ═══════════════════════════════════════════════════════════════ -->
    @if (showSectionRapport()) {
      <div class="bg-white rounded-2xl border-2 p-5 space-y-4"
           style="border-color:rgba(229,22,42,0.25)">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                style="background:#E5162A">📄</span>
          {{ m()!.statut === 'RAPPORT_EXPERT_INCOMPLET' ? 'Corriger et redéposer le rapport' : 'Rédiger le rapport d\'expertise' }}
        </h2>

        <!-- Rapport existant si correction demandée -->
        @if (m()!.statut === 'RAPPORT_EXPERT_INCOMPLET' && m()!.devis) {
          <div class="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
            <p class="font-semibold mb-1">Rapport précédent :</p>
            <p class="whitespace-pre-wrap">{{ m()!.devis }}</p>
          </div>
        }

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Rapport d'expertise <span class="text-red-500">*</span>
          </label>
          <textarea [(ngModel)]="rapportTexte" rows="8"
                    placeholder="Rédigez votre rapport complet :
• État du véhicule à l'arrivée
• Dommages constatés (détail par pièce)
• Cause probable du sinistre
• Travaux nécessaires recommandés
• Estimation des coûts
• Conclusion et recommandation"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-red-400/30
                           resize-none bg-gray-50 focus:bg-white font-mono leading-relaxed"></textarea>
        </div>

        @if (erreur()) {
          <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ⚠️ {{ erreur() }}
          </div>
        }

        <button (click)="deposerRapport()" [disabled]="saving()"
                class="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50
                       hover:-translate-y-0.5 transition-all"
                style="background:linear-gradient(135deg,#E5162A,#6B2D8B);box-shadow:0 4px 14px rgba(229,22,42,0.25)">
          {{ saving() ? 'Envoi en cours…' : '📤 Envoyer le rapport au gestionnaire' }}
        </button>
      </div>
    }

    <!-- Rapport déposé / validé -->
    @if (m()!.statut === 'RAPPORT_EXPERT_DEPOSE') {
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
        <div>
          <p class="text-sm font-semibold text-purple-800">Rapport déposé — en attente de validation gestionnaire</p>
          <p class="text-xs text-purple-600 mt-0.5">Le gestionnaire va vérifier et valider votre rapport.</p>
        </div>
      </div>
    }
    @if (m()!.statut === 'RAPPORT_EXPERT_VALIDE') {
      <div class="bg-green-50 border border-green-200 rounded-xl p-4">
        <p class="text-sm font-semibold text-green-800">✅ Rapport validé par le gestionnaire</p>
        <p class="text-xs text-green-600 mt-1">Le client a été notifié que son véhicule est prêt.</p>
      </div>
    }

    <!-- Succès -->
    @if (succes()) {
      <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
        ✅ {{ succes() }}
      </div>
    }

    <!-- Forum -->
    <div class="flex gap-3">
      <a [routerLink]="['/expert/expertises', m()!.id, 'forum']"
         class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
         style="background:#6B2D8B">
        💬 Forum
      </a>
    </div>
  }
</div>
  `
})
export class ExpertiseDetailComponent implements OnInit {
  m       = signal<Mission | null>(null);
  saving  = signal(false);
  erreur  = signal<string | null>(null);
  succes  = signal<string | null>(null);

  datePrevue   = '';
  motifDevis   = '';
  rapportTexte = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Mission>(`${API}/missions/${id}`).subscribe(ms => {
      this.m.set(ms);
      if (ms.dateExpertisePrevue)
        this.datePrevue = ms.dateExpertisePrevue.substring(0, 16);
      if (ms.devis && ms.statut === 'RAPPORT_EXPERT_INCOMPLET')
        this.rapportTexte = ms.devis;
    });
  }

  /** Afficher la section devis si un devis est en cours de vérification */
  showSectionDevis(): boolean {
    const s = this.m()?.statut ?? '';
    return ['DEVIS_DEPOSE','DEVIS_EN_VERIFICATION_EXPERT',
            'DEVIS_COMPLEMENT_DEMANDE','DEVIS_VALIDE_EXPERT'].includes(s);
  }

  /** Afficher la section rapport */
  showSectionRapport(): boolean {
    const s = this.m()?.statut ?? '';
    // L'expert peut rédiger son rapport quand l'inspection est faite
    // OU quand une correction est demandée
    return ['EN_DIAGNOSTIC','DEVIS_VALIDE_FINAL','REPARATION_TERMINEE',
            'RAPPORT_EXPERT_INCOMPLET'].includes(s);
  }

  planifier(): void {
    if (!this.datePrevue) return;
    this.put(`planifier`, null, { datePrevue: this.datePrevue })
      .subscribe({ next: ms => { this.m.set(ms); this.succes.set('Inspection planifiée.'); },
                   error: e => this.erreur.set(e.error?.message ?? 'Erreur') });
  }

  demarrerInspection(): void {
    this.put(`demarrer-inspection`, null)
      .subscribe({ next: ms => { this.m.set(ms); this.succes.set('Inspection démarrée.'); },
                   error: e => this.erreur.set(e.error?.message ?? 'Erreur') });
  }

  commencerVerificationDevis(): void {
    this.put(`commencer-verification-devis`, null)
      .subscribe({ next: ms => { this.m.set(ms); this.succes.set('Vérification commencée.'); },
                   error: e => this.erreur.set(e.error?.message ?? 'Erreur') });
  }

  demanderComplementDevis(): void {
    if (!this.motifDevis.trim()) { this.erreur.set('Le motif est obligatoire.'); return; }
    this.erreur.set(null);
    this.put(`demander-complement-devis`, { motif: this.motifDevis })
      .subscribe({ next: ms => { this.m.set(ms); this.motifDevis = ''; this.succes.set('Complément demandé au garage.'); },
                   error: e => this.erreur.set(e.error?.message ?? 'Erreur') });
  }

  validerDevisExpert(): void {
    this.erreur.set(null);
    this.put(`valider-devis-expert`, null)
      .subscribe({ next: ms => { this.m.set(ms); this.succes.set('Devis validé et transmis au gestionnaire.'); },
                   error: e => this.erreur.set(e.error?.message ?? 'Erreur') });
  }

  deposerRapport(): void {
    if (!this.rapportTexte.trim()) { this.erreur.set('Le rapport est obligatoire.'); return; }
    this.erreur.set(null); this.saving.set(true);
    this.put(`deposer-rapport`, { rapport: this.rapportTexte })
      .subscribe({
        next: ms => { this.m.set(ms); this.saving.set(false); this.succes.set('Rapport envoyé au gestionnaire.'); },
        error: e  => { this.saving.set(false); this.erreur.set(e.error?.message ?? 'Erreur'); }
      });
  }

  private put(endpoint: string, body: any, params?: any) {
    return this.http.put<Mission>(
      `${API}/missions/${this.m()!.id}/${endpoint}`,
      body ?? null,
      params ? { params } : undefined
    );
  }

  statutLabel(s: string): string { return STATUT_LABEL[s] ?? s.split('_').join(' '); }
  statutColor(s: string): string { return STATUT_COLOR[s] ?? '#6b7280'; }
  formatAvancement(s: string): string { return s.split('_').join(' '); }
}
