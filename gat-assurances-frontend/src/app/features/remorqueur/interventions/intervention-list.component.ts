import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DemandeRemorquage } from '../../../core/models/remorqueur.model';
import { interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-4">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Mes interventions</h1>
        <p class="text-sm text-gray-500">Acceptez une demande, prenez le véhicule en photo et suivez chaque étape.</p>
      </div>

      @if (erreur()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erreur() }}</div>
      }

      <!-- Demandes disponibles -->
      <div class="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
        <h2 class="font-semibold text-amber-700 mb-3">🔔 Demandes disponibles</h2>
        @if (pending().length === 0) {
          <p class="text-gray-400 text-sm">Aucune demande disponible pour le moment.</p>
        } @else {
          <div class="space-y-3">
            @for (d of pending(); track d.id) {
              <div class="flex flex-col gap-3 p-3 bg-amber-50 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ d.sinistreReference }}</p>
                  <p class="text-sm text-gray-600">De : {{ d.localisationDepart }}</p>
                  <p class="text-sm text-gray-600">Vers : {{ d.localisationDestination }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="accepter(d.id)" [disabled]="traitementId() === d.id"
                      class="gat-action-button gat-action-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                    Accepter
                  </button>
                  <button (click)="refuser(d.id)" [disabled]="traitementId() === d.id"
                      class="gat-action-button gat-action-refuse text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                    Refuser
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Missions actives -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 class="font-semibold text-gray-800 mb-3">Mes missions et leur traçabilité</h2>
        @if (missions().length === 0) {
          <p class="text-gray-400 text-sm">Aucune mission active.</p>
        } @else {
          <div class="space-y-3">
            @for (m of missions(); track m.id) {
              <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                  <p class="font-medium text-gray-900">{{ m.sinistreReference }}</p>
                  <p class="text-sm text-gray-600">Prise en charge : {{ m.localisationDepart }}</p>
                  <p class="text-sm text-gray-600">Destination : {{ m.localisationDestination }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ statutLabel(m.statut) }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" [class]="statutClass(m.statut)">
                    {{ statutLabel(m.statut) }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  @for (etape of etapes; track etape.value; let i = $index) {
                    <div class="h-2 flex-1 rounded-full" [class]="isEtapeAtteinte(m.statut, etape.value) ? 'bg-green-500' : 'bg-gray-200'"></div>
                  }
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-3 lg:grid-cols-6">
                  @for (etape of etapes; track etape.value) {
                    <span [class]="isEtapeAtteinte(m.statut, etape.value)
                      ? 'font-semibold text-green-700' : 'text-gray-400'">
                      {{ isEtapeAtteinte(m.statut, etape.value) ? '✓' : '○' }} {{ etape.label }}
                    </span>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  @if (nextStatus(m.statut); as next) {
                    <button (click)="preparerAvancement(m, next)"
                        class="gat-action-button gat-action-primary text-white px-3 py-1.5 rounded-lg text-xs">
                      {{ actionLabel(next) }}
                    </button>
                  }
                  @if (m.statut === 'EN_ATTENTE') {
                    <button (click)="accepter(m.id)" class="gat-action-button gat-action-primary text-white px-3 py-1.5 rounded-lg text-xs">Accepter</button>
                    <button (click)="refuser(m.id)" class="gat-action-button gat-action-refuse text-white px-3 py-1.5 rounded-lg text-xs">Refuser</button>
                  }
                </div>
                @if (m.statut === 'LIVRE') {
                  <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    Véhicule livré au garage. Le garage peut maintenant commencer la réparation.
                  </div>
                }
                @if (m.statut === 'ARRIVE_SUR_PLACE' || m.statut === 'VEHICULE_CHARGE') {
                  <div class="border-t border-gray-200 pt-3 space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Photos de prise en charge
                      <span class="font-normal text-gray-400">(avant le transport)</span>
                    </label>
                    <input type="file" multiple accept="image/*" capture="environment"
                           (change)="selectionnerPhotos(m.id, $event)"
                           class="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
                    @if (photosSelectionnees(m.id).length > 0) {
                      <div class="flex flex-wrap gap-2">
                        @for (photo of photosSelectionnees(m.id); track photo.name) {
                          <img [src]="photo.preview" [alt]="photo.name"
                               class="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                        }
                      </div>
                    }
                    @if (m.statut === 'ARRIVE_SUR_PLACE') {
                      <button (click)="confirmerPriseEnCharge(m)"
                              [disabled]="photosSelectionnees(m.id).length === 0 || traitementId() === m.id"
                              class="gat-action-button gat-action-success text-white px-3 py-1.5 rounded-lg text-xs disabled:cursor-not-allowed disabled:opacity-50">
                        {{ traitementId() === m.id ? 'Enregistrement...' : 'Confirmer la prise en charge' }}
                      </button>
                    }
                    @if (m.photosIntervention) {
                      <div class="flex flex-wrap gap-2">
                        @for (photo of photosSauvegardees(m.photosIntervention); track photo) {
                          <img [src]="photo" alt="Photo de prise en charge"
                               class="h-16 w-16 rounded-lg object-cover border border-green-200" />
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class InterventionListComponent implements OnInit {
  pending  = signal<DemandeRemorquage[]>([]);
  missions = signal<DemandeRemorquage[]>([]);
  photosParMission = signal<Record<number, { name: string; preview: string; file: File }[]>>({});
  traitementId = signal<number | null>(null);
  erreur = signal<string | null>(null);
  etapes = [
    { value: 'ACCEPTE', label: 'Acceptée' },
    { value: 'EN_ROUTE', label: 'En route' },
    { value: 'ARRIVE_SUR_PLACE', label: 'Sur place' },
    { value: 'VEHICULE_CHARGE', label: 'Chargé' },
    { value: 'EN_TRANSIT', label: 'En transit' },
    { value: 'LIVRE', label: 'Livrée' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<DemandeRemorquage[]>('http://localhost:8081/api/remorquages/en-attente'))
    ).subscribe({ next: (r) => this.pending.set(Array.isArray(r) ? r : []), error: () => this.pending.set([]) });

    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<DemandeRemorquage[]>('http://localhost:8081/api/remorquages/mes-missions'))
    ).subscribe({ next: (r) => this.missions.set(Array.isArray(r) ? r : []), error: () => this.missions.set([]) });
  }

  accepter(id: number): void {
    this.traitementId.set(id); this.erreur.set(null);
    this.http.put<DemandeRemorquage>(`http://localhost:8081/api/remorquages/${id}/accepter`, {}).subscribe({
      next: () => { this.traitementId.set(null); this.ngOnInit(); },
      error: e => { this.traitementId.set(null); this.erreur.set(e.error?.message ?? 'Impossible d’accepter cette demande.'); }
    });
  }

  refuser(id: number): void {
    this.traitementId.set(id); this.erreur.set(null);
    this.http.put<DemandeRemorquage>(`http://localhost:8081/api/remorquages/${id}/refuser`, {}).subscribe({
      next: () => { this.traitementId.set(null); this.ngOnInit(); },
      error: e => { this.traitementId.set(null); this.erreur.set(e.error?.message ?? 'Impossible de refuser cette demande.'); }
    });
  }

  preparerAvancement(mission: DemandeRemorquage, statut: string): void {
    if (statut === 'VEHICULE_CHARGE') {
      this.confirmerPriseEnCharge(mission);
      return;
    }
    this.avancer(mission.id, statut);
  }

  selectionnerPhotos(id: number, event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? [])
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 5);
    const photos = files.map(file => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    this.photosParMission.update(current => ({ ...current, [id]: photos }));
  }

  photosSelectionnees(id: number): { name: string; preview: string; file: File }[] {
    return this.photosParMission()[id] ?? [];
  }

  confirmerPriseEnCharge(mission: DemandeRemorquage): void {
    const photos = this.photosSelectionnees(mission.id);
    if (photos.length === 0) return;

    this.traitementId.set(mission.id);
    Promise.all(photos.map(photo => this.lirePhoto(photo.file))).then(images => {
        this.avancer(mission.id, 'VEHICULE_CHARGE', JSON.stringify(images));
    }).finally(() => this.traitementId.set(null));
  }

    photosSauvegardees(photos: string): string[] {
      try {
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) ? parsed : [photos];
      } catch {
        return photos ? [photos] : [];
      }
    }

  private lirePhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  avancer(id: number, statut: string, photos?: string): void {
    this.traitementId.set(id); this.erreur.set(null);
    this.http.put<DemandeRemorquage>(
      `http://localhost:8081/api/remorquages/${id}/avancer`,
      { photos }, { params: { statut } }
    ).subscribe({
      next: () => { this.traitementId.set(null); this.ngOnInit(); },
      error: e => { this.traitementId.set(null); this.erreur.set(e.error?.message ?? 'Impossible de mettre à jour la mission.'); }
    });
  }

  statutLabel(statut: string): string {
    return this.etapes.find(e => e.value === statut)?.label ?? (statut === 'ANNULE' ? 'Annulée' : 'En attente');
  }

  statutClass(statut: string): string {
    if (statut === 'LIVRE') return 'bg-green-100 text-green-700';
    if (statut === 'ANNULE') return 'bg-red-100 text-red-700';
    if (statut === 'EN_ATTENTE') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  }

  isEtapeAtteinte(statut: string, etape: string): boolean {
    const current = this.etapes.findIndex(e => e.value === statut);
    const target = this.etapes.findIndex(e => e.value === etape);
    return current >= target && current >= 0;
  }

  nextStatus(statut: string): string | null {
    const index = this.etapes.findIndex(e => e.value === statut);
    if (index < 0 || index >= this.etapes.length - 1) return null;
    return this.etapes[index + 1].value;
  }

  actionLabel(statut: string): string {
    return `Marquer : ${this.statutLabel(statut)}`;
  }
}
