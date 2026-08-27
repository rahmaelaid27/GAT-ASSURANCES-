import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthRequest, AuthResponse, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API       = 'http://localhost:8081/api/auth';
  private readonly TOKEN_KEY = 'gat_token';
  private readonly USER_KEY  = 'gat_user';

  currentUser = signal<AuthResponse | null>(this.loadSession());

  private _subject = new BehaviorSubject<AuthResponse | null>(this.loadSession());
  readonly currentUser$ = this._subject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(req: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.save(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this._subject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null  { return localStorage.getItem(this.TOKEN_KEY); }
  isAuthenticated(): boolean { return !!this.getToken(); }
  isLoggedIn(): boolean      { return this.isAuthenticated(); }

  getRole(): Role | null     { return this.currentUser()?.user?.role ?? null; }
  getUserId(): number | null { return this.currentUser()?.user?.id  ?? null; }
  getUser()                  { return this.currentUser()?.user ?? null; }

  hasRole(...roles: Role[]): boolean {
    const r = this.getRole();
    return r ? roles.includes(r) : false;
  }

  /** Compatibilité composants existants */
  getCurrentUser(): AuthResponse | null { return this.currentUser(); }

  redirectToDashboard(): void {
    const map: Record<Role, string> = {
      CLIENT: '/client/dashboard', GESTIONNAIRE: '/gestionnaire/dashboard',
      GARAGE: '/garage/dashboard', EXPERT: '/expert/dashboard',
      REMORQUEUR: '/remorqueur/dashboard', MANAGER: '/manager/dashboard',
      ADMIN: '/admin/dashboard',
    };
    const r = this.getRole();
    this.router.navigate([r ? map[r] : '/auth/login']);
  }

  private save(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY,  JSON.stringify(res));
    this.currentUser.set(res);
    this._subject.next(res);
  }
  private loadSession(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
