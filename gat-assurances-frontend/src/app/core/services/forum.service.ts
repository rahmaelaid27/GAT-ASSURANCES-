import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commentaire, CommentaireCreateRequest } from '../models/commentaire.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly API = 'http://localhost:8081/api/sinistres';

  constructor(private http: HttpClient) {}

  private buildPayload(req: CommentaireCreateRequest): Record<string, unknown> {
    const payload: Record<string, unknown> = { contenu: req.contenu };
    if (req.pieceJointe) payload['pieceJointe'] = req.pieceJointe;
    if (req.parentId !== undefined && req.parentId !== null) payload['parentId'] = req.parentId;
    return payload;
  }

  findAll(sinistreId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.API}/${sinistreId}/commentaires`);
  }

  create(sinistreId: number, req: CommentaireCreateRequest): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.API}/${sinistreId}/commentaires`, this.buildPayload(req));
  }

  update(sinistreId: number, id: number, req: CommentaireCreateRequest): Observable<Commentaire> {
    return this.http.put<Commentaire>(`${this.API}/${sinistreId}/commentaires/${id}`, this.buildPayload(req));
  }

  delete(sinistreId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${sinistreId}/commentaires/${id}`);
  }
}
