import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService, Booking } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
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
              <ng-container *ngIf="userSignal() as user; else loginBtn">
                 <!-- Menu Admin -->
                 <ng-container *ngIf="firebaseService.isAdmin(user); else userMenu">
                    <a routerLink="/admin-dashboard" class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-700 transition shadow-lg">
                      Dashboard Admin
                    </a>
                 </ng-container>

                 <!-- Menu User -->
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
      <div class="max-w-7xl mx-auto px-4 py-12 flex-grow">
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
                    Voir disponibilité & Réserver
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

      <!-- MODAL DE RÉSERVATION AVEC CALENDRIER -->
      <div *ngIf="selectedHouse" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
            <div>
              <h3 class="font-bold text-lg">{{ selectedHouse.title }}</h3>
              <p class="text-sm opacity-90 text-blue-100">{{ selectedHouse.price }} DT / nuit</p>
            </div>
            <button (click)="closeModal()" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
          </div>
          
          <!-- Modal Body (Scrollable) -->
          <div class="p-6 overflow-y-auto">
            
            <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Sélectionnez vos dates
            </h4>

            <!-- CALENDRIER -->
            <div class="mb-6 border rounded-lg p-4 bg-gray-50">
              
              <!-- Contrôles Mois -->
              <div class="flex justify-between items-center mb-4">
                <button (click)="changeMonth(-1)" class="p-1 hover:bg-gray-200 rounded">◀</button>
                <span class="font-bold text-gray-800">{{ currentMonthName }} {{ currentYear }}</span>
                <button (click)="changeMonth(1)" class="p-1 hover:bg-gray-200 rounded">▶</button>
              </div>

              <!-- Jours Semaine -->
              <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
                <div>Dim</div><div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div>
              </div>

              <!-- Grille Jours -->
              <div class="grid grid-cols-7 gap-1">
                <!-- Espaces vides début mois -->
                <div *ngFor="let empty of emptyDays" class="h-8"></div>
                
                <!-- Jours -->
                <button *ngFor="let day of calendarDays" 
                  (click)="selectDate(day)"
                  [disabled]="day.isBooked || day.isPast"
                  class="h-9 w-9 rounded-full text-sm flex items-center justify-center transition relative"
                  [ngClass]="{
                    'bg-red-100 text-red-400 cursor-not-allowed line-through': day.isBooked,
                    'text-gray-300 cursor-not-allowed': day.isPast && !day.isBooked,
                    'bg-blue-600 text-white font-bold shadow-lg transform scale-110': isSelected(day.date),
                    'bg-blue-100 text-blue-800': isInRange(day.date),
                    'hover:bg-blue-200 text-gray-700': !day.isBooked && !day.isPast && !isSelected(day.date) && !isInRange(day.date)
                  }">
                  {{ day.dayNumber }}
                </button>
              </div>

              <div class="mt-4 flex gap-4 text-xs justify-center">
                <div class="flex items-center gap-1"><span class="w-3 h-3 bg-white border rounded-full"></span> Libre</div>
                <div class="flex items-center gap-1"><span class="w-3 h-3 bg-red-100 border border-red-200 rounded-full"></span> Réservé</div>
                <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-600 rounded-full"></span> Sélection</div>
              </div>
            </div>

            <!-- Récapitulatif -->
            <div class="space-y-2 mb-4" *ngIf="startDate && endDate">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Arrivée :</span>
                <span class="font-medium">{{ startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Départ :</span>
                <span class="font-medium">{{ endDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="flex justify-between text-sm border-t pt-2 mt-2">
                <span class="font-bold text-gray-800">Total ({{ getDaysCount() }} nuits) :</span>
                <span class="font-bold text-blue-600 text-lg">{{ calculateTotal() }} DT</span>
              </div>
            </div>
            
            <div *ngIf="(!startDate || !endDate) && !errorMessage" class="text-center text-sm text-gray-500 italic py-2">
              Cliquez sur une date de début puis une date de fin.
            </div>

            <div *ngIf="errorMessage" class="bg-red-50 text-red-600 p-2 rounded text-sm text-center mb-4 border border-red-200">
              {{ errorMessage }}
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
            <button (click)="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100">Annuler</button>
            <button (click)="confirmBooking()" [disabled]="!isValidDates() || isSubmitting" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow">
              {{ isSubmitting ? 'Envoi...' : 'Confirmer' }}
            </button>
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
  
  // Gestion Modal & Calendrier
  selectedHouse: any = null;
  blockedDates: Set<string> = new Set(); // Format "YYYY-MM-DD"
  
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: any[] = [];
  emptyDays: any[] = []; // Pour décaler le début du mois
  
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  errorMessage = '';
  isSubmitting = false;

  constructor() {
    this.firebaseService.user$.subscribe(u => this.userSignal.set(u));
  }

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('fr-FR', { month: 'long' });
  }

  logout() { this.firebaseService.logout(); }

  // 1. Ouvrir Modal et charger les dispos
  openBookingModal(house: any) {
    if (!this.userSignal()) {
      alert("Connectez-vous pour voir les disponibilités.");
      this.router.navigate(['/login']);
      return;
    }
    this.selectedHouse = house;
    this.resetSelection();
    
    // Charger les réservations approuvées pour bloquer les dates
    this.firebaseService.getApprovedBookingsForHouse(house.id).subscribe(bookings => {
      this.blockedDates.clear();
      bookings.forEach(b => {
        let current = new Date(b.startDate);
        const end = new Date(b.endDate);
        while (current <= end) {
          this.blockedDates.add(this.formatDate(current));
          current.setDate(current.getDate() + 1);
        }
      });
      this.generateCalendar();
    });
  }

  closeModal() {
    this.selectedHouse = null;
  }

  // 2. Logique Calendrier
  changeMonth(delta: number) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    else if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    this.emptyDays = [];
    
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Remplissage des jours vides avant le 1er (Dimanche = 0)
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      this.emptyDays.push({});
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const formatted = this.formatDate(date);
      
      this.calendarDays.push({
        date: date,
        dayNumber: i,
        isBooked: this.blockedDates.has(formatted),
        isPast: date < today
      });
    }
  }

  // 3. Logique Sélection
  selectDate(day: any) {
    if (day.isBooked || day.isPast) return;
    this.errorMessage = '';

    if (!this.startDate || (this.startDate && this.endDate)) {
      // Nouvelle sélection (Clic 1)
      this.startDate = day.date;
      this.endDate = null;
    } else if (this.startDate && !this.endDate) {
      // Fin de période (Clic 2)
      if (day.date < this.startDate) {
        this.startDate = day.date; // Corriger si clic avant
      } else {
        // Vérifier conflit au milieu
        if (this.checkOverlap(this.startDate, day.date)) {
          this.errorMessage = "La période sélectionnée contient des dates déjà réservées.";
          return;
        }
        this.endDate = day.date;
      }
    }
  }

  isSelected(date: Date): boolean {
    return (!!this.startDate && date.getTime() === this.startDate.getTime()) || 
           (!!this.endDate && date.getTime() === this.endDate.getTime());
  }

  isInRange(date: Date): boolean {
    if (!this.startDate || !this.endDate) return false;
    return date > this.startDate && date < this.endDate;
  }

  // Utilitaires
  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    // CORRECTION ICI : Pas de backslashes inutiles car heredoc entre quotes
    return `${year}-${month}-${day}`;
  }

  checkOverlap(start: Date, end: Date): boolean {
    let current = new Date(start);
    while (current <= end) {
      if (this.blockedDates.has(this.formatDate(current))) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  }

  getDaysCount() {
    if(!this.startDate || !this.endDate) return 0;
    const diff = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  calculateTotal() {
    return this.getDaysCount() * this.selectedHouse.price;
  }

  isValidDates() {
    return this.startDate && this.endDate && !this.errorMessage;
  }

  resetSelection() {
    this.startDate = null;
    this.endDate = null;
    this.errorMessage = '';
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  async confirmBooking() {
    if(!this.isValidDates() || !this.userSignal()) return;
    
    this.isSubmitting = true;
    try {
      await this.firebaseService.addBooking({
        houseId: this.selectedHouse.id,
        houseTitle: this.selectedHouse.title,
        userId: this.userSignal()!.uid,
        userEmail: this.userSignal()!.email || 'Anonyme',
        startDate: this.formatDate(this.startDate!),
        endDate: this.formatDate(this.endDate!),
        totalPrice: this.calculateTotal(),
        status: 'pending'
      });
      alert('Demande de réservation envoyée avec succès !');
      this.closeModal();
      this.router.navigate(['/my-bookings']);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la réservation.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
