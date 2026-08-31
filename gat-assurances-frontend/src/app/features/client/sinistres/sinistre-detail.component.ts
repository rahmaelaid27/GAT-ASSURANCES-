import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { Sinistre, STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

const API = 'http://localhost:8081/api';

interface MissionSuivi {
  statut: string;
  typeMission?: string;
  updatedAt?: string;
  remorqueurId?: number;
  garageNom?: string;
  expertNom?: string;
  facture?: string;
  montantFacture?: number;
}

interface RemorqueurSuivi {
  id: number;
  nom: string;
  prenom: string;
  disponibilite: boolean;
  localisation?: string;
}

interface RemorquageSuivi {
  statut: string;
  remorqueurId?: number;
  remorqueurNom?: string;
  localisationDepart?: string;
}

@Component({
  selector: 'app-sinistre-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/client/sinistres" class="text-gray-400 hover:text-gray-600">← Mes sinistres</a>
        @if (sinistre()) {
          <h1 class="text-xl font-bold text-gray-900">{{ sinistre()!.reference }}</h1>
          <span class="text-xs px-2 py-1 rounded-full {{ statusColor(sinistre()!.statut) }}">
            {{ statusLabel(sinistre()!.statut) }}
          </span>
        }
      </div>

      @if (sinistre()) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Type</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.typeSinistre }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Date</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.dateSinistre | date:'dd/MM/yyyy' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Véhicule</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.vehiculeImmatriculation }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Gouvernorat</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.gouvernorat }}</p>
          </div>
          @if (sinistre()!.garageNom) {
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Garage</p>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.garageNom }}</p>
            </div>
          }
          @if (sinistre()!.expertNom) {
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Expert</p>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.expertNom }}</p>
            </div>
          }
          <div class="col-span-2">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Description</p>
            <p class="text-sm text-gray-700 mt-1">{{ sinistre()!.description }}</p>
          </div>
          @if (sinistre()!.motifRejet) {
            <div class="col-span-2 bg-red-50 rounded-lg p-3">
              <p class="text-xs text-red-500 font-medium">Motif :</p>
              <p class="text-sm text-red-700 mt-1">{{ sinistre()!.motifRejet }}</p>
            </div>
          }
        </div>

        <div class="flex gap-3">
          <button type="button" (click)="ouvrirSuivi()"
              class="gat-action-button gat-action-primary text-white px-4 py-2 rounded-lg text-sm">
            Suivre mon dossier
          </button>
          @if (!sinistre()!.garageId) {
            <a [routerLink]="['/client/sinistres', sinistre()!.id, 'garages']"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Choisir un garage
            </a>
          }
          <a [routerLink]="['/client/sinistres', sinistre()!.id, 'forum']"
             class="gat-action-button gat-action-close text-white px-4 py-2 rounded-lg text-sm">
            💬 Forum
          </a>
        </div>
      } @else {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>

    @if (popupSuivi()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
           (click)="fermerSuivi()">
        <div class="gat-followup-popup w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="mb-3 flex items-center gap-2">
                <img src="assets/logo%20gat.png" alt="GAT Assurances" class="h-9 w-auto object-contain" />
                <span class="h-8 w-px bg-[#E8E2F0]"></span>
                <p class="text-xs font-bold uppercase tracking-wide text-[#6B2D8B]">Suivi du dossier</p>
              </div>
              <h2 class="mt-1 text-xl font-bold text-gray-900">{{ sinistre()!.reference }}</h2>
            </div>
            <button type="button" (click)="fermerSuivi()" aria-label="Fermer"
                    class="text-2xl leading-none text-gray-400 hover:text-gray-700">&times;</button>
          </div>
          <div class="gat-followup-content mt-5 space-y-3 rounded-xl p-4 text-sm">
            <p><strong>État actuel du dossier :</strong> {{ statusLabel(sinistre()!.statut) }}</p>
            @if (missionSuivi(); as mission) {
              <p><strong>Réparation :</strong> {{ missionLabel(mission.statut) }}</p>
              <div class="mt-3 border-t border-gray-200 pt-3">
                <p class="font-semibold text-gray-900">Facture finale</p>
                @if (mission.facture || mission.montantFacture || mission.statut === 'FACTURE_DEPOSEE') {
                  <p class="mt-1 text-green-700"><strong>État :</strong> Déposée</p>
                  @if (mission.montantFacture) {
                    <p class="mt-1 text-green-700"><strong>Montant :</strong> {{ mission.montantFacture | number:'1.3-3' }} TND</p>
                  }
                  @if (mission.facture) {
                    <p class="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-gray-700">{{ mission.facture }}</p>
                  }
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" (click)="voirFacture(mission)"
                            class="gat-action-button gat-action-primary rounded-lg px-3 py-2 text-xs font-semibold text-white">
                      Voir / imprimer
                    </button>
                    <button type="button" (click)="enregistrerFacture(mission)"
                            class="gat-action-button gat-action-success rounded-lg px-3 py-2 text-xs font-semibold text-white">
                      Enregistrer la facture
                    </button>
                  </div>
                } @else {
                  <p class="mt-1 text-amber-700"><strong>État :</strong> En attente de dépôt par le garage</p>
                  <p class="mt-1 text-xs text-gray-500">Les actions d'impression et d'enregistrement seront disponibles après le dépôt.</p>
                }
              </div>
            } @else {
              <p><strong>Facture finale :</strong> En attente de dépôt</p>
            }
            <p><strong>Véhicule :</strong> {{ sinistre()!.vehiculeImmatriculation }}</p>
            <p><strong>Garage :</strong> {{ missionSuivi()?.garageNom || sinistre()!.garageNom || 'En attente d’affectation' }}</p>
            <p><strong>Expert :</strong> {{ missionSuivi()?.expertNom || sinistre()!.expertNom || 'Pas encore affecté' }}</p>
            @if (remorqueurSuivi(); as remorqueur) {
              <div class="mt-3 border-t border-[#E8E2F0] pt-3">
                <p><strong>Remorqueur :</strong> {{ remorqueur.prenom }} {{ remorqueur.nom }}</p>
                <p class="mt-1 flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full" [class]="remorqueurEtatClass()"></span>
                  <strong>État du remorqueur :</strong> {{ remorqueurEtatLabel() }}
                </p>
                @if (remorqueur.localisation) {
                  <p class="mt-1 text-xs text-gray-500">Position déclarée : {{ remorqueur.localisation }}</p>
                }
                <p class="mt-1 text-xs text-gray-500">Dernière actualisation : en temps réel</p>
              </div>
            }
          </div>
          <p class="mt-4 text-sm text-gray-600">Les prochaines mises à jour vous seront envoyées dans vos notifications.</p>
          <button type="button" (click)="fermerSuivi()"
            class="gat-action-button gat-action-close mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white">
            Fermer
          </button>
        </div>
      </div>
    }
  `
})
export class SinistreDetailComponent implements OnInit {
  sinistre = signal<Sinistre | null>(null);
  missionSuivi = signal<MissionSuivi | null>(null);
  remorqueurSuivi = signal<RemorqueurSuivi | null>(null);
  popupSuivi = signal(false);
  constructor(private route: ActivatedRoute, private sinistreService: SinistreService, private http: HttpClient) {}
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sinistreService.findById(id).subscribe(s => {
      this.sinistre.set(s);
      this.http.get<RemorquageSuivi[]>(`${API}/remorquages/par-sinistre/${id}`).subscribe({
        next: demandes => {
          const demande = demandes?.[demandes.length - 1];
          this.chargerRemorqueur(demande?.remorqueurId ?? s.remorqueurId);
        }
      });
      this.http.get<MissionSuivi[]>(`${API}/missions/par-sinistre/${id}`).subscribe({
        next: missions => {
          this.selectionnerMission(missions, s.remorqueurId);
        },
        error: () => this.missionSuivi.set(null)
      });
    });
  }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
  ouvrirSuivi(): void {
    this.popupSuivi.set(true);
    this.chargerMission(this.sinistre()?.id);
  }
  fermerSuivi(): void { this.popupSuivi.set(false); }
  missionLabel(statut: string): string {
    return statut.replace(/_/g, ' ').toLowerCase().replace(/^\w/, first => first.toUpperCase());
  }

  private chargerMission(sinistreId?: number): void {
    if (!sinistreId) return;
    this.http.get<MissionSuivi[]>(`${API}/missions/par-sinistre/${sinistreId}`).subscribe({
      next: missions => this.selectionnerMission(missions, this.sinistre()?.remorqueurId),
      error: () => this.missionSuivi.set(null)
    });
  }

  private selectionnerMission(missions: MissionSuivi[] | null | undefined, remorqueurId?: number): void {
    const candidates = (missions ?? []).filter(m => !m.typeMission || m.typeMission === 'REPARATION');
    const mission = [...candidates]
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      .find(m => !!m.facture || !!m.montantFacture || m.statut === 'FACTURE_DEPOSEE')
      ?? candidates[0]
      ?? missions?.[missions.length - 1]
      ?? null;
    this.missionSuivi.set(mission);
    this.chargerRemorqueur(mission?.remorqueurId ?? remorqueurId);
  }

  private chargerRemorqueur(remorqueurId?: number): void {
    if (!remorqueurId) return;
    this.http.get<RemorqueurSuivi>(`${API}/remorqueurs/${remorqueurId}`).pipe(take(1))
      .subscribe({ next: remorqueur => this.remorqueurSuivi.set(remorqueur) });
  }

  remorqueurEtatLabel(): string {
    const mission = this.missionSuivi()?.statut;
    if (mission && !['LIVRE', 'ANNULE'].includes(mission)) return 'En intervention';
    return this.remorqueurSuivi()?.disponibilite ? 'Disponible' : 'Indisponible';
  }

  remorqueurEtatClass(): string {
    const etat = this.remorqueurEtatLabel();
    return etat === 'Disponible' ? 'bg-green-500' : etat === 'En intervention' ? 'bg-[#F5A623]' : 'bg-red-500';
  }

  voirFacture(mission: MissionSuivi): void {
    const factureWindow = window.open('', '_blank', 'width=800,height=700');
    if (!factureWindow) return;
    factureWindow.document.write(`<!doctype html><html><head><title>Facture finale - ${this.sinistre()?.reference}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#172033}header{display:flex;align-items:center;gap:16px;border-bottom:4px solid #6B2D8B;padding-bottom:18px;margin-bottom:26px}header img{width:110px;height:auto}h1{color:#6B2D8B;margin:0} .amount{color:#E5162A;font-size:20px;font-weight:700}pre{white-space:pre-wrap;font:16px Arial;line-height:1.6;background:#f8f7fb;padding:18px;border-left:5px solid #E5162A}hr{border:0;border-top:1px solid #ddd}</style>
      </head><body><header><img src="${window.location.origin}/assets/logo%20gat.png" alt="GAT Assurances"><div><h1>Facture finale</h1><small>GAT Assurances</small></div></header><p><strong>Dossier :</strong> ${this.sinistre()?.reference}</p>
      <p><strong>Garage :</strong> ${mission.garageNom ?? '—'}</p><p><strong>Expert :</strong> ${mission.expertNom ?? '—'}</p>
      <p class="amount">Montant : ${mission.montantFacture?.toFixed(3) ?? '—'} TND</p><hr><pre>${mission.facture}</pre>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    factureWindow.document.close();
  }

  enregistrerFacture(mission: MissionSuivi): void {
    const contenu = `FACTURE FINALE\nDossier : ${this.sinistre()?.reference}\nGarage : ${mission.garageNom ?? '—'}\nExpert : ${mission.expertNom ?? '—'}\nMontant : ${mission.montantFacture?.toFixed(3) ?? '—'} TND\n\n${mission.facture ?? ''}`;
    const url = URL.createObjectURL(new Blob([contenu], { type: 'text/plain;charset=utf-8' }));
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `facture-${this.sinistre()?.reference ?? 'dossier'}.txt`;
    lien.click();
    URL.revokeObjectURL(url);
  }
}
