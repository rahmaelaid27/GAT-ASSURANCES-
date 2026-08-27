import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Partenaire {
  id: number; type: string; nom: string; email: string | null;
  telephone: string | null; statut: string; note: number | null; ville: string | null;
}

@Component({
  selector: 'app-partenaire-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-6 space-y-6 animate-fade-in">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Partenaires</h1>
      <p class="text-gray-500 text-sm mt-1">Garages, experts et remorqueurs — {{ all().length }} au total</p>
    </div>
    <!-- Filtres par type -->
    <div class="flex gap-2">
      @for (t of ['TOUS','GARAGE','EXPERT','REMORQUEUR']; track t) {
        <button (click)="filter = t"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                [style.background]="filter === t ? '#6B2D8B' : 'white'"
                [style.color]="filter === t ? 'white' : '#374151'"
                [style.border-color]="filter === t ? '#6B2D8B' : '#E8E2F0'">
          {{ t }}
        </button>
      }
    </div>
  </div>

  <!-- Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    @for (p of filtered(); track p.id + p.type) {
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="typeBg(p.type)">
              <span class="text-lg">{{ typeIcon(p.type) }}</span>
            </div>
            <div>
              <p class="font-bold text-gray-900 text-sm">{{ p.nom }}</p>
              <p class="text-xs text-gray-400">{{ p.ville }}</p>
            </div>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                [style.background]="statutBg(p.statut)"
                [style.color]="statutColor(p.statut)">
            {{ p.statut }}
          </span>
        </div>
        <div class="space-y-1.5 text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ p.email ?? 'N/A' }}
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            {{ p.telephone ?? 'N/A' }}
          </div>
          @if (p.note != null) {
            <div class="flex items-center gap-1.5 mt-2">
              <span style="color:#F5A623">★</span>
              <span class="font-semibold text-gray-700">{{ p.note | number:'1.1-1' }}</span>
              <span class="text-gray-400">/ 5</span>
            </div>
          }
        </div>
        <div class="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5">
          <span class="text-xs px-2 py-1 rounded-lg font-semibold text-white"
                [style.background]="typeColor(p.type)">
            {{ p.type }}
          </span>
        </div>
      </div>
    }
    @if (filtered().length === 0 && !loading()) {
      <div class="col-span-3 flex flex-col items-center justify-center py-16 text-center">
        <p class="text-gray-400 font-semibold">Aucun partenaire trouvé</p>
      </div>
    }
  </div>

</div>
  `
})
export class PartenaireListComponent implements OnInit {
  all     = signal<Partenaire[]>([]);
  loading = signal(true);
  filter  = 'TOUS';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Partenaire[]>('http://localhost:8081/api/admin/partenaires')
      .subscribe({
        next: p => { this.all.set(p); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  filtered(): Partenaire[] {
    return this.filter === 'TOUS' ? this.all() : this.all().filter(p => p.type === this.filter);
  }

  typeIcon(t: string): string { return { GARAGE:'🔧', EXPERT:'🔍', REMORQUEUR:'🚛' }[t] ?? '❓'; }
  typeBg(t: string): string {
    return { GARAGE:'rgba(245,166,35,0.1)', EXPERT:'rgba(14,165,233,0.1)', REMORQUEUR:'rgba(107,114,128,0.1)' }[t] ?? 'rgba(107,45,139,0.1)';
  }
  typeColor(t: string): string {
    return { GARAGE:'#D4891A', EXPERT:'#0ea5e9', REMORQUEUR:'#6b7280' }[t] ?? '#6B2D8B';
  }
  statutBg(s: string): string {
    return (s === 'ACTIF' || s === 'DISPONIBLE') ? 'rgba(34,197,94,0.1)' : 'rgba(229,22,42,0.1)';
  }
  statutColor(s: string): string {
    return (s === 'ACTIF' || s === 'DISPONIBLE') ? '#16a34a' : '#E5162A';
  }
}
