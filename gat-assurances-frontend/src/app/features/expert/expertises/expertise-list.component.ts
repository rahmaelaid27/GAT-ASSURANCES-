import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Mission } from '../../../core/models/mission.model';

@Component({
  selector: 'app-expertise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-4">
      <h1 class="text-xl font-bold text-gray-900">Mes expertises</h1>
      @for (m of missions(); track m.id) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                    flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-900">{{ m.sinistreReference }}</p>
            <p class="text-sm text-gray-500">{{ m.statut }}
              @if (m.dateExpertisePrevue) { — Prévu le {{ m.dateExpertisePrevue | date:'dd/MM/yyyy HH:mm' }} }
            </p>
          </div>
          <div class="flex gap-3">
            <a [routerLink]="['/expert/expertises', m.id]" class="text-blue-600 hover:underline text-sm">Gérer</a>
            <a [routerLink]="['/expert/expertises', m.id, 'forum']" class="text-indigo-600 hover:underline text-sm">Forum</a>
          </div>
        </div>
      }
    </div>
  `
})
export class ExpertiseListComponent implements OnInit {
  missions = signal<Mission[]>([]);
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<Mission[]>('http://localhost:8081/api/missions/mes-missions')
      .subscribe(m => this.missions.set(m));
  }
}
