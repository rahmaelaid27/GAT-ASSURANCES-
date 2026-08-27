import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sinistre, SinistreCreateRequest, StatutSinistre } from '../models/sinistre.model';
import { GarageRecommandation } from '../models/garage.model';

@Injectable({ providedIn: 'root' })
export class SinistreService {
  private readonly API = 'http://localhost:8081/api/sinistres';

  constructor(private http: HttpClient) {}

  /** CLIENT — déclarer un sinistre */
  declarer(req: SinistreCreateRequest): Observable<Sinistre> {
    return this.http.post<Sinistre>(this.API, req);
  }

  /** CLIENT — mes sinistres */
  mesSinistres(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.API}/mes-sinistres`);
  }

  /** GESTIONNAIRE — mes dossiers */
  mesDossiers(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.API}/mes-dossiers`);
  }

  /** MANAGER/ADMIN — tous les sinistres */
  findAll(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(this.API);
  }

  /** Détail d'un sinistre */
  findById(id: number): Observable<Sinistre> {
    return this.http.get<Sinistre>(`${this.API}/${id}`);
  }

  /** GESTIONNAIRE — changer le statut */
  changerStatut(id: number, statut: StatutSinistre, motif?: string): Observable<Sinistre> {
    let params = new HttpParams().set('statut', statut);
    if (motif) params = params.set('motif', motif);
    return this.http.put<Sinistre>(`${this.API}/${id}/statut`, null, { params });
  }

  /** CLIENT — choisir un garage */
  affecterGarage(sinistreId: number, garageId: number): Observable<Sinistre> {
    return this.http.post<Sinistre>(`${this.API}/${sinistreId}/affecter-garage/${garageId}`, {});
  }

  /** GESTIONNAIRE — approuver */
  approuver(id: number): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.API}/${id}/approuver`, {});
  }

  /** GESTIONNAIRE — clôturer */
  cloturer(id: number): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.API}/${id}/cloturer`, {});
  }

  /** GESTIONNAIRE — refuser */
  refuser(id: number, motif: string): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.API}/${id}/refuser`, null,
      { params: new HttpParams().set('motif', motif) });
  }

  /** GESTIONNAIRE — demander complément */
  demanderComplement(id: number, motif: string): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.API}/${id}/demander-complement`, null,
      { params: new HttpParams().set('motif', motif) });
  }

  /** Recommandations garages pour un sinistre */
  garagesRecommandes(sinistreId: number): Observable<GarageRecommandation[]> {
    return this.http.get<GarageRecommandation[]>(`${this.API}/${sinistreId}/garages-recommandes`);
  }
}
