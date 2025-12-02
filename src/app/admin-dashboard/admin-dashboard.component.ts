import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, Booking, FooterConfig } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
            <button (click)="logout()" class="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm transition">Déconnexion</button>
          </div>
        </div>
      </header>

      <div class="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        
        <!-- Navigation Onglets Simples -->
        <div class="flex space-x-4 mb-8 border-b border-gray-300 pb-2">
          <button (click)="activeTab = 'bookings'" [class.text-blue-600]="activeTab === 'bookings'" [class.border-b-2]="activeTab === 'bookings'" [class.border-blue-600]="activeTab === 'bookings'" class="pb-2 font-medium text-gray-600 hover:text-blue-600 transition">
            Réservations
          </button>
          <button (click)="activeTab = 'settings'" [class.text-blue-600]="activeTab === 'settings'" [class.border-b-2]="activeTab === 'settings'" [class.border-blue-600]="activeTab === 'settings'" class="pb-2 font-medium text-gray-600 hover:text-blue-600 transition">
            Paramètres du Site (Footer)
          </button>
        </div>

        <!-- ONGLET 1 : RESERVATIONS -->
        <div *ngIf="activeTab === 'bookings'" class="animate-fade-in">
          
          <div class="mb-6 flex justify-between items-end">
             <h2 class="text-2xl font-bold text-gray-800">Gestion des Locations</h2>
             <a routerLink="/add" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                <span>+</span> Ajouter Maison
             </a>
          </div>

          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bien</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" *ngIf="bookings$ | async as bookings; else loading">
                <tr *ngFor="let booking of bookings">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ booking.houseTitle }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ booking.userEmail }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ booking.startDate }} > {{ booking.endDate }}</td>
                  <td class="px-6 py-4 text-sm font-bold">{{ booking.totalPrice }} DT</td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 text-xs rounded-full" [ngClass]="{'bg-yellow-100 text-yellow-800': booking.status==='pending', 'bg-green-100 text-green-800': booking.status==='approved', 'bg-red-100 text-red-800': booking.status==='rejected'}">
                      {{ booking.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div *ngIf="booking.status === 'pending'">
                      <button (click)="updateStatus(booking.id!, 'approved')" class="text-green-600 hover:text-green-900 mr-3">Valider</button>
                      <button (click)="updateStatus(booking.id!, 'rejected')" class="text-red-600 hover:text-red-900">Refuser</button>
                    </div>
                    <span *ngIf="booking.status !== 'pending'" class="text-gray-400">Archivé</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <ng-template #loading><div class="p-6 text-center">Chargement...</div></ng-template>
          </div>
        </div>

        <!-- ONGLET 2 : PARAMETRES FOOTER -->
        <div *ngIf="activeTab === 'settings'" class="animate-fade-in">
          <div class="max-w-2xl bg-white p-8 rounded-xl shadow-md">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Modifier le Pied de Page (Footer)</h2>
            
            <form (ngSubmit)="saveSettings()" *ngIf="footerConfig; else loadingSettings">
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
                  <input type="text" [(ngModel)]="footerConfig.phone" name="phone" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Adresse Email de contact</label>
                  <input type="email" [(ngModel)]="footerConfig.email" name="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Adresse Physique</label>
                  <input type="text" [(ngModel)]="footerConfig.address" name="address" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Texte Copyright</label>
                  <input type="text" [(ngModel)]="footerConfig.copyright" name="copyright" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>

              <div class="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" [disabled]="isSaving" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  {{ isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications' }}
                </button>
              </div>
              
              <div *ngIf="saveMessage" class="mt-4 p-2 bg-green-100 text-green-700 rounded text-center">
                {{ saveMessage }}
              </div>

            </form>
            <ng-template #loadingSettings>Chargement de la configuration...</ng-template>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  
  // Onglets
  activeTab: 'bookings' | 'settings' = 'bookings';

  // Data Bookings
  bookings$: Observable<Booking[]> = this.firebaseService.getAllBookings();

  // Data Settings
  footerConfig: FooterConfig | null = null;
  isSaving = false;
  saveMessage = '';

  ngOnInit() {
    // Charger la config actuelle
    this.firebaseService.getFooterConfig().subscribe(config => {
      this.footerConfig = config;
    });
  }

  // Actions Bookings
  async updateStatus(id: string, status: 'approved' | 'rejected') {
    if(confirm('Confirmer ?')) {
      await this.firebaseService.updateBookingStatus(id, status);
    }
  }

  // Actions Settings
  async saveSettings() {
    if(!this.footerConfig) return;
    this.isSaving = true;
    this.saveMessage = '';
    
    try {
      await this.firebaseService.updateFooterConfig(this.footerConfig);
      this.saveMessage = '✅ Footer mis à jour avec succès !';
      // Effacer le message après 3s
      setTimeout(() => this.saveMessage = '', 3000);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde');
    } finally {
      this.isSaving = false;
    }
  }

  logout() {
    this.firebaseService.logout();
  }
}
