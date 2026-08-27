import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Logo SVG officiel GAT Assurances
 * G = Violet #6B2D8B
 * A = Rouge  #E5162A
 * T = Or     #F5A623
 * ASSURANCES = Rouge #E5162A
 */
@Component({
  selector: 'app-gat-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 select-none" [style.width]="width">
      <!-- Logo SVG GAT -->
      <svg [attr.height]="height" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- G - Violet -->
        <text x="0" y="44" font-family="Arial Black, Arial" font-weight="900"
              font-size="52" fill="#6B2D8B">G</text>
        <!-- A - Rouge -->
        <text x="32" y="44" font-family="Arial Black, Arial" font-weight="900"
              font-size="52" fill="#E5162A">A</text>
        <!-- T - Or/Jaune -->
        <text x="64" y="44" font-family="Arial Black, Arial" font-weight="900"
              font-size="52" fill="#F5A623">T</text>
      </svg>
      @if (showText) {
        <div class="flex flex-col leading-tight">
          <span class="font-black tracking-widest"
                [style.font-size]="textSize"
                style="color:#6B2D8B; font-family: Arial Black, Arial;">
            GAT
          </span>
          <span class="font-semibold tracking-[0.25em]"
                [style.font-size]="subSize"
                style="color:#E5162A; font-family: Arial, sans-serif; letter-spacing: 0.3em;">
            ASSURANCES
          </span>
        </div>
      }
    </div>
  `
})
export class GatLogoComponent {
  @Input() height    = '48px';
  @Input() width     = 'auto';
  @Input() showText  = false;
  @Input() textSize  = '18px';
  @Input() subSize   = '8px';
}
