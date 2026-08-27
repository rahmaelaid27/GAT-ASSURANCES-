import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { TypeMission } from '@core/models/mission.model';

const TYPE_MISSION_VALUES: TypeMission[] = ['REMORQUAGE', 'EXPERTISE', 'REPARATION', 'AUTRE'];
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterLink, NgForOf, NgIf],
  template: `
    <div class="max-w-xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/missions" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Nouvelle mission</h1>
          <p class="text-gray-500">Créer une mission pour un sinistre</p>
        </div>
      </div>
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Type de mission</label>
            <select formControlName="typeMission" class="form-input">
              <ng-container *ngFor="let t of typesMission">
                <option [value]="t">{{ t }}</option>
              </ng-container>
            </select>
          </div>
          <div>
            <label class="form-label">ID Sinistre</label>
            <input type="number" formControlName="sinistreId" class="form-input">
          </div>
          <div>
            <label class="form-label">Description</label>
            <textarea formControlName="description" class="form-input" rows="3"></textarea>
          </div>
          <div>
            <label class="form-label">ID Garage (si réparation)</label>
            <input type="number" formControlName="garageId" class="form-input">
          </div>
          <div>
            <label class="form-label">ID Expert (si expertise)</label>
            <input type="number" formControlName="expertId" class="form-input">
          </div>
          <div>
            <label class="form-label">ID Remorqueur (si remorquage)</label>
            <input type="number" formControlName="remorqueurId" class="form-input">
          </div>
          <div class="flex justify-end gap-3">
            <a routerLink="/missions" class="btn-outline">Annuler</a>
            <button type="submit" class="btn-primary">Créer la mission</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MissionFormComponent {
  form: FormGroup;
  typesMission = TYPE_MISSION_VALUES;

  constructor(
    private fb: FormBuilder, private api: ApiService, private router: Router
  ) {
    this.form = this.fb.group({
      typeMission: ['REPARATION', Validators.required],
      sinistreId: [null, Validators.required],
      description: ['', Validators.required],
      garageId: [null],
      expertId: [null],
      remorqueurId: [null]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.post('missions', this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Mission créée', confirmButtonColor: '#1a3a5c' })
          .then(() => this.router.navigate(['/missions']));
      }
    });
  }
}
