import { Component } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { Evaluation } from '@core/models/evaluation.model';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [ DatePipe, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Évaluations</h1>
        <p class="text-gray-500">Notes et avis sur les prestataires</p>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Type</th><th>Évaluateur</th><th>Note</th><th>Commentaire</th><th>Date</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let e of evaluations">
              <tr>
                <td><span class="badge" [class]="e.typeEvaluation === 'GARAGE' ? 'badge-info' : 'badge-success'">{{ e.typeEvaluation }}</span></td>
                <td>{{ e.evaluateurNom }}</td>
                <td>
                  <span class="text-yellow-500">{{ '★'.repeat(e.note) }}{{ '☆'.repeat(5 - e.note) }}</span>
                  <span class="text-gray-500 text-sm ml-1">({{ e.note }}/5)</span>
                </td>
                <td>{{ e.commentaire }}</td>
                <td>{{ e.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!evaluations?.length">
              <tr><td colspan="5" class="text-center py-8 text-gray-400">Aucune évaluation</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class EvaluationListComponent {
  evaluations: Evaluation[] = [];
  constructor(private api: ApiService) {
    this.api.get<Evaluation[]>('evaluations').subscribe({
      next: (data) => this.evaluations = data,
      error: () => this.evaluations = []
    });
  }
}
