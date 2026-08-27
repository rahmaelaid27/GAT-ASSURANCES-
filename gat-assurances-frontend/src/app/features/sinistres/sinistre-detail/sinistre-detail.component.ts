import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sinistre-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, NgForOf, NgIf],
  templateUrl: './sinistre-detail.component.html',
  styles: [`
    .badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium; }
    .badge-info { @apply bg-blue-100 text-blue-800; }
    .badge-warning { @apply bg-yellow-100 text-yellow-800; }
    .badge-success { @apply bg-green-100 text-green-800; }
    .badge-danger { @apply bg-red-100 text-red-800; }
  `]
})
export class SinistreDetailComponent implements OnInit {
  sinistre?: any;
  missions: any[] = [];
  loading = false;
  canChangeStatus = false;
  availableStatuses: string[] = ['EN_COURS', 'EN_EXPERTISE', 'ACCEPTE', 'REFUSE', 'REMBOURSE', 'CLOTURE'];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    const user: any = this.authService.getCurrentUser();
    this.canChangeStatus = user?.role === 'ADMIN' || user?.role === 'GESTIONNAIRE';
    if (id) {
      this.api.getById<any>('sinistres', +id).subscribe({
        next: (data: any) => {
          this.sinistre = data;
          if (data.missions) { this.missions = data.missions; }
        }
      });
    }
  }

  changeStatut(statut: string): void {
    if (!this.sinistre) { return; }
    if (statut === 'REFUSE') {
      Swal.fire({
        title: 'Refuser le sinistre ?',
        text: 'Etes-vous sur de vouloir refuser le sinistre ' + this.sinistre.reference + ' ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C2173F',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Oui, refuser',
        cancelButtonText: 'Annuler'
      }).then((r: any) => { if (r.isConfirmed) { this.updateStatut(statut); } });
      return;
    }
    if (statut === 'ACCEPTE') {
      this.loading = true;
      this.api.getById<any>('sinistres', this.sinistre.id).subscribe({
        next: (data: any) => {
          this.loading = false;
          const mList: any[] = data.missions || [];
          const garages: any[] = mList.filter((m: any) => m.typeMission === 'REPARATION');
          const experts: any[] = mList.filter((m: any) => m.typeMission === 'EXPERTISE');
          const remorq: any[] = mList.filter((m: any) => m.typeMission === 'REMORQUAGE');
          let html: string = '<div style="text-align:left;font-family:Poppins,sans-serif;">';
          html += '<div style="margin-bottom:12px;padding:12px;background:#f3f0ff;border-radius:12px;border-left:4px solid #5E2B8A;"><h4 style="margin:0 0 8px;color:#5E2B8A;font-size:14px;font-weight:700;">Garage(s) assigne(s)</h4>';
          garages.forEach((m: any) => html += '<p style="margin:4px 0;font-size:13px;color:#374151;">&bull; ' + (m.garageNom || 'N/A') + '</p>');
          if (!garages.length) { html += '<p style="margin:4px 0;font-size:13px;color:#9CA3AF;">Aucun garage assigne</p>'; }
          html += '</div>';
          html += '<div style="margin-bottom:12px;padding:12px;background:#fff0f5;border-radius:12px;border-left:4px solid #C2173F;"><h4 style="margin:0 0 8px;color:#C2173F;font-size:14px;font-weight:700;">Expert(s) assigne(s)</h4>';
          experts.forEach((m: any) => html += '<p style="margin:4px 0;font-size:13px;color:#374151;">&bull; ' + (m.expertNom || 'N/A') + '</p>');
          if (!experts.length) { html += '<p style="margin:4px 0;font-size:13px;color:#9CA3AF;">Aucun expert assigne</p>'; }
          html += '</div>';
          html += '<div style="margin-bottom:12px;padding:12px;background:#fff7ed;border-radius:12px;border-left:4px solid #F35A22;"><h4 style="margin:0 0 8px;color:#F35A22;font-size:14px;font-weight:700;">Remorqueur(s) assigne(s)</h4>';
          remorq.forEach((m: any) => html += '<p style="margin:4px 0;font-size:13px;color:#374151;">&bull; ' + (m.remorqueurNom || 'N/A') + '</p>');
          if (!remorq.length) { html += '<p style="margin:4px 0;font-size:13px;color:#9CA3AF;">Aucun remorqueur assigne</p>'; }
          html += '</div>';
          html += '</div>';
          Swal.fire({
            title: 'Sinistre Accepte !',
            html: html,
            icon: 'success',
            confirmButtonText: 'Confirmer',
            confirmButtonColor: '#5E2B8A',
            customClass: { title: 'text-gray-800 font-bold text-xl', popup: 'rounded-2xl shadow-2xl' },
            width: 500
          }).then((r: any) => { if (r.isConfirmed) { this.updateStatut(statut); } });
        },
        error: () => { this.loading = false; this.updateStatut(statut); }
      });
      return;
    }
    this.updateStatut(statut);
  }

  private updateStatut(statut: string): void {
    if (!this.sinistre) { return; }
    this.loading = true;
    this.http.put(environment.apiUrl + '/sinistres/' + this.sinistre.id + '/statut?statut=' + statut, {}).subscribe({
      next: (updated: any) => {
        this.loading = false;
        if (this.sinistre) { this.sinistre.statut = updated.statut || statut; }
        Swal.fire({ icon: 'success', title: 'Statut mis a jour', text: 'Le sinistre est maintenant: ' + this.getStatusLabel(statut), confirmButtonColor: '#5E2B8A', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
      },
      error: (err: any) => { this.loading = false; Swal.fire({ icon: 'error', title: 'Erreur', text: err.error?.message || 'Impossible', confirmButtonColor: '#C2173F' }); }
    });
  }

  getStatusLabel(s: string | undefined): string {
    const m: Record<string, string> = { 'DECLARE': 'Declare', 'EN_COURS': 'En cours', 'EN_EXPERTISE': 'En expertise', 'ACCEPTE': 'Accepte', 'REFUSE': 'Refuse', 'REMBOURSE': 'Rembourse', 'CLOTURE': 'Cloture' };
    return m[s || ''] || s || 'N/A';
  }

  getStatusClass(s: string | undefined): string {
    const m: Record<string, string> = { 'DECLARE': 'badge-info', 'EN_COURS': 'badge-warning', 'EN_EXPERTISE': 'bg-purple-100 text-purple-800', 'ACCEPTE': 'badge-success', 'REFUSE': 'badge-danger', 'REMBOURSE': 'bg-blue-100 text-blue-800', 'CLOTURE': 'bg-gray-100 text-gray-800' };
    return m[s || ''] || 'badge-info';
  }

  getMissionStatusClass(s: string | undefined): string {
    const m: Record<string, string> = { 'EN_ATTENTE': 'badge-warning', 'EN_COURS': 'badge-info', 'TERMINEE': 'badge-success', 'ANNULEE': 'badge-danger' };
    return m[s || ''] || 'badge-info';
  }

  getStatusBtnClass(s: string): string {
    const m: Record<string, string> = { 'EN_COURS': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', 'EN_EXPERTISE': 'bg-purple-100 text-purple-800 hover:bg-purple-200', 'ACCEPTE': 'bg-green-100 text-green-800 hover:bg-green-200', 'REFUSE': 'bg-red-100 text-red-800 hover:bg-red-200', 'REMBOURSE': 'bg-blue-100 text-blue-800 hover:bg-blue-200', 'CLOTURE': 'bg-gray-100 text-gray-800 hover:bg-gray-200' };
    return m[s] || 'bg-gray-100 text-gray-800';
  }
}
