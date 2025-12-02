import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, Booking } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4 font-sans">
      <div class="max-w-6xl mx-auto">
        <!-- Header Admin -->
        <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h1 class="text-2xl font-bold text-gray-800">Administration des Locations</h1>
          <div class="flex items-center gap-4">
            <a routerLink="/" class="text-blue-600 hover:text-blue-800 font-medium">← Retour au site</a>
            <button (click)="logout()" class="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Déconnexion
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" *ngIf="bookings$ | async as bookings">
              <tr *ngFor="let booking of bookings">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ booking.houseTitle }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ booking.userEmail }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ booking.startDate }} <br>au {{ booking.endDate }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ booking.totalPrice }} DT
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                      'bg-green-100 text-green-800': booking.status === 'approved',
                      'bg-red-100 text-red-800': booking.status === 'rejected'
                    }">
                    {{ booking.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button *ngIf="booking.status === 'pending'" (click)="updateStatus(booking.id!, 'approved')" class="text-green-600 hover:text-green-900 mr-4">Valider</button>
                  <button *ngIf="booking.status === 'pending'" (click)="updateStatus(booking.id!, 'rejected')" class="text-red-600 hover:text-red-900">Refuser</button>
                  <span *ngIf="booking.status !== 'pending'" class="text-gray-400">Traité</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminBookingsComponent {
  firebaseService = inject(FirebaseService);
  bookings$: Observable<Booking[]> = this.firebaseService.getAllBookings();

  async updateStatus(id: string, status: 'approved' | 'rejected') {
    if(confirm('Confirmer cette action ?')) {
      await this.firebaseService.updateBookingStatus(id, status);
    }
  }

  logout() {
    this.firebaseService.logout();
  }
}
