import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, Booking } from '../services/firebase.service';
import { Observable, switchMap, of } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      <!-- Navbar (Logo + Menu) -->
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

            <!-- Menu -->
            <div class="flex items-center gap-6">
               <a routerLink="/" class="text-gray-600 hover:text-blue-600 font-medium transition flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                 Accueil
               </a>
               
               <ng-container *ngIf="firebaseService.user$ | async as user">
                 <div class="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    {{ user.email }}
                 </div>
                 <button (click)="logout()" class="text-red-500 hover:text-red-700 font-medium transition text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Déconnexion
                 </button>
               </ng-container>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Mes demandes de location</h2>
        </div>

        <div *ngIf="bookings$ | async as bookings; else loading">
          
          <div *ngIf="bookings.length === 0" class="text-center bg-white p-12 rounded-lg shadow">
            <p class="text-gray-500 text-lg">Vous n'avez aucune réservation en cours.</p>
            <a routerLink="/" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Explorer les maisons</a>
          </div>

          <div class="grid gap-6">
            <div *ngFor="let booking of bookings" class="bg-white p-6 rounded-lg shadow border-l-4"
              [ngClass]="{
                'border-yellow-400': booking.status === 'pending',
                'border-green-500': booking.status === 'approved',
                'border-red-500': booking.status === 'rejected'
              }">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ booking.houseTitle }}</h3>
                  <p class="text-sm text-gray-500 mt-1">Du {{ booking.startDate }} au {{ booking.endDate }}</p>
                  <p class="font-bold text-blue-600 mt-2">Total : {{ booking.totalPrice }} DT</p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                      'bg-green-100 text-green-800': booking.status === 'approved',
                      'bg-red-100 text-red-800': booking.status === 'rejected'
                    }">
                    {{ booking.status === 'pending' ? 'En attente' : (booking.status === 'approved' ? 'Validée' : 'Refusée') }}
                  </span>
                  <p class="text-xs text-gray-400 mt-2">Ref: {{ booking.id }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        <ng-template #loading>
           <div class="text-center py-10">Chargement de vos réservations...</div>
        </ng-template>
      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  // Avec le heredoc 'EOF', le $! sera préservé correctement
  bookings$!: Observable<Booking[]>;

  ngOnInit() {
    this.bookings$ = this.firebaseService.user$.pipe(
      switchMap(user => {
        if (user) return this.firebaseService.getUserBookings(user.uid);
        return of([]);
      })
    );
  }

  logout() {
    this.firebaseService.logout();
  }
}
