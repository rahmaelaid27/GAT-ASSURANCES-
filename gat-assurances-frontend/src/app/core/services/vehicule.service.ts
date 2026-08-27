import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicule {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  typeVehicule: string;
  clientId: number;
}

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly API = 'http://localhost:8081/api/vehicules';

  constructor(private http: HttpClient) {}

  mesVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${this.API}/mes-vehicules`);
  }

  byImmatriculation(immat: string): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.API}/by-immat/${immat}`);
  }

  findAll(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.API);
  }
}
