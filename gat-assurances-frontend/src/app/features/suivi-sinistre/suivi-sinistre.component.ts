import { Component, OnDestroy } from '@angular/core';
import { NgIf, NgForOf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Sinistre, StatutSinistre } from '@core/models/sinistre.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-suivi-sinistre',
  standalone: true,
  imports: [NgIf, NgForOf, DatePipe, RouterLink, FormsModule],
  templateUrl: './suivi-sinistre.component.html',
  styles: [
    `.badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium; }`,
    `.badge-info { @apply bg-blue-100 text-blue-800; }`,
    `.badge-warning { @apply bg-yellow-100 text-yellow-800; }`,
    `.badge-success { @apply bg-green-100 text-green-800; }`,
    `.badge-danger { @apply bg-red-100 text-red-800; }`
  ]
})
export class SuiviSinistreComponent implements OnDestroy {
  immatriculation = '';
  sinistres: Sinistre[] = [];
  loading = false;
  searched = false;
  errorMessage = '';
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastSearchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.stopPolling();
  }

  search(): void {
    const term = this.immatriculation.trim();
    if (!term) { return; }
    this.lastSearchTerm = term;
    this.loading = true;
    this.errorMessage = '';
    this.searched = false;
    this.http.get<Sinistre[]>(`${environment.apiUrl}/sinistres/suivi/${encodeURIComponent(term)}`).subscribe({
      next: (data: Sinistre[]) => {
        this.sinistres = data;
        this.loading = false;
        this.searched = true;
        this.startPolling();
      },
      error: () => {
        this.sinistres = [];
        this.loading = false;
        this.searched = true;
        this.errorMessage = 'Aucun resultat trouve pour cette immatriculation.';
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      if (this.lastSearchTerm) {
        this.http.get<Sinistre[]>(`${environment.apiUrl}/sinistres/suivi/${encodeURIComponent(this.lastSearchTerm)}`).subscribe({
          next: (data: Sinistre[]) => {
            const oldStatuses: (StatutSinistre | undefined)[] = this.sinistres.map((s: Sinistre) => s.statut);
            this.sinistres = data;
            data.forEach((s: Sinistre, i: number) => {
              if (oldStatuses[i] && oldStatuses[i] !== s.statut) {
                Swal.fire({
                  icon: 'info',
                  title: 'Mise a jour statut',
                  text: `Le sinistre ${s.reference} est maintenant: ${this.getStatusLabel(s.statut)}`,
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 5000,
                  confirmButtonColor: '#5E2B8A'
                });
              }
            });
          }
        });
      }
    }, 10000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getStatusClass(statut: StatutSinistre | undefined): string {
    const map: Record<string, string> = {
      'DECLARE': 'badge-info',
      'EN_COURS': 'badge-warning',
      'EN_EXPERTISE': 'badge-warning',
      'ACCEPTE': 'badge-success',
      'REFUSE': 'badge-danger',
      'REMBOURSE': 'badge-success',
      'CLOTURE': 'badge-info'
    };
    const key = statut || '';
    return map[key] || 'badge-info';
  }

  getStatusLabel(statut: StatutSinistre | undefined): string {
    const map: Record<string, string> = {
      'DECLARE': 'Declare',
      'EN_COURS': 'En cours',
      'EN_EXPERTISE': 'En expertise',
      'ACCEPTE': 'Accepte',
      'REFUSE': 'Refuse',
      'REMBOURSE': 'Rembourse',
      'CLOTURE': 'Cloture'
    };
    const key = statut || '';
    return map[key] || key || 'N/A';
  }
}
