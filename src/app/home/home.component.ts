import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

            <!-- Menu Droite -->
            <div class="flex items-center gap-4">
              
              <!-- Cas Utilisateur Connecté -->
              <ng-container *ngIf="userSignal() as user; else loginBtn">
                 
                 <!-- Si ADMIN -->
                 <ng-container *ngIf="firebaseService.isAdmin(user); else userMenu">
                    <a routerLink="/admin-dashboard" class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-700 transition shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Dashboard Admin
                    </a>
                 </ng-container>

                 <!-- Si USER NORMAL -->
                 <ng-template #userMenu>
                    <div class="hidden md:flex items-center gap-2 text-sm text-gray-600 mr-2">
                      <span class="w-2 h-2 rounded-full bg-green-500"></span>
                      {{ user.email }}
                    </div>
                    <a routerLink="/my-bookings" class="text-gray-600 hover:text-blue-600 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 pb-0.5 transition">
                      Mes Demandes
                    </a>
                    <button (click)="logout()" class="text-red-500 hover:text-red-700 text-sm font-medium ml-2">
                      Déconnexion
                    </button>
                 </ng-template>

              </ng-container>

              <!-- Cas Non Connecté -->
              <ng-template #loginBtn>
                <a routerLink="/login" class="text-blue-600 font-medium text-sm border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">
                  Se connecter
                </a>
              </ng-template>

            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="relative bg-blue-900 text-white py-20">
         <div class="absolute inset-0 overflow-hidden">
           <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" class="w-full h-full object-cover opacity-20" alt="Background">
        </div>
        <div class="relative max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-extrabold mb-4">Location de vacances en Tunisie</h1>
          <p class="text-lg text-blue-100">Réservez votre séjour en ligne en toute simplicité.</p>
        </div>
      </div>

      <!-- Listings Grid -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Nos propriétés disponibles</h2>
        
        <div *ngIf="houses$ | async as houses; else loading">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let house of houses" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group border border-gray-100 flex flex-col h-full">
              <div class="relative h-56 overflow-hidden bg-gray-200">
                <img [src]="house.imageUrl || 'https://via.placeholder.com/600x400'" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <div class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow">
                  {{ house.price }} DT / nuit
                </div>
              </div>
              
              <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center text-gray-500 text-sm mb-2">
                  <span class="mr-2">📍 {{ house.location }}</span>
                  <span *ngIf="house.bedrooms" class="ml-auto flex items-center gap-1">🛏️ {{ house.bedrooms }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ house.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 flex-grow">{{ house.description }}</p>
                
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <button (click)="openBookingModal(house)" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #loading>
           <div class="text-center py-20"><div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        </ng-template>
      </div>

      <!-- MODAL DE RÉSERVATION -->
      <div *ngIf="selectedHouse" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
          <div class="bg-blue-600 p-4 flex justify-between items-center text-white">
            <h3 class="font-bold text-lg">Réserver : {{ selectedHouse.title }}</h3>
            <button (click)="closeModal()" class="text-white hover:text-gray-200 text-xl">&times;</button>
          </div>
          
          <div class="p-6">
            <p class="text-gray-600 text-sm mb-4">Prix par nuit : <span class="font-bold text-blue-600">{{ selectedHouse.price }} DT</span></p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée</label>
                <input type="date" [(ngModel)]="bookingData.startDate" class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                <input type="date" [(ngModel)]="bookingData.endDate" class="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div *ngIf="calculateTotal() > 0" class="bg-blue-50 p-3 rounded text-center">
                 <p class="text-sm text-gray-600">Total estimé pour {{ getDays() }} nuits</p>
                 <p class="text-2xl font-bold text-blue-700">{{ calculateTotal() }} DT</p>
              </div>
            </div>

            <div class="mt-6 flex gap-3">
              <button (click)="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">Annuler</button>
              <button (click)="confirmBooking()" [disabled]="!isValidDates()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent {
  firebaseService = inject(FirebaseService);
  router = inject(Router);
  houses$: Observable<any[]> = this.firebaseService.getHouses();
  
  userSignal = signal<User | null>(null);
  
  selectedHouse: any = null;
  bookingData = { startDate: '', endDate: '' };

  constructor() {
    this.firebaseService.user$.subscribe(u => this.userSignal.set(u));
  }

  logout() { this.firebaseService.logout(); }

  openBookingModal(house: any) {
    if (!this.userSignal()) {
      alert("Vous devez être connecté pour réserver.");
      this.router.navigate(['/login']);
      return;
    }
    this.selectedHouse = house;
    this.bookingData = { startDate: '', endDate: '' };
  }

  closeModal() {
    this.selectedHouse = null;
  }

  getDays() {
    if(!this.bookingData.startDate || !this.bookingData.endDate) return 0;
    const start = new Date(this.bookingData.startDate);
    const end = new Date(this.bookingData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  calculateTotal() {
    const days = this.getDays();
    return days > 0 ? days * this.selectedHouse.price : 0;
  }

  isValidDates() {
    return this.getDays() > 0;
  }

  async confirmBooking() {
    if(!this.selectedHouse || !this.userSignal()) return;
    
    try {
      await this.firebaseService.addBooking({
        houseId: this.selectedHouse.id,
        houseTitle: this.selectedHouse.title,
        userId: this.userSignal()!.uid,
        userEmail: this.userSignal()!.email || 'Anonyme',
        startDate: this.bookingData.startDate,
        endDate: this.bookingData.endDate,
        totalPrice: this.calculateTotal(),
        status: 'pending'
      });
      alert('Votre demande de réservation a été envoyée !');
      this.closeModal();
      this.router.navigate(['/my-bookings']);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la réservation.');
    }
  }
}
