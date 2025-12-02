import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, FooterConfig } from '../../services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ng-container *ngIf="config$ | async as config">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            <!-- Colonne 1: Identité -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span class="text-2xl font-bold tracking-tight text-white">ElyesImmo</span>
              </div>
              <p class="text-gray-400 text-sm leading-relaxed max-w-xs">
                Votre partenaire de confiance pour l'immobilier en Tunisie.
              </p>
            </div>

            <!-- Colonne 2: Contact Dynamique -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-500 mb-4">Contact</h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3 text-gray-300">
                  <svg class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a [href]="'tel:' + config.phone" class="hover:text-blue-400 transition">{{ config.phone }}</a>
                </li>
                <li class="flex items-start gap-3 text-gray-300">
                  <svg class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a [href]="'mailto:' + config.email" class="hover:text-blue-400 transition">{{ config.email }}</a>
                </li>
                <li class="flex items-start gap-3 text-gray-300">
                  <svg class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{{ config.address }}</span>
                </li>
              </ul>
            </div>

            <!-- Colonne 3: Liens -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-500 mb-4">Informations</h3>
              <ul class="space-y-2 text-sm text-gray-400">
                <li><a href="#" class="hover:text-white transition">À propos</a></li>
                <li><a href="#" class="hover:text-white transition">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <!-- Copyright Dynamique -->
          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {{ config.copyright }}. Tous droits réservés.</p>
          </div>
        </ng-container>
      </div>
    </footer>
  `
})
export class FooterComponent {
  firebaseService = inject(FirebaseService);
  config$: Observable<FooterConfig> = this.firebaseService.getFooterConfig();
}
