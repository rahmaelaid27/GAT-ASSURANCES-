import { Component } from '@angular/core';
import { DatePipe, NgIf, NgForOf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { Archive } from '@core/models/archive.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archive-list',
  standalone: true,
  imports: [DatePipe, NgIf, NgForOf],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Archives</h1>
        <p class="text-gray-500">Documents et données archivés</p>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Table source</th><th>Date archivage</th><th>Archivé par</th><th>Restaure</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let a of archives">
              <tr>
                <td>{{ a.tableSource }}</td>
                <td>{{ a.dateArchivage | date:'dd/MM/yyyy' }}</td>
                <td>{{ a.archivePar }}</td>
                <td>
                  <ng-container *ngIf="a.restaure">
                    <span class="badge-success">Oui</span>
                  </ng-container><ng-container *ngIf="!(a.restaure)">
                    <span class="badge-warning">Non</span>
                  </ng-container>
                </td>
                <td>
                  <button (click)="restaurer(a.id)" class="text-primary-600 hover:text-primary-700 text-sm">Restaurer</button>
                </td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!archives?.length">
              <tr><td colspan="5" class="text-center py-8 text-gray-400">Aucune archive</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ArchiveListComponent {
  archives: Archive[] = [];
  constructor(private api: ApiService) {
    this.api.get<Archive[]>('archives').subscribe({
      next: (data) => this.archives = data,
      error: () => this.archives = []
    });
  }

  restaurer(id: number): void {
    this.api.post(`archives/${id}/restaurer`, {}).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Archive restaurée', confirmButtonColor: '#1a3a5c' });
        this.archives = this.archives.map(a => a.id === id ? { ...a, restaure: true } : a);
      }
    });
  }
}
