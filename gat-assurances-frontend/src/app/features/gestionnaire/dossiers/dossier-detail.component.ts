import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SinistreService } from '../../../core/services/sinistre.service';
import { Sinistre, STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';

const API = 'http://localhost:8081/api';

const MISSION_STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PLANIFIEE: 'Planifiée',
  EN_DIAGNOSTIC: 'En diagnostic',
  EN_REPARATION: 'En réparation',
  DEVIS_DEPOSE: 'Devis déposé',
  DEVIS_EN_VERIFICATION_EXPERT: 'Vérification expert',
  DEVIS_COMPLEMENT_DEMANDE: 'Complément devis demandé',
  DEVIS_VALIDE_EXPERT: '✅ Devis à valider',
  DEVIS_VALIDE_FINAL: 'Devis approuvé',
  DEVIS_REFUSE: 'Devis refusé',
  RAPPORT_EXPERT_DEPOSE: '📄 Rapport à valider',
  RAPPORT_EXPERT_INCOMPLET: 'Correction rapport demandée',
  RAPPORT_EXPERT_VALIDE: 'Rapport validé',
  REPARATION_TERMINEE: 'Réparation terminée',
  FACTURE_DEPOSEE: 'Facture déposée',
  TERMINEE: 'Terminée',
};

interface Mission {
  id: number; statut: string; typeMission: string;
  garageNom: string | null; expertNom: string | null;
  devis: string | null; montantDevis: number | null;
  facture: string | null; montantFacture: number | null;
  motifRefus: string | null; dateExpertisePrevue: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-dossier-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="p-6 space-y-5 max-w-5xl mx-auto animate-fade-in">

  <!-- Header -->
  <div class="flex items-center gap-3">
    <a routerLink="/gestionnaire/dossiers"
       class="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
      ←
    </a>
    @if (sinistre()) {
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ sinistre()!.reference }}</h1>
        <p class="text-xs text-gray-400 mt-0.5">{{ sinistre()!.vehiculeImmatriculation }} — {{ sinistre()!.typeSinistre }}</p>
      </div>
      <span class="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold {{ statusColor(sinistre()!.statut) }}">
        {{ statusLabel(sinistre()!.statut) }}
      </span>
    }
  </div>

  @if (!sinistre()) {
    <div class="flex justify-center py-20">
      <div class="w-10 h-10 border-2 border-t-[#6B2D8B] rounded-full animate-spin"></div>
    </div>
  } @else {

    <!-- Infos dossier -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Client</p>
        <p class="font-semibold text-gray-900">{{ sinistre()!.clientNom }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Véhicule</p>
        <p class="font-semibold text-gray-900">{{ sinistre()!.vehiculeImmatriculation }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Date sinistre</p>
        <p class="font-semibold text-gray-900">{{ sinistre()!.dateSinistre | date:'dd/MM/yyyy' }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Gouvernorat</p>
        <p class="font-semibold text-gray-900">{{ sinistre()!.gouvernorat }}</p>
      </div>
      @if (sinistre()!.garageNom) {
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Garage</p>
          <p class="font-semibold text-gray-900">{{ sinistre()!.garageNom }}</p>
        </div>
      }
      @if (sinistre()!.expertNom) {
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Expert</p>
          <p class="font-semibold text-gray-900">{{ sinistre()!.expertNom }}</p>
        </div>
      }
      <div class="col-span-2">
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
        <p class="text-gray-700">{{ sinistre()!.description }}</p>
      </div>
      @if (sinistre()!.motifRejet) {
        <div class="col-span-2">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Motif rejet précédent</p>
          <p class="text-red-600 text-sm">{{ sinistre()!.motifRejet }}</p>
        </div>
      }
    </div>

    <!-- ═══ MISSIONS ACTIVES ═══ -->
    @if (missions().length > 0) {
      <div class="space-y-4">
        <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <span class="w-1 h-5 rounded-full" style="background:linear-gradient(#6B2D8B,#E5162A)"></span>
          Missions en cours
        </h2>

        @for (mission of missions(); track mission.id) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

            <!-- Header mission -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-lg">{{ mission.typeMission === 'EXPERTISE' ? '🔍' : mission.typeMission === 'REPARATION' ? '🔧' : '🚛' }}</span>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ mission.typeMission }}</p>
                  @if (mission.garageNom)  { <p class="text-xs text-gray-400">Garage : {{ mission.garageNom }}</p> }
                  @if (mission.expertNom)  { <p class="text-xs text-gray-400">Expert : {{ mission.expertNom }}</p> }
                </div>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                    [style.background]="missionStatutBg(mission.statut)"
                    [style.color]="missionStatutColor(mission.statut)">
                {{ missionStatutLabel(mission.statut) }}
              </span>
            </div>

            <!-- ══ BLOC DEVIS : DEVIS_VALIDE_EXPERT ══ -->
            @if (mission.statut === 'DEVIS_VALIDE_EXPERT') {
              <div class="border-l-4 rounded-r-xl p-4 space-y-3"
                   style="border-color:#6B2D8B;background:rgba(107,45,139,0.04)">
                <p class="text-sm font-bold" style="color:#6B2D8B">
                  💰 Devis en attente de votre validation administrative
                </p>
                @if (mission.devis) {
                  <div class="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                    <p class="text-xs text-gray-400 mb-1">Contenu du devis :</p>
                    <p class="text-gray-700 whitespace-pre-wrap">{{ mission.devis }}</p>
                    <p class="font-bold text-lg mt-2" style="color:#6B2D8B">
                      {{ mission.montantDevis | number:'1.3-3' }} TND
                    </p>
                  </div>
                }
                <div class="flex gap-3">
                  <button (click)="validerDevisFinal(mission.id)" [disabled]="saving()"
                          class="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50
                                 bg-green-600 hover:bg-green-700 transition">
                    ✅ Approuver le devis
                  </button>
                  <button (click)="activerRefusDevis(mission.id)" [disabled]="saving()"
                          class="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50
                                 bg-red-600 hover:bg-red-700 transition">
                    ❌ Refuser le devis
                  </button>
                </div>
                @if (missionActionId() === mission.id && modeAction() === 'refus-devis') {
                  <div class="space-y-2">
                    <textarea [(ngModel)]="motifAction" rows="2" placeholder="Motif de refus obligatoire..."
                              class="w-full border border-red-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"></textarea>
                    <div class="flex gap-2">
                      <button (click)="confirmerRefusDevis(mission.id)"
                              class="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">
                        Confirmer le refus
                      </button>
                      <button (click)="annulerAction()"
                              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">
                        Annuler
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- ══ BLOC RAPPORT : RAPPORT_EXPERT_DEPOSE ══ -->
            @if (mission.statut === 'RAPPORT_EXPERT_DEPOSE') {
              <div class="border-l-4 rounded-r-xl p-4 space-y-3"
                   style="border-color:#E5162A;background:rgba(229,22,42,0.04)">
                <p class="text-sm font-bold" style="color:#E5162A">
                  📄 Rapport d'expertise en attente de validation
                </p>
                @if (mission.devis) {
                  <div class="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                    <p class="text-xs text-gray-400 mb-1">Contenu du rapport :</p>
                    <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ mission.devis }}</p>
                  </div>
                }
                <div class="flex gap-3">
                  <button (click)="validerRapport(mission.id)" [disabled]="saving()"
                          class="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50
                                 bg-green-600 hover:bg-green-700 transition">
                    ✅ Valider le rapport
                  </button>
                  <button (click)="activerRejeterRapport(mission.id)" [disabled]="saving()"
                          class="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50
                                 bg-amber-500 hover:bg-amber-600 transition">
                    ✏️ Demander correction
                  </button>
                </div>
                @if (missionActionId() === mission.id && modeAction() === 'rejeter-rapport') {
                  <div class="space-y-2">
                    <textarea [(ngModel)]="motifAction" rows="2" placeholder="Précisez ce qui doit être corrigé..."
                              class="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"></textarea>
                    <div class="flex gap-2">
                      <button (click)="confirmerRejeterRapport(mission.id)"
                              class="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600">
                        Envoyer la demande
                      </button>
                      <button (click)="annulerAction()"
                              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">
                        Annuler
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Rapport validé ou devis approuvé : information -->
            @if (mission.statut === 'RAPPORT_EXPERT_VALIDE') {
              <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                ✅ Rapport validé. Le client a été notifié que son véhicule sera prêt.
              </div>
            }
            @if (mission.statut === 'DEVIS_VALIDE_FINAL') {
              <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                ✅ Devis approuvé. Le garage peut commencer la réparation.
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- ═══ ACTIONS DOSSIER SINISTRE ═══ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full" style="background:linear-gradient(#E5162A,#6B2D8B)"></span>
        Actions sur le dossier
      </h2>

      <div class="flex flex-wrap gap-3">
        <button (click)="approuver()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-green-600 hover:bg-green-700 transition">
          ✅ Approuver le dossier
        </button>
        <button (click)="cloturer()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-gray-700 hover:bg-gray-800 transition">
          🔒 Clôturer
        </button>
        <a [routerLink]="['/gestionnaire/dossiers', sinistre()!.id, 'forum']"
           class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
           style="background:#6B2D8B">
          💬 Forum
        </a>
      </div>

      <!-- Complément / refus dossier -->
      <div class="border-t border-gray-100 pt-4 space-y-3">
        @if (erreurMotif()) {
          <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ⚠️ {{ erreurMotif() }}
          </div>
        }
        <textarea [(ngModel)]="motif" rows="2"
                  placeholder="Motif obligatoire pour demander complément ou refuser le dossier..."
                  class="w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none
                         focus:ring-2 transition-all"
                  [style.border-color]="erreurMotif() ? '#EF4444' : '#E5E7EB'"
                  [style.background]="erreurMotif() ? '#FEF2F2' : 'white'"></textarea>
        <div class="flex gap-3">
          <button (click)="demanderComplement()" [disabled]="saving()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-amber-500 hover:bg-amber-600 transition disabled:opacity-50">
            📋 Demander complément
          </button>
          <button (click)="refuser()" [disabled]="saving()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-red-600 hover:bg-red-700 transition disabled:opacity-50">
            ❌ Refuser le dossier
          </button>
        </div>
      </div>

      @if (message()) {
        <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          ✅ {{ message() }}
        </div>
      }
    </div>
  }
</div>
  `
})
export class DossierDetailComponent implements OnInit {
  sinistre    = signal<Sinistre | null>(null);
  missions    = signal<Mission[]>([]);
  motif       = '';
  message     = signal<string | null>(null);
  erreurMotif = signal<string | null>(null);
  saving      = signal(false);

  // Pour les actions sur missions (devis/rapport)
  missionActionId = signal<number | null>(null);
  modeAction      = signal<string | null>(null);
  motifAction     = '';

  constructor(
    private route: ActivatedRoute,
    private sinistreService: SinistreService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sinistreService.findById(id).subscribe(s => {
      this.sinistre.set(s);
      // Charger les missions liées à ce sinistre
      this.http.get<Mission[]>(`${API}/missions/par-sinistre/${id}`)
        .subscribe({ next: ms => this.missions.set(ms), error: () => {} });
    });
  }

  // Recharger les missions après une action
  private rechargerMissions(): void {
    const sid = this.sinistre()?.id;
    if (!sid) return;
    this.http.get<Mission[]>(`${API}/missions/par-sinistre/${sid}`)
      .subscribe({ next: ms => this.missions.set(ms), error: () => {} });
  }

  // ═══ DEVIS ═══

  validerDevisFinal(missionId: number): void {
    this.saving.set(true);
    this.http.put<Mission>(`${API}/missions/${missionId}/valider-devis-final`, null)
      .subscribe({
        next: () => { this.saving.set(false); this.message.set('Devis approuvé. Le garage peut commencer.'); this.rechargerMissions(); },
        error: e  => { this.saving.set(false); this.erreurMotif.set(e.error?.message ?? 'Erreur'); }
      });
  }

  activerRefusDevis(missionId: number): void {
    this.missionActionId.set(missionId);
    this.modeAction.set('refus-devis');
    this.motifAction = '';
  }

  confirmerRefusDevis(missionId: number): void {
    if (!this.motifAction.trim()) return;
    this.saving.set(true);
    this.http.put<Mission>(`${API}/missions/${missionId}/refuser-devis`, { motif: this.motifAction })
      .subscribe({
        next: () => { this.saving.set(false); this.annulerAction(); this.message.set('Devis refusé.'); this.rechargerMissions(); },
        error: e  => { this.saving.set(false); this.erreurMotif.set(e.error?.message ?? 'Erreur'); }
      });
  }

  // ═══ RAPPORT ═══

  validerRapport(missionId: number): void {
    this.saving.set(true);
    this.http.put<Mission>(`${API}/missions/${missionId}/valider-rapport`, null)
      .subscribe({
        next: () => { this.saving.set(false); this.message.set('Rapport validé. Le client a été notifié.'); this.rechargerMissions(); },
        error: e  => { this.saving.set(false); this.erreurMotif.set(e.error?.message ?? 'Erreur'); }
      });
  }

  activerRejeterRapport(missionId: number): void {
    this.missionActionId.set(missionId);
    this.modeAction.set('rejeter-rapport');
    this.motifAction = '';
  }

  confirmerRejeterRapport(missionId: number): void {
    if (!this.motifAction.trim()) return;
    this.saving.set(true);
    this.http.put<Mission>(`${API}/missions/${missionId}/rejeter-rapport`, { motif: this.motifAction })
      .subscribe({
        next: () => { this.saving.set(false); this.annulerAction(); this.message.set('Correction demandée à l\'expert.'); this.rechargerMissions(); },
        error: e  => { this.saving.set(false); this.erreurMotif.set(e.error?.message ?? 'Erreur'); }
      });
  }

  annulerAction(): void {
    this.missionActionId.set(null);
    this.modeAction.set(null);
    this.motifAction = '';
  }

  // ═══ ACTIONS DOSSIER ═══

  approuver(): void {
    if (!this.sinistre()) return;
    this.sinistreService.approuver(this.sinistre()!.id).subscribe(s => {
      this.sinistre.set(s); this.message.set('Dossier approuvé.');
    });
  }

  cloturer(): void {
    if (!this.sinistre()) return;
    this.sinistreService.cloturer(this.sinistre()!.id).subscribe(s => {
      this.sinistre.set(s); this.message.set('Dossier clôturé.');
    });
  }

  demanderComplement(): void {
    if (!this.sinistre()) return;
    if (!this.motif.trim()) { this.erreurMotif.set('Veuillez saisir un motif avant de demander un complément.'); return; }
    this.erreurMotif.set(null); this.saving.set(true);
    this.sinistreService.demanderComplement(this.sinistre()!.id, this.motif.trim()).subscribe({
      next: s => { this.sinistre.set(s); this.motif = ''; this.message.set('Demande de complément envoyée.'); this.saving.set(false); },
      error: e => { this.erreurMotif.set(e.error?.message ?? 'Erreur.'); this.saving.set(false); }
    });
  }

  refuser(): void {
    if (!this.sinistre()) return;
    if (!this.motif.trim()) { this.erreurMotif.set('Un motif de refus est obligatoire.'); return; }
    this.erreurMotif.set(null); this.saving.set(true);
    this.sinistreService.refuser(this.sinistre()!.id, this.motif.trim()).subscribe({
      next: s => { this.sinistre.set(s); this.motif = ''; this.message.set('Dossier refusé.'); this.saving.set(false); },
      error: e => { this.erreurMotif.set(e.error?.message ?? 'Erreur.'); this.saving.set(false); }
    });
  }

  // ═══ HELPERS ═══

  missionStatutLabel(s: string): string { return MISSION_STATUT_LABEL[s] ?? s.replace(/_/g, ' '); }

  missionStatutBg(s: string): string {
    const m: Record<string, string> = {
      DEVIS_VALIDE_EXPERT: 'rgba(107,45,139,0.1)', RAPPORT_EXPERT_DEPOSE: 'rgba(229,22,42,0.1)',
      DEVIS_VALIDE_FINAL: 'rgba(34,197,94,0.1)', RAPPORT_EXPERT_VALIDE: 'rgba(34,197,94,0.1)',
      DEVIS_COMPLEMENT_DEMANDE: 'rgba(245,158,11,0.1)', DEVIS_REFUSE: 'rgba(220,38,38,0.1)',
      EN_ATTENTE: 'rgba(107,114,128,0.1)', EN_DIAGNOSTIC: 'rgba(245,158,11,0.1)',
    };
    return m[s] ?? 'rgba(107,114,128,0.1)';
  }

  missionStatutColor(s: string): string {
    const m: Record<string, string> = {
      DEVIS_VALIDE_EXPERT: '#6B2D8B', RAPPORT_EXPERT_DEPOSE: '#E5162A',
      DEVIS_VALIDE_FINAL: '#16a34a', RAPPORT_EXPERT_VALIDE: '#16a34a',
      DEVIS_COMPLEMENT_DEMANDE: '#d97706', DEVIS_REFUSE: '#dc2626',
      EN_ATTENTE: '#6b7280', EN_DIAGNOSTIC: '#d97706',
    };
    return m[s] ?? '#6b7280';
  }

  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
}
