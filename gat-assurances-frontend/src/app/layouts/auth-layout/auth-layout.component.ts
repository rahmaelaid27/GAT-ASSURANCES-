import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Fond exactement comme le site GAT : blanc avec panel magenta à droite -->
    <div class="min-h-screen flex">

      <!-- Panneau gauche — fond blanc avec contenu login -->
      <div class="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white relative overflow-hidden">

        <!-- Décorations de fond subtiles -->
        <div class="absolute top-0 left-0 w-72 h-72 rounded-full opacity-5"
             style="background: radial-gradient(circle, #6B2D8B, transparent); transform: translate(-50%,-50%)"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
             style="background: radial-gradient(circle, #E5162A, transparent); transform: translate(30%,30%)"></div>

        <div class="w-full max-w-md relative z-10">

          <!-- Logo GAT — identique au site officiel -->
          <div class="flex items-center gap-3 mb-10">
            <img src="assets/logo gat.png" alt="GAT Assurances"
                 class="h-14 object-contain"
                 onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='flex'">
            <!-- Fallback SVG si l'image ne charge pas -->
            <div id="logo-fallback" class="hidden items-center">
              <span class="text-5xl font-black" style="color:#6B2D8B; font-family: Arial Black, sans-serif; line-height:1">G</span>
              <span class="text-5xl font-black" style="color:#E5162A; font-family: Arial Black, sans-serif; line-height:1">A</span>
              <span class="text-5xl font-black" style="color:#F5A623; font-family: Arial Black, sans-serif; line-height:1">T</span>
              <div class="ml-2 flex flex-col leading-none">
                <span class="text-xs font-semibold tracking-[0.3em]" style="color:#E5162A">ASSURANCES</span>
              </div>
            </div>
          </div>

          <!-- Titre -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Espace Partenaires
            </h1>
            <p class="text-gray-500 text-base">
              Plateforme Intelligente de Gestion des Sinistres Automobiles
            </p>
          </div>

          <!-- Contenu de la route (login / register) -->
          <router-outlet />

          <!-- Footer -->
          <p class="text-center text-gray-400 text-xs mt-8">
            © 2026 GAT Assurances — Tous droits réservés
          </p>
        </div>
      </div>

      <!-- Panneau droit — Magenta GAT exactement comme le site officiel -->
      <div class="hidden lg:flex w-2/5 xl:w-1/3 flex-col justify-center items-center p-12 text-white relative overflow-hidden"
           style="background: #B5197A;">

        <!-- Texture de fond -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 right-10 w-64 h-64 rounded-full border-2 border-white"></div>
          <div class="absolute bottom-10 left-10 w-48 h-48 rounded-full border-2 border-white"></div>
          <div class="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div class="relative z-10 text-center">
          <!-- Titre principal identique au site -->
          <h2 class="text-2xl font-black leading-tight mb-6 uppercase tracking-wide">
            DEVENIR AGENT GAT ASSURANCES
          </h2>
          <p class="text-white/90 text-sm leading-relaxed mb-8">
            Êtes-vous prêt(e) à relever ce nouveau défi commercial et managérial ?
          </p>
          <p class="text-white/90 text-sm mb-8 font-medium">Rejoignez-nous !</p>

          <!-- Bouton identique au site -->
          <button class="w-full border-2 border-white text-white font-bold py-3 px-6 rounded-full
                         hover:bg-white hover:text-[#B5197A] transition-all duration-300 uppercase tracking-widest text-sm">
            POSTULEZ MAINTENANT
          </button>

          <!-- Séparateur -->
          <div class="my-8 h-px bg-white/20"></div>

          <!-- Features -->
          <div class="space-y-4 text-left">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-sm">Gestion des sinistres 100% digitale</p>
                <p class="text-white/70 text-xs mt-0.5">Déclarez et suivez en temps réel</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-sm">Réseau de partenaires qualifiés</p>
                <p class="text-white/70 text-xs mt-0.5">Garages, Experts, Remorqueurs</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-sm">Traitement rapide & efficace</p>
                <p class="text-white/70 text-xs mt-0.5">Workflow automatisé complet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
