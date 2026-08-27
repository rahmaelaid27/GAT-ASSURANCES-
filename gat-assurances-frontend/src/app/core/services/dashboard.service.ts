import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DashboardClient, DashboardGestionnaire, DashboardGarage,
  DashboardExpert, DashboardRemorqueur, DashboardManager, DashboardAdmin
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = 'http://localhost:8081/api/dashboard';

  constructor(private http: HttpClient) {}

  private static normalizeRemorqueur(data?: Partial<DashboardRemorqueur> | null): DashboardRemorqueur {
    return {
      missionsCeMois: Number(data?.missionsCeMois ?? 0),
      missionsEnCours: Number(data?.missionsEnCours ?? 0),
      disponible: Boolean(data?.disponible ?? true),
      notificationsNonLues: Number(data?.notificationsNonLues ?? 0)
    };
  }

  getClient(): Observable<DashboardClient> {
    return this.http.get<DashboardClient>(`${this.API}/client`);
  }
  getGestionnaire(): Observable<DashboardGestionnaire> {
    return this.http.get<DashboardGestionnaire>(`${this.API}/gestionnaire`);
  }
  getGarage(): Observable<DashboardGarage> {
    return this.http.get<DashboardGarage>(`${this.API}/garage`);
  }
  getExpert(): Observable<DashboardExpert> {
    return this.http.get<DashboardExpert>(`${this.API}/expert`);
  }
  getRemorqueur(): Observable<DashboardRemorqueur> {
    return this.http.get<Partial<DashboardRemorqueur> | null>(`${this.API}/remorqueur`).pipe(
      map((data) => DashboardService.normalizeRemorqueur(data))
    );
  }
  getManager(): Observable<DashboardManager> {
    return this.http.get<DashboardManager>(`${this.API}/manager`);
  }
  getAdmin(): Observable<DashboardAdmin> {
    return this.http.get<DashboardAdmin>(`${this.API}/admin`);
  }
}
