import { Routes } from '@angular/router';
import { authGuard }   from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard }   from './core/guards/role.guard';

export const routes: Routes = [

  // ─── Redirection racine ────────────────────────────────────────────────────
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ─── Authentification (layout minimal) ────────────────────────────────────
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component')
        .then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component')
            .then(m => m.LoginComponent) },
      { path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component')
            .then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ─── CLIENT ───────────────────────────────────────────────────────────────
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/client/dashboard/client-dashboard.component')
            .then(m => m.ClientDashboardComponent) },
      { path: 'sinistres',
        loadComponent: () =>
          import('./features/client/sinistres/sinistre-list.component')
            .then(m => m.SinistreListComponent) },
      { path: 'sinistres/nouveau',
        loadComponent: () =>
          import('./features/client/sinistres/sinistre-create.component')
            .then(m => m.SinistreCreateComponent) },
      { path: 'sinistres/:id',
        loadComponent: () =>
          import('./features/client/sinistres/sinistre-detail.component')
            .then(m => m.SinistreDetailComponent) },
      { path: 'sinistres/:id/garages',
        loadComponent: () =>
          import('./features/client/sinistres/garage-selection.component')
            .then(m => m.GarageSelectionComponent) },
      { path: 'forum',
        loadComponent: () =>
          import('./features/client/forum/client-forum.component')
            .then(m => m.ClientForumComponent) },
      { path: 'sinistres/:id/forum',
        loadComponent: () =>
          import('./features/shared/forum/forum.component')
            .then(m => m.ForumComponent) },
      { path: 'vehicules',
        loadComponent: () =>
          import('./features/client/vehicules/vehicule-list.component')
            .then(m => m.VehiculeListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── GESTIONNAIRE ─────────────────────────────────────────────────────────
  {
    path: 'gestionnaire',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['GESTIONNAIRE'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/gestionnaire/dashboard/gestionnaire-dashboard.component')
            .then(m => m.GestionnaireDashboardComponent) },
      { path: 'dossiers',
        loadComponent: () =>
          import('./features/gestionnaire/dossiers/dossier-list.component')
            .then(m => m.DossierListComponent) },
      { path: 'dossiers/:id',
        loadComponent: () =>
          import('./features/gestionnaire/dossiers/dossier-detail.component')
            .then(m => m.DossierDetailComponent) },
      { path: 'dossiers/:id/forum',
        loadComponent: () =>
          import('./features/shared/forum/forum.component')
            .then(m => m.ForumComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── GARAGE ───────────────────────────────────────────────────────────────
  {
    path: 'garage',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['GARAGE'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/garage/dashboard/garage-dashboard.component')
            .then(m => m.GarageDashboardComponent) },
      { path: 'missions',
        loadComponent: () =>
          import('./features/garage/missions/mission-list.component')
            .then(m => m.MissionListComponent) },
      { path: 'missions/:id',
        loadComponent: () =>
          import('./features/garage/missions/mission-detail.component')
            .then(m => m.MissionDetailComponent) },
      { path: 'missions/:id/forum',
        loadComponent: () =>
          import('./features/shared/forum/forum.component')
            .then(m => m.ForumComponent) },
      { path: 'forum',
        loadComponent: () =>
          import('./features/garage/forum/garage-forum.component')
            .then(m => m.GarageForumComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── EXPERT ───────────────────────────────────────────────────────────────
  {
    path: 'expert',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EXPERT'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/expert/dashboard/expert-dashboard.component')
            .then(m => m.ExpertDashboardComponent) },
      { path: 'expertises',
        loadComponent: () =>
          import('./features/expert/expertises/expertise-list.component')
            .then(m => m.ExpertiseListComponent) },
      { path: 'expertises/:id',
        loadComponent: () =>
          import('./features/expert/expertises/expertise-detail.component')
            .then(m => m.ExpertiseDetailComponent) },
      { path: 'expertises/:id/forum',
        loadComponent: () =>
          import('./features/shared/forum/forum.component')
            .then(m => m.ForumComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── REMORQUEUR ───────────────────────────────────────────────────────────
  {
    path: 'remorqueur',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['REMORQUEUR'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/remorqueur/dashboard/remorqueur-dashboard.component')
            .then(m => m.RemorqueurDashboardComponent) },
      { path: 'interventions',
        loadComponent: () =>
          import('./features/remorqueur/interventions/intervention-list.component')
            .then(m => m.InterventionListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── MANAGER ──────────────────────────────────────────────────────────────
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/manager/dashboard/manager-dashboard.component')
            .then(m => m.ManagerDashboardComponent) },
      { path: 'statistiques',
        loadComponent: () =>
          import('./features/manager/statistiques/statistiques.component')
            .then(m => m.StatistiquesComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent) },
      { path: 'utilisateurs',
        loadComponent: () =>
          import('./features/admin/utilisateurs/utilisateur-list.component')
            .then(m => m.UtilisateurListComponent) },
      { path: 'partenaires',
        loadComponent: () =>
          import('./features/admin/partenaires/partenaire-list.component')
            .then(m => m.PartenaireListComponent) },
      { path: 'audit',
        loadComponent: () =>
          import('./features/admin/audit/audit.component')
            .then(m => m.AuditComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' }
];
