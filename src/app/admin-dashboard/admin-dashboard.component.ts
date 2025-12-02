import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, Booking } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 font-sans flex flex-col">
      
      <!-- Header Admin -->
      <header class="bg-gray-900 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="bg-red-600 text-white p-1.5 rounded font-bold">Admin</div>
            <span class="text-xl font-bold tracking-tight">ElyesImmo Dashboard</span>
          </div>
          <div class="flex gap-4 items-center">
            <a routerLink="/" class="text-gray-300 hover:text-white text-sm">Voir le site</a>
            <button (click)="logout()" class="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm transition">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div class="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        
        <!-- Actions Rapides -->
        <div class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Vue d'ensemble</h1>
            <p class="text-gray-500">Gérez vos propriétés et les demandes de location.</p>
          </div>
          <a routerLink="/add" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2 transition transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une nouvelle maison
          </a>
        </div>

        <!-- Statistiques (Simulation) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm mb-1">Total Demandes</div>
            <div class="text-3xl font-bold text-blue-600" *ngIf="bookings$ | async as b">{{ b.length }}</div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm mb-1">En attente</div>
            <div class="text-3xl font-bold text-yellow-500" *ngIf="pendingCount$ | async as count">{{ count }}</div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm mb-1">Revenus Estimés (Validés)</div>
            <div class="text-3xl font-bold text-green-600" *ngIf="revenue$ | async as rev">{{ rev }} DT</div>
          </div>
        </div>

        <!-- Tableau des réservations -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="font-bold text-gray-700">Dernières demandes de location</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriété</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" *ngIf="bookings$ | async as bookings; else loading">
                <tr *ngFor="let booking of bookings" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ booking.userEmail }}</div>
                    <div class="text-xs text-gray-400">ID: {{ booking.userId.substring(0,8) }}...</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-medium">{{ booking.houseTitle }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600">{{ booking.startDate }} <span class="text-gray-400">➔</span> {{ booking.endDate }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                    {{ booking.totalPrice }} DT
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                        'bg-green-100 text-green-800': booking.status === 'approved',
                        'bg-red-100 text-red-800': booking.status === 'rejected'
                      }">
                      {{ booking.status === 'pending' ? 'En attente' : (booking.status === 'approved' ? 'Validée' : 'Refusée') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div *ngIf="booking.status === 'pending'" class="flex justify-end gap-2">
                      <button (click)="updateStatus(booking.id!, 'approved')" class="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded border border-green-200 transition">
                        Accepter
                      </button>
                      <button (click)="updateStatus(booking.id!, 'rejected')" class="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded border border-red-200 transition">
                        Refuser
                      </button>
                    </div>
                    <div *ngIf="booking.status !== 'pending'" class="text-gray-400 italic text-xs">
                      Traité
                    </div>
                  </td>
                </tr>
                <tr *ngIf="bookings.length === 0">
                  <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                    Aucune demande de location pour le moment.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #loading>
            <div class="p-10 text-center text-gray-500">Chargement des données...</div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  firebaseService = inject(FirebaseService);
  
  bookings$: Observable<Booking[]> = this.firebaseService.getAllBookings();
  
  // Calcul des stats en temps réel
  pendingCount$ = this.bookings$.pipe(
    map(bookings => bookings.filter(b => b.status === 'pending').length)
  );
  
  revenue$ = this.bookings$.pipe(
    map(bookings => bookings
      .filter(b => b.status === 'approved')
      .reduce((acc, curr) => acc + curr.totalPrice, 0)
    )
  );

  async updateStatus(id: string, status: 'approved' | 'rejected') {
    const action = status === 'approved' ? 'accepter' : 'refuser';
    if(confirm(`Voulez-vous vraiment ${action} cette demande ?`)) {
      try {
        await this.firebaseService.updateBookingStatus(id, status);
      } catch (e) {
        console.error(e);
        alert("Erreur lors de la mise à jour.");
      }
    }
  }

  logout() {
    this.firebaseService.logout();
  }
}
