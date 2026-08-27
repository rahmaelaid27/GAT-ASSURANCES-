import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-xl font-bold text-gray-900 mb-4">Statistiques globales</h1>
      <p class="text-gray-500 text-sm">Performance des garages, experts et délais de traitement.</p>
    </div>
  `
})
export class StatistiquesComponent {}
