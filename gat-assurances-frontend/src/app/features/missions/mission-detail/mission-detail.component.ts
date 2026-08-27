import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Mission } from '@core/models/mission.model';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/missions" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Mission #{{ mission?.id }}</h1>
          <p class="text-gray-500">{{ mission?.typeMission }}</p>
        </div>
      </div>
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">Type:</span> <span class="font-medium">{{ mission?.typeMission }}</span></div>
          <div><span class="text-gray-500">Statut:</span> <span class="font-medium">{{ mission?.statut }}</span></div>
          <div><span class="text-gray-500">Sinistre:</span> <span class="font-medium">{{ mission?.sinistreReference }}</span></div>
          <div><span class="text-gray-500">Description:</span> <span class="font-medium">{{ mission?.description }}</span></div>
        </div>
      </div>
    </div>
  `
})
export class MissionDetailComponent implements OnInit {
  mission?: Mission;
  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getById<Mission>('missions', +id).subscribe(data => this.mission = data);
    }
  }
}

