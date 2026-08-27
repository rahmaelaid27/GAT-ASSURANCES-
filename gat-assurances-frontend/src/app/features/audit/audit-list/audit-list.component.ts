import { Component } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { AuditLog } from '@core/models/audit.model';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [ DatePipe, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Journal d'audit</h1>
        <p class="text-gray-500">Traçabilité de toutes les actions critiques</p>
      </div>
      <div class="table-container">
        <table class="data-table text-xs">
          <thead>
            <tr><th>Date</th><th>Utilisateur</th><th>Rôle</th><th>Action</th><th>Table</th><th>Résultat</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let a of audits">
              <tr>
                <td>{{ a.date | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ a.userNom }}</td>
                <td><span class="badge-info">{{ a.userRole }}</span></td>
                <td>{{ a.action }}</td>
                <td>{{ a.tableConcernee }}</td>
                <td><span class="badge" [class]="a.resultat === 'SUCCES' ? 'badge-success' : 'badge-danger'">{{ a.resultat }}</span></td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!audits?.length">
              <tr><td colspan="6" class="text-center py-8 text-gray-400">Aucune entrée d'audit</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditListComponent {
  audits: AuditLog[] = [];
  constructor(private api: ApiService) {
    this.api.get<AuditLog[]>('audit-logs').subscribe({
      next: (data) => this.audits = data,
      error: () => this.audits = []
    });
  }
}
