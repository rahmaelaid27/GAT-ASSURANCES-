import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Swatch {
  name: string;
  hex: string;
  usage: string;
  text: string;
}

@Component({
  selector: 'app-charte-graphique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full p-4 sm:p-6 lg:p-8 space-y-8 bg-[#F8F7FB]">
      <header class="max-w-6xl">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#6B2D8B] via-[#E5162A] to-[#F5A623]"></span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B2D8B]">GAT Assurances</p>
            <h1 class="text-2xl sm:text-3xl font-bold text-[#1A0830]">Charte graphique</h1>
          </div>
        </div>
        <p class="max-w-2xl text-sm sm:text-base text-gray-600">
          Le langage visuel de la plateforme : une interface professionnelle, lisible et cohérente pour chaque partenaire.
        </p>
      </header>

      <section class="max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A0830] via-[#6B2D8B] to-[#C4187A] p-6 sm:p-8 text-white shadow-lg">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-medium text-white/70">Identité de marque</p>
            <h2 class="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">GAT <span class="text-[#F5A623]">Assurances</span></h2>
            <p class="mt-3 max-w-lg text-sm leading-6 text-white/80">Confiance, coordination et rapidité au service des sinistres automobiles.</p>
          </div>
          <div class="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-black text-[#6B2D8B]">G</span>
            <div>
              <p class="text-sm font-bold">Système GAT</p>
              <p class="text-xs text-white/60">Version 1.0</p>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-6xl space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#1A0830]">Palette de marque</h2>
          <p class="text-sm text-gray-500">Les couleurs utilisées dans les espaces et les actions de la plateforme.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          @for (swatch of brandColors; track swatch.hex) {
            <article class="overflow-hidden rounded-xl border border-[#E8E2F0] bg-white shadow-sm">
              <div class="h-20 sm:h-24" [style.background-color]="swatch.hex"></div>
              <div class="p-3">
                <p class="truncate text-xs font-bold text-[#1A0830]">{{ swatch.name }}</p>
                <p class="mt-1 text-[11px] font-medium text-gray-500">{{ swatch.hex }}</p>
                <p class="mt-2 text-[11px] leading-4 text-gray-400">{{ swatch.usage }}</p>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="grid max-w-6xl gap-6 lg:grid-cols-2">
        <article class="rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-[#1A0830]">Typographie</h2>
          <p class="mt-1 text-sm text-gray-500">Poppins, une famille claire et chaleureuse.</p>
          <div class="mt-6 space-y-4">
            <div><p class="text-3xl font-extrabold text-[#1A0830]">Titre de page</p><span class="text-xs text-gray-400">Poppins 800 · 30 px</span></div>
            <div><p class="text-xl font-bold text-[#6B2D8B]">Titre de section</p><span class="text-xs text-gray-400">Poppins 700 · 20 px</span></div>
            <div><p class="text-sm leading-6 text-gray-600">Texte courant pour expliquer une action ou donner le contexte d'un dossier.</p><span class="text-xs text-gray-400">Poppins 400 · 14 px</span></div>
          </div>
        </article>

        <article class="rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-[#1A0830]">Actions et statuts</h2>
          <p class="mt-1 text-sm text-gray-500">Chaque état doit être identifiable au premier regard.</p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button class="rounded-lg bg-[#6B2D8B] px-4 py-2 text-sm font-semibold text-white shadow-sm">Action principale</button>
            <button class="rounded-lg border border-[#6B2D8B] bg-white px-4 py-2 text-sm font-semibold text-[#6B2D8B]">Action secondaire</button>
            <button class="rounded-lg bg-[#E5162A] px-4 py-2 text-sm font-semibold text-white shadow-sm">Action critique</button>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">En cours</span>
            <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">En attente</span>
            <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Validé</span>
            <span class="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Refusé</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Archivé</span>
          </div>
        </article>
      </section>

      <section class="max-w-6xl space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#1A0830]">Composants d'interface</h2>
          <p class="text-sm text-gray-500">Des blocs compacts conçus pour la lecture et la décision.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><p class="text-sm text-gray-500">Dossiers actifs</p><p class="mt-1 text-3xl font-extrabold text-[#1A0830]">24</p><div class="mt-3 h-1.5 rounded-full bg-[#F3F0F8]"><div class="h-full w-3/4 rounded-full bg-[#6B2D8B]"></div></div></div>
          <div class="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"><p class="text-sm text-blue-600">En cours</p><p class="mt-1 text-3xl font-extrabold text-blue-700">12</p><p class="mt-3 text-xs text-gray-400">Actualisé automatiquement</p></div>
          <div class="rounded-xl border border-amber-100 bg-white p-5 shadow-sm"><p class="text-sm text-amber-600">Note moyenne</p><p class="mt-1 text-3xl font-extrabold text-amber-700">4.5 <span class="text-xl">★</span></p><p class="mt-3 text-xs text-gray-400">Sur les évaluations reçues</p></div>
          <div class="rounded-xl border border-green-100 bg-white p-5 shadow-sm"><p class="text-sm text-green-600">Résolution</p><p class="mt-1 text-3xl font-extrabold text-green-700">78%</p><p class="mt-3 text-xs text-gray-400">Dossiers clôturés</p></div>
        </div>
      </section>

      <section class="max-w-6xl rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-lg font-bold text-[#1A0830]">Accents par rôle</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          @for (role of roles; track role.name) {
            <div class="flex items-center gap-3 rounded-xl bg-[#F8F7FB] p-3">
              <span class="h-9 w-9 rounded-lg" [style.background-color]="role.color"></span>
              <div><p class="text-sm font-semibold text-[#1A0830]">{{ role.name }}</p><p class="text-xs text-gray-500">{{ role.focus }}</p></div>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class CharteGraphiqueComponent {
  brandColors: Swatch[] = [
    { name: 'Violet GAT', hex: '#6B2D8B', usage: 'Navigation et liens', text: '#FFFFFF' },
    { name: 'Violet fonce', hex: '#4A1A6B', usage: 'Fonds profonds', text: '#FFFFFF' },
    { name: 'Rouge GAT', hex: '#E5162A', usage: 'Alertes et critiques', text: '#FFFFFF' },
    { name: 'Or GAT', hex: '#F5A623', usage: 'Garage et attention', text: '#1A0830' },
    { name: 'Magenta', hex: '#C4187A', usage: 'Accent secondaire', text: '#FFFFFF' },
    { name: 'Fond app', hex: '#F8F7FB', usage: 'Arrière-plan général', text: '#1A0830' },
    { name: 'Bordure', hex: '#E8E2F0', usage: 'Séparateurs et cartes', text: '#1A0830' }
  ];

  roles = [
    { name: 'Client', color: '#6B2D8B', focus: 'Suivi simple' },
    { name: 'Gestionnaire', color: '#E5162A', focus: 'Priorités' },
    { name: 'Garage', color: '#F5A623', focus: 'Missions' },
    { name: 'Expert', color: '#0EA5E9', focus: 'Expertises' },
    { name: 'Remorqueur', color: '#16A34A', focus: 'Terrain' },
    { name: 'Manager', color: '#C4187A', focus: 'KPI globaux' },
    { name: 'Administrateur', color: '#0891B2', focus: 'Contrôle' }
  ];
}
