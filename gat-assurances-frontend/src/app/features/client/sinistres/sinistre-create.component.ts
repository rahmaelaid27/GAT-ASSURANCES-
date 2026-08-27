import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface Vehicule { id:number; immatriculation:string; marque:string; modele:string; annee:number; typeVehicule:string; }
interface Partenaire { id:number; nom:string; prenom:string; disponibilite:boolean; note?:number; }

@Component({
  selector: 'app-sinistre-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="min-h-screen p-6 animate-fade-in" style="background:#F8F7FB">
  <div class="max-w-3xl mx-auto">

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button (click)="router.navigate(['/client/sinistres'])"
              class="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Déclarer un sinistre</h1>
        <p class="text-gray-500 text-sm">Remplissez tous les champs requis</p>
      </div>
    </div>

    <!-- Étapes -->
    <div class="flex items-center gap-2 mb-6">
      @for (s of steps; track s.n) {
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
               [style.background]="step >= s.n ? 'linear-gradient(135deg,#6B2D8B,#E5162A)' : '#E8E2F0'"
               [style.color]="step >= s.n ? '#fff' : '#9CA3AF'">
            {{ s.n }}
          </div>
          @if (!$last) {
            <div class="w-12 h-0.5 rounded" [style.background]="step > s.n ? 'linear-gradient(90deg,#6B2D8B,#E5162A)' : '#E8E2F0'"></div>
          }
        </div>
      }
      <div class="ml-3 text-sm font-medium text-gray-600">{{ steps[step-1] ? steps[step-1].label : '' }}</div>
    </div>

    @if (error()) {
      <div class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">

      <!-- ÉTAPE 1 : Identité & Véhicule -->
      @if (step === 1) {
        <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-bold"
                style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">1</span>
          Identité &amp; Véhicule
        </h3>

        <!-- CIN -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Numéro CIN <span class="text-red-500">*</span>
          </label>
          <input type="text" [(ngModel)]="form.cin" name="cin" required maxlength="8"
                 placeholder="12345678"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10 bg-gray-50 focus:bg-white transition-all"/>
        </div>

        <!-- Immatriculation — saisie libre + sélection rapide depuis la liste -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Immatriculation du véhicule <span class="text-red-500">*</span>
          </label>

          <!-- Saisie libre -->
          <input type="text"
                 [(ngModel)]="form.vehiculeImmatriculation"
                 name="vehicule" required
                 placeholder="Ex: 123TU456"
                 autocomplete="off"
                 (input)="onImmatInput()"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                        focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10
                        bg-gray-50 focus:bg-white transition-all uppercase font-mono tracking-wider"/>

          <!-- Info véhicule si immat reconnue -->
          @if (vehiculeSelectionne()) {
            <div class="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                 style="background:rgba(107,45,139,0.06);border:1px solid rgba(107,45,139,0.2)">
              <svg class="w-4 h-4 shrink-0" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-gray-700">
                <strong style="color:#6B2D8B">{{ vehiculeSelectionne()!.immatriculation }}</strong>
                — {{ vehiculeSelectionne()!.marque }} {{ vehiculeSelectionne()!.modele }} ({{ vehiculeSelectionne()!.annee }})
              </span>
            </div>
          }

          <!-- Sélection rapide depuis mes véhicules -->
          @if (vehicules().length > 0) {
            <div class="mt-3">
              <p class="text-xs text-gray-400 mb-2">Sélection rapide parmi vos véhicules enregistrés :</p>
              <div class="flex flex-wrap gap-2">
                @for (v of vehicules(); track v.id) {
                  <button type="button" (click)="selectVehicule(v)"
                          class="flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all"
                          [style.border-color]="form.vehiculeImmatriculation.toUpperCase() === v.immatriculation ? '#6B2D8B' : '#E8E2F0'"
                          [style.background]="form.vehiculeImmatriculation.toUpperCase() === v.immatriculation ? 'rgba(107,45,139,0.08)' : 'white'"
                          [style.color]="form.vehiculeImmatriculation.toUpperCase() === v.immatriculation ? '#6B2D8B' : '#374151'">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 004 0M15 17a2 2 0 004 0"/>
                    </svg>
                    {{ v.immatriculation }}
                    <span class="text-gray-400 font-normal">{{ v.marque }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- État du véhicule -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            État du véhicule <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" (click)="form.vehiculeImmobilise = false"
                    class="p-4 rounded-xl border-2 transition-all text-left"
                    [style.border-color]="form.vehiculeImmobilise === false ? '#6B2D8B' : '#E8E2F0'"
                    [style.background]="form.vehiculeImmobilise === false ? 'rgba(107,45,139,0.06)' : 'white'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🚗</span>
                <div>
                  <p class="font-semibold text-sm" [style.color]="form.vehiculeImmobilise === false ? '#6B2D8B' : '#374151'">Mobile</p>
                  <p class="text-xs text-gray-400">Le véhicule peut rouler</p>
                </div>
              </div>
            </button>
            <button type="button" (click)="form.vehiculeImmobilise = true"
                    class="p-4 rounded-xl border-2 transition-all text-left"
                    [style.border-color]="form.vehiculeImmobilise === true ? '#E5162A' : '#E8E2F0'"
                    [style.background]="form.vehiculeImmobilise === true ? 'rgba(229,22,42,0.06)' : 'white'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🚨</span>
                <div>
                  <p class="font-semibold text-sm" [style.color]="form.vehiculeImmobilise === true ? '#E5162A' : '#374151'">Immobilisé</p>
                  <p class="text-xs text-gray-400">Remorquage automatique</p>
                </div>
              </div>
            </button>
          </div>
          @if (form.vehiculeImmobilise === true) {
            <div class="mt-2 flex items-center gap-2 p-3 rounded-xl text-xs text-amber-700"
                 style="background:#FFF3CD;border:1px solid #F5C518">
              🚛 Un remorqueur sera automatiquement notifié pour prendre en charge votre véhicule.
            </div>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Remorqueur disponible <span class="text-gray-400 font-normal">(optionnel)</span></label>
                <select [(ngModel)]="form.remorqueurId" name="remorqueurId" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#E5162A]">
                  <option [ngValue]="null">Notifier tous les remorqueurs disponibles</option>
                  @for (r of remorqueursDisponibles(); track r.id) { <option [ngValue]="r.id">{{ r.prenom }} {{ r.nom }}{{ r.note ? ' · ' + r.note + '/5' : '' }}</option> }
                </select>
              </div>
            </div>
          }
          <div class="mt-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Expert disponible <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <select [(ngModel)]="form.expertId" name="expertId" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#6B2D8B]">
              <option [ngValue]="null">Affectation automatique</option>
              @for (e of expertsDisponibles(); track e.id) { <option [ngValue]="e.id">{{ e.prenom }} {{ e.nom }}{{ e.note ? ' · ' + e.note + '/5' : '' }}</option> }
            </select>
          </div>
        </div>
      }

      <!-- ÉTAPE 2 : Localisation & Date -->
      @if (step === 2) {
        <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-bold"
                style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">2</span>
          Localisation &amp; Date
        </h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Date du sinistre <span class="text-red-500">*</span></label>
            <input type="date" [(ngModel)]="form.dateSinistre" name="date" required
                   [max]="today"
                   class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10 bg-gray-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Gouvernorat <span class="text-red-500">*</span></label>
            <select [(ngModel)]="form.gouvernorat" name="gouvernorat" required
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10 bg-gray-50 focus:bg-white transition-all">
              <option value="">Choisir...</option>
              @for (g of gouvernorats; track g) { <option [value]="g">{{ g }}</option> }
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Localisation précise <span class="text-red-500">*</span>
          </label>
          <input type="text" [(ngModel)]="form.localite" name="localite" required
                 placeholder="Ex: Avenue Habib Bourguiba, devant le café Central"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10 bg-gray-50 focus:bg-white transition-all"/>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Type de sinistre <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            @for (t of typesSinistre; track t.value) {
              <button type="button" (click)="form.typeSinistre = t.value"
                      class="p-3 rounded-xl border-2 text-center transition-all"
                      [style.border-color]="form.typeSinistre === t.value ? '#6B2D8B' : '#E8E2F0'"
                      [style.background]="form.typeSinistre === t.value ? 'rgba(107,45,139,0.08)' : 'white'">
                <div class="text-xl mb-1">{{ t.icon }}</div>
                <div class="text-xs font-medium" [style.color]="form.typeSinistre === t.value ? '#6B2D8B' : '#374151'">{{ t.label }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- ÉTAPE 3 : Description & Médias -->
      @if (step === 3) {
        <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-bold"
                style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">3</span>
          Description &amp; Documents
        </h3>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Description du sinistre <span class="text-red-500">*</span>
          </label>
          <textarea [(ngModel)]="form.description" name="description" required rows="4"
                    placeholder="Décrivez les circonstances du sinistre : comment cela s'est passé, l'état du véhicule, les dommages constatés..."
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/10 bg-gray-50 focus:bg-white transition-all resize-none"></textarea>
        </div>

        <!-- Photos -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Photos du sinistre <span class="text-red-500">*</span>
          </label>
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-[#6B2D8B]"
                 [style.border-color]="photos().length > 0 ? '#6B2D8B' : '#E8E2F0'"
                 [style.background]="photos().length > 0 ? 'rgba(107,45,139,0.04)' : '#FAFAFA'">
            <input type="file" multiple accept="image/*" class="hidden" (change)="onPhotos($event)"/>
            @if (photos().length === 0) {
              <svg class="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-sm text-gray-400">Cliquer pour ajouter des photos</p>
              <p class="text-xs text-gray-300 mt-1">JPG, PNG — max 10 Mo chacune</p>
            } @else {
              <p class="text-sm font-semibold" style="color:#6B2D8B">✓ {{ photos().length }} photo(s) sélectionnée(s)</p>
              <p class="text-xs text-gray-400 mt-1">Cliquer pour modifier</p>
            }
          </label>
        </div>

        <!-- Documents -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Documents justificatifs
            <span class="text-xs font-normal text-gray-400 ml-1">(PV police, constat amiable...)</span>
          </label>
          <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-[#E5162A]"
                 [style.border-color]="docs().length > 0 ? '#E5162A' : '#E8E2F0'"
                 [style.background]="docs().length > 0 ? 'rgba(229,22,42,0.04)' : '#FAFAFA'">
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" (change)="onDocs($event)"/>
            @if (docs().length === 0) {
              <p class="text-sm text-gray-400">📎 Ajouter des documents PDF/Images</p>
            } @else {
              <p class="text-sm font-semibold" style="color:#E5162A">✓ {{ docs().length }} document(s)</p>
            }
          </label>
        </div>
      }

      <!-- ÉTAPE 4 : Récapitulatif -->
      @if (step === 4) {
        <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-bold"
                style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">4</span>
          Récapitulatif &amp; Confirmation
        </h3>

        <div class="space-y-3 text-sm">
          <div class="p-4 rounded-xl" style="background:rgba(107,45,139,0.05);border:1px solid rgba(107,45,139,0.15)">
            <div class="grid grid-cols-2 gap-y-2">
              <div><span class="text-gray-500">CIN :</span> <strong>{{ form.cin }}</strong></div>
              <div><span class="text-gray-500">Véhicule :</span> <strong>{{ form.vehiculeImmatriculation }}</strong></div>
              <div><span class="text-gray-500">Date :</span> <strong>{{ form.dateSinistre | date:'dd/MM/yyyy' }}</strong></div>
              <div><span class="text-gray-500">Gouvernorat :</span> <strong>{{ form.gouvernorat }}</strong></div>
              <div><span class="text-gray-500">Type :</span> <strong>{{ form.typeSinistre }}</strong></div>
              <div><span class="text-gray-500">État véhicule :</span>
                <strong [style.color]="form.vehiculeImmobilise ? '#E5162A' : '#22c55e'">
                  {{ form.vehiculeImmobilise ? 'Immobilisé 🚨' : 'Mobile ✓' }}
                </strong>
              </div>
              <div class="col-span-2"><span class="text-gray-500">Localisation :</span> <strong>{{ form.localite }}</strong></div>
              <div class="col-span-2"><span class="text-gray-500">Description :</span> {{ form.description }}</div>
            </div>
          </div>
          <div class="flex gap-3 text-xs text-gray-500">
            <span>📷 {{ photos().length }} photo(s)</span>
            <span>📎 {{ docs().length }} document(s)</span>
          </div>
          @if (form.vehiculeImmobilise) {
            <div class="flex items-center gap-2 p-3 rounded-xl text-xs text-amber-700"
                 style="background:#FFF3CD;border:1px solid #F5C518">
              🚛 Un remorqueur sera automatiquement notifié après validation.
            </div>
          }
        </div>
      }

      <!-- Boutons navigation -->
      <div class="flex justify-between pt-4 border-t border-gray-100">
        <button type="button" (click)="prevStep()"
                [class.invisible]="step === 1"
                class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
          ← Retour
        </button>
        @if (step < 4) {
          <button type="button" (click)="nextStep()"
                  class="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  style="background:linear-gradient(135deg,#6B2D8B,#E5162A);box-shadow:0 4px 15px rgba(107,45,139,0.3)">
            Suivant →
          </button>
        } @else {
          <button type="button" (click)="submit()" [disabled]="loading()"
                  class="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center gap-2"
                  style="background:linear-gradient(135deg,#6B2D8B,#E5162A);box-shadow:0 4px 15px rgba(107,45,139,0.3)">
            @if (loading()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            ✓ Soumettre le sinistre
          </button>
        }
      </div>
    </div>
  </div>
</div>
  `
})
export class SinistreCreateComponent implements OnInit {
  private authService = inject(AuthService);
  router = inject(Router);
  private http = inject(HttpClient);

  step = 1;
  steps = [
    { n:1, label:'Identité & Véhicule' },
    { n:2, label:'Localisation & Date' },
    { n:3, label:'Description & Médias' },
    { n:4, label:'Confirmation' },
  ];

  form: any = {
    cin: '',
    vehiculeImmatriculation: '',
    vehiculeImmobilise: null,
    dateSinistre: new Date().toISOString().split('T')[0],
    gouvernorat: '',
    localite: '',
    typeSinistre: 'COLLISION',
    description: '',
    photos: '',
    documents: '',
    expertId: null,
    remorqueurId: null,
  };

  vehicules  = signal<Vehicule[]>([]);
  vehiculeInfo = signal<Vehicule | null>(null);
  experts = signal<Partenaire[]>([]);
  remorqueurs = signal<Partenaire[]>([]);
  photos     = signal<string[]>([]);
  docs       = signal<string[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  today      = new Date().toISOString().split('T')[0];

  vehiculeSelectionne() {
    const val = this.form.vehiculeImmatriculation?.toUpperCase();
    return val ? this.vehicules().find(v => v.immatriculation === val) ?? null : null;
  }

  typesSinistre = [
    { value:'COLLISION',           icon:'💥', label:'Collision' },
    { value:'VOL',                 icon:'🔓', label:'Vol' },
    { value:'INCENDIE',            icon:'🔥', label:'Incendie' },
    { value:'BRIS_GLACE',          icon:'🪟', label:'Bris de glace' },
    { value:'VANDALISME',          icon:'🔨', label:'Vandalisme' },
    { value:'CATASTROPHE_NATURELLE',icon:'🌊', label:'Catastrophe nat.' },
    { value:'ACCIDENT_TIERS',      icon:'🚗', label:'Accident tiers' },
    { value:'AUTRE',               icon:'❓', label:'Autre' },
  ];

  gouvernorats = ['Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja','Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan','Kasserine','Sidi Bouzid','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili'];

  ngOnInit(): void {
    const u = this.authService.getUser();
    if (u?.cin) this.form.cin = u.cin;
    this.http.get<Vehicule[]>('http://localhost:8081/api/vehicules/mes-vehicules')
      .subscribe({ next: v => this.vehicules.set(v), error: () => {} });
    this.http.get<Partenaire[]>('http://localhost:8081/api/experts')
      .subscribe({ next: p => this.experts.set(p), error: () => {} });
    this.http.get<Partenaire[]>('http://localhost:8081/api/remorqueurs')
      .subscribe({ next: p => this.remorqueurs.set(p), error: () => {} });
  }

  expertsDisponibles() { return this.experts().filter(p => p.disponibilite !== false); }
  remorqueursDisponibles() { return this.remorqueurs().filter(p => p.disponibilite !== false); }

  suggestions = signal<Vehicule[]>([]);

  onImmatInput(): void {
    const val = this.form.vehiculeImmatriculation.toUpperCase();
    this.form.vehiculeImmatriculation = val;
    if (val.length >= 2) {
      const filtered = this.vehicules().filter(v =>
        v.immatriculation.toUpperCase().includes(val)
      );
      this.suggestions.set(filtered);
    } else {
      this.suggestions.set([]);
    }
    // Reset info si on modifie manuellement
    const exact = this.vehicules().find(v => v.immatriculation === val);
    this.vehiculeInfo.set(exact ?? null);
  }

  selectVehicule(v: Vehicule): void {
    this.form.vehiculeImmatriculation = v.immatriculation;
    this.vehiculeInfo.set(v);
    this.suggestions.set([]);
  }

  onPhotos(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files) this.photos.set(Array.from(files).map(f => f.name));
  }
  onDocs(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files) this.docs.set(Array.from(files).map(f => f.name));
  }

  nextStep(): void {
    this.error.set(null);
    if (this.step === 1) {
      if (!this.form.cin) { this.error.set('Le CIN est obligatoire.'); return; }
      if (!this.form.vehiculeImmatriculation) { this.error.set('L\'immatriculation est obligatoire.'); return; }
      // Si le véhicule est dans la liste → OK directement. Sinon → avertir mais pas bloquer
      if (this.form.vehiculeImmobilise === null) { this.error.set('Précisez si le véhicule est mobile ou immobilisé.'); return; }
    }
    if (this.step === 2) {
      if (!this.form.dateSinistre) { this.error.set('La date est obligatoire.'); return; }
      if (!this.form.gouvernorat)  { this.error.set('Le gouvernorat est obligatoire.'); return; }
      if (!this.form.localite)     { this.error.set('La localisation est obligatoire.'); return; }
    }
    if (this.step === 3) {
      if (!this.form.description) { this.error.set('La description est obligatoire.'); return; }
    }
    this.step++;
  }

  prevStep(): void { if (this.step > 1) this.step--; }

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    const payload = {
      vehiculeImmatriculation: this.form.vehiculeImmatriculation,
      dateSinistre: this.form.dateSinistre,
      gouvernorat: this.form.gouvernorat,
      localite: this.form.localite,
      typeSinistre: this.form.typeSinistre,
      description: this.form.description,
      photos: this.photos().join(','),
      documents: this.docs().join(','),
      vehiculeImmobilise: this.form.vehiculeImmobilise,
      expertId: this.form.expertId,
      remorqueurId: this.form.remorqueurId,
    };
    this.http.post<any>('http://localhost:8081/api/sinistres', payload).subscribe({
      next: (s) => { this.loading.set(false); this.router.navigate(['/client/sinistres', s.id]); },
      error: (e) => { this.loading.set(false); this.error.set(e.error?.message ?? 'Erreur lors de la déclaration.'); }
    });
  }
}
