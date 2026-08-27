import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-6 space-y-6 animate-fade-in">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
      <p class="text-gray-500 text-sm mt-1">{{ users().length }} comptes enregistrés</p>
    </div>
    <div class="flex items-center gap-3">
      <input type="text" [(ngModel)]="search" placeholder="Rechercher..."
             class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6B2D8B] bg-gray-50"/>
    </div>
  </div>

  <!-- Tableau -->
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50">
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Utilisateur</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Rôle</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Statut</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Inscrit le</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        @for (u of filteredUsers(); track u.id) {
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                     [style.background]="roleColor(u.role)">
                  {{ (u.prenom ?? '?').charAt(0) }}{{ (u.nom ?? '').charAt(0) }}
                </div>
                <span class="font-medium text-gray-900">{{ u.prenom }} {{ u.nom }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-gray-500">{{ u.email }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
                    [style.background]="roleColor(u.role)">
                {{ u.role }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                    [style.background]="u.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)'"
                    [style.color]="u.enabled ? '#16a34a' : '#6b7280'">
                {{ u.enabled ? '✓ Actif' : '✗ Inactif' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-gray-400 text-xs">
              {{ u.createdAt | date:'dd/MM/yyyy' }}
            </td>
            <td class="px-5 py-3.5">
              <div class="flex gap-2">
                <button (click)="toggleUser(u)"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        [style.border-color]="u.enabled ? '#E5162A' : '#22c55e'"
                        [style.color]="u.enabled ? '#E5162A' : '#16a34a'">
                  {{ u.enabled ? 'Désactiver' : 'Activer' }}
                </button>
              </div>
            </td>
          </tr>
        }
        @if (users().length === 0) {
          <tr><td colspan="6" class="text-center py-14 text-gray-400">
            <div class="flex flex-col items-center gap-2">
              <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Chargement des utilisateurs...
            </div>
          </td></tr>
        }
      </tbody>
    </table>
  </div>

  <!-- Stats rapides -->
  @if (users().length > 0) {
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      @for (stat of roleStats(); track stat.role) {
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               [style.background]="'rgba(0,0,0,0.06)'">
            <span class="text-sm font-black" [style.color]="roleColor(stat.role)">{{ stat.count }}</span>
          </div>
          <div>
            <p class="text-xs text-gray-500">{{ stat.role }}</p>
          </div>
        </div>
      }
    </div>
  }
</div>
  `
})
export class UtilisateurListComponent implements OnInit {
  users  = signal<any[]>([]);
  search = '';
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8081/api/admin/utilisateurs')
      .subscribe({ next: u => this.users.set(u), error: () => this.users.set([]) });
  }

  filteredUsers(): any[] {
    const q = this.search.toLowerCase();
    return q ? this.users().filter(u =>
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.nom ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q)
    ) : this.users();
  }

  roleStats(): { role: string; count: number }[] {
    const counts: Record<string, number> = {};
    this.users().forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  }

  toggleUser(u: any): void {
    this.http.put<any>(`http://localhost:8081/api/admin/utilisateurs/${u.id}/toggle`, {})
      .subscribe({ next: res => u.enabled = res.enabled, error: () => {} });
  }

  roleColor(role: string): string {
    const m: Record<string, string> = {
      ADMIN: '#C4187A', MANAGER: '#6B2D8B', GESTIONNAIRE: '#E5162A',
      CLIENT: '#16a34a', GARAGE: '#D4891A', EXPERT: '#0ea5e9', REMORQUEUR: '#6b7280'
    };
    return m[role] ?? '#6B2D8B';
  }
}
