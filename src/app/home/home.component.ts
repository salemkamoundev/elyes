import { Component, inject, signal, HostListener } from '@angular/core';
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
      <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
              <div class="bg-blue-600 text-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <span class="font-bold text-xl tracking-tight text-blue-900">ElyesImmo</span>
            </div>
            <div class="flex items-center gap-4">
              <ng-container *ngIf="userSignal() as user; else loginBtn">
                 <ng-container *ngIf="firebaseService.isAdmin(user); else userMenu">
                    <a routerLink="/admin-dashboard" class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-700 transition shadow-lg">Dashboard Admin</a>
                 </ng-container>
                 <ng-template #userMenu>
                    <div class="hidden md:flex items-center gap-2 text-sm text-gray-600 mr-2"><span class="w-2 h-2 rounded-full bg-green-500"></span>{{ user.email }}</div>
                    <a routerLink="/my-bookings" class="text-gray-600 hover:text-blue-600 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 pb-0.5 transition">Mes Demandes</a>
                    <button (click)="logout()" class="text-red-500 hover:text-red-700 text-sm font-medium ml-2">Déconnexion</button>
                 </ng-template>
              </ng-container>
              <ng-template #loginBtn>
                <a routerLink="/login" class="text-blue-600 font-medium text-sm border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">Se connecter</a>
              </ng-template>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section PARALLAX -->
      <div class="relative h-[600px] flex items-center justify-center overflow-hidden">
         <!-- Image de fond animée -->
         <div class="absolute inset-0 z-0" 
              [style.transform]="'translateY(' + parallaxOffset + 'px)'"
              style="will-change: transform;">
           <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                class="w-full h-[120%] object-cover opacity-90 filter brightness-75" alt="Background">
         </div>
         
         <!-- Contenu Hero -->
         <div class="relative z-10 text-center px-4 animate-fade-in-up">
            <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
              L'Excellence <br> <span class="text-blue-400">Immobilière</span>
            </h1>
            <p class="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Découvrez des villas et appartements d'exception en Tunisie.
            </p>
            <button (click)="scrollToListings()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center gap-2 mx-auto">
              Explorer les biens
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
         </div>
      </div>

      <!-- Listings Grid -->
      <div id="listings" class="max-w-7xl mx-auto px-4 py-16 flex-grow w-full">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Nos Propriétés Exclusives</h2>
        
        <div *ngIf="houses$ | async as houses; else loading">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div *ngFor="let house of houses" class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-500 group border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
              
              <!-- Image Card avec Badge Vidéo -->
              <div class="relative h-64 overflow-hidden bg-gray-200 cursor-pointer" (click)="openBookingModal(house)">
                <img [src]="house.imageUrl || 'https://via.placeholder.com/600x400'" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
                
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-900 px-3 py-1 rounded-full font-bold text-sm shadow-sm">
                  {{ house.price }} DT / nuit
                </div>
                
                <!-- Badge si Vidéos disponibles -->
                <div *ngIf="house.videos && house.videos.length > 0" class="absolute bottom-4 left-4 bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                  Vidéo
                </div>
              </div>
              
              <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center text-gray-500 text-sm mb-3">
                  <span class="flex items-center gap-1"><svg class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {{ house.location }}</span>
                  <span class="mx-2">•</span>
                  <span *ngIf="house.bedrooms" class="flex items-center gap-1">🛏️ {{ house.bedrooms }} ch.</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{{ house.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{{ house.description }}</p>
                
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <button (click)="openBookingModal(house)" class="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2">
                    Voir détails & Réserver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #loading>
           <div class="text-center py-20"><div class="animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        </ng-template>
      </div>

      <!-- MODAL DE RÉSERVATION & GALERIE -->
      <div *ngIf="selectedHouse" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
          
          <!-- Colonne Gauche : Galerie -->
          <div class="md:w-1/2 bg-gray-100 p-4 overflow-y-auto border-r border-gray-200">
             <h3 class="font-bold text-lg mb-4 text-gray-800">Galerie Photos</h3>
             <div class="space-y-4">
               <!-- Images -->
               <img *ngFor="let img of (selectedHouse.images || [selectedHouse.imageUrl])" [src]="img" class="w-full rounded-lg shadow-sm hover:shadow-md transition">
               
               <!-- Vidéos -->
               <div *ngIf="selectedHouse.videos?.length">
                 <h4 class="font-bold text-sm mt-6 mb-2 text-gray-700">Vidéos</h4>
                 <video *ngFor="let vid of selectedHouse.videos" [src]="vid" controls class="w-full rounded-lg shadow-sm mb-2 bg-black"></video>
               </div>
             </div>
          </div>

          <!-- Colonne Droite : Formulaire -->
          <div class="md:w-1/2 flex flex-col">
            <div class="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 class="font-bold text-lg">{{ selectedHouse.title }}</h3>
                <p class="text-sm opacity-90">{{ selectedHouse.price }} DT / nuit</p>
              </div>
              <button (click)="closeModal()" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-grow">
              
              <!-- Calendrier & Formulaire existants -->
              <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Sélectionnez vos dates
              </h4>

              <!-- CALENDRIER (Réduit pour s'adapter) -->
              <div class="mb-4 border rounded-lg p-3 bg-gray-50 text-sm">
                <div class="flex justify-between items-center mb-2">
                  <button (click)="changeMonth(-1)" class="p-1 hover:bg-gray-200 rounded">◀</button>
                  <span class="font-bold text-gray-800">{{ currentMonthName }} {{ currentYear }}</span>
                  <button (click)="changeMonth(1)" class="p-1 hover:bg-gray-200 rounded">▶</button>
                </div>
                <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-1">
                  <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                </div>
                <div class="grid grid-cols-7 gap-1">
                  <div *ngFor="let empty of emptyDays" class="h-6"></div>
                  <button *ngFor="let day of calendarDays" 
                    (click)="selectDate(day)"
                    [disabled]="day.isBooked || day.isPast"
                    class="h-7 w-7 rounded-full text-xs flex items-center justify-center transition relative"
                    [ngClass]="{
                      'bg-red-100 text-red-400 line-through': day.isBooked,
                      'text-gray-300': day.isPast && !day.isBooked,
                      'bg-blue-600 text-white font-bold': isSelected(day.date),
                      'bg-blue-100 text-blue-800': isInRange(day.date),
                      'hover:bg-blue-200': !day.isBooked && !day.isPast
                    }">
                    {{ day.dayNumber }}
                  </button>
                </div>
              </div>

              <!-- Récap -->
              <div class="bg-blue-50 p-3 rounded-lg mb-4" *ngIf="startDate && endDate">
                <div class="flex justify-between text-sm">
                  <span>{{ startDate | date:'dd/MM' }} au {{ endDate | date:'dd/MM' }}</span>
                  <span class="font-bold text-blue-700">{{ calculateTotal() }} DT</span>
                </div>
              </div>
              
              <div *ngIf="errorMessage" class="bg-red-50 text-red-600 p-2 rounded text-xs text-center mb-4 border border-red-200">
                {{ errorMessage }}
              </div>
            </div>

            <div class="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
              <button (click)="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100">Annuler</button>
              <button (click)="confirmBooking()" [disabled]="!isValidDates() || isSubmitting" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow">
                {{ isSubmitting ? '...' : 'Confirmer' }}
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
  blockedDates: Set<string> = new Set();
  
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: any[] = [];
  emptyDays: any[] = [];
  
  startDate: Date | null = null;
  endDate: Date | null = null;
  parallaxOffset = 0;
  
  errorMessage = '';
  isSubmitting = false;

  constructor() {
    this.firebaseService.user$.subscribe(u => this.userSignal.set(u));
  }

  // PARALLAX LISTENER
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) { // CORRECTION : Ajout de l'argument 'event: Event'
    const scrollY = window.scrollY;
    // On limite l'effet pour ne pas surcharger le rendu
    if (scrollY < 800) {
      this.parallaxOffset = scrollY * 0.5;
    }
  }

  scrollToListings() {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  }

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('fr-FR', { month: 'long' });
  }

  logout() { this.firebaseService.logout(); }

  openBookingModal(house: any) {
    if (!this.userSignal()) {
      alert("Veuillez vous connecter pour voir les détails.");
      this.router.navigate(['/login']);
      return;
    }
    this.selectedHouse = house;
    this.resetSelection();
    
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

  selectDate(day: any) {
    if (day.isBooked || day.isPast) return;
    this.errorMessage = '';

    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = day.date;
      this.endDate = null;
    } else if (this.startDate && !this.endDate) {
      if (day.date < this.startDate) {
        this.startDate = day.date;
      } else {
        if (this.checkOverlap(this.startDate, day.date)) {
          this.errorMessage = "Période indisponible.";
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

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
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
      alert('Réservation envoyée !');
      this.closeModal();
      this.router.navigate(['/my-bookings']);
    } catch (e) {
      console.error(e);
      alert('Erreur.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
