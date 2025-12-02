import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      <!-- Navbar -->
      <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            
            <!-- Logo -->
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
              <div class="bg-blue-600 text-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span class="font-bold text-xl tracking-tight text-blue-900">ElyesImmo</span>
            </div>

            <!-- Actions Droite -->
            <div class="flex items-center gap-4">
              
              <!-- Affichage conditionnel selon Auth -->
              <ng-container *ngIf="firebaseService.user$ | async as user; else loginBtn">
                 <div class="hidden md:flex items-center gap-2 text-sm text-gray-600 mr-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    {{ user.email }}
                 </div>
                 
                 <button (click)="logout()" class="text-gray-500 hover:text-red-600 text-sm font-medium transition">
                    Déconnexion
                 </button>

                 <a routerLink="/add" class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow flex items-center gap-2 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </a>
              </ng-container>

              <ng-template #loginBtn>
                <a routerLink="/login" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Se connecter
                </a>
                <a routerLink="/add" class="opacity-50 cursor-not-allowed bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium" title="Connectez-vous pour ajouter">
                   Ajouter
                </a>
              </ng-template>

            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="relative bg-blue-900 text-white py-24">
        <div class="absolute inset-0 overflow-hidden">
           <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" class="w-full h-full object-cover opacity-20" alt="Background">
        </div>
        <div class="relative max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl md:text-5xl font-extrabold mb-6">Trouvez votre maison de rêve</h1>
          <p class="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Explorez nos appartements et villas exclusifs partout en Tunisie.</p>
        </div>
      </div>

      <!-- Listings Grid -->
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Dernières Annonces</h2>
        
        <ng-template #loading>
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </ng-template>

        <div *ngIf="houses$ | async as houses; else loading">
          <div *ngIf="houses.length === 0" class="text-center py-10 bg-white rounded shadow text-gray-500">
            Aucune annonce pour le moment.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let house of houses" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-100 group">
              <div class="relative h-56 overflow-hidden bg-gray-200">
                <img [src]="house.imageUrl || 'https://via.placeholder.com/600x400?text=Pas+d+image'" 
                     class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                     alt="Maison">
                <div class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow">
                  {{ house.price }} DT
                </div>
              </div>
              
              <div class="p-6">
                <div class="flex items-center text-gray-500 text-sm mb-2">
                  <span class="mr-2">📍 {{ house.location }}</span>
                  <span *ngIf="house.bedrooms" class="ml-auto flex items-center gap-1">🛏️ {{ house.bedrooms }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 truncate">{{ house.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ house.description }}</p>
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <a href="mailto:elyes@gmail.com" class="block text-center text-blue-600 font-semibold hover:underline">Contacter l'agence</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  firebaseService = inject(FirebaseService);
  houses$: Observable<any[]> = this.firebaseService.getHouses();

  logout() {
    this.firebaseService.logout();
  }
}
