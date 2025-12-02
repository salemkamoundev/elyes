#!/bin/bash
set -e

# Vérification du dossier
if [ -d "elyes-immo" ]; then
    cd elyes-immo
fi

echo "🚀 Création du Dashboard Administrateur et restructuration du menu..."

# 1. SERVICE FIREBASE (Confirmation des fonctions Admin)
# On s'assure que updateBookingStatus est bien présent et correct
cat > src/app/services/firebase.service.ts <<'EOF'
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  Firestore,
  serverTimestamp,
  query,
  where,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id?: string;
  houseId: string;
  houseTitle: string;
  userId: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  public auth: Auth = getAuth(this.app);
  public db: Firestore = getFirestore(this.app);
  
  user$: Observable<User | null> = new Observable((observer) => {
    return onAuthStateChanged(this.auth, 
      (user) => observer.next(user),
      (error) => observer.error(error)
    );
  });

  constructor() {}

  // --- AUTH ---
  login(email: string, pass: string) { return signInWithEmailAndPassword(this.auth, email, pass); }
  register(email: string, pass: string) { return createUserWithEmailAndPassword(this.auth, email, pass); }
  loginWithGoogle() { return signInWithPopup(this.auth, new GoogleAuthProvider()); }
  logout() { return signOut(this.auth); }
  
  isAdmin(user: User | null): boolean {
    return user?.email === 'elyes@gmail.com';
  }

  // --- HOUSES ---
  getHouses(): Observable<any[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const houses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(houses);
        },
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async addHouse(houseData: any): Promise<any> {
    const colRef = collection(this.db, 'houses');
    return await addDoc(colRef, { ...houseData, createdAt: serverTimestamp() });
  }

  // --- BOOKINGS ---
  async addBooking(booking: Partial<Booking>) {
    const colRef = collection(this.db, 'bookings');
    return await addDoc(colRef, {
      ...booking,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  getAllBookings(): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  // Action Admin : Valider ou Refuser
  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.db, 'bookings', bookingId);
    return await updateDoc(docRef, { status });
  }
}
EOF

# 2. NOUVEAU DASHBOARD ADMIN COMPLET
# Remplace l'ancien AdminBookingsComponent par un Dashboard complet
echo "👑 Création de AdminDashboardComponent..."
mkdir -p src/app/admin-dashboard
cat > src/app/admin-dashboard/admin-dashboard.component.ts <<'EOF'
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
EOF

# 3. MISE À JOUR HOME (Nettoyage Menu)
echo "🏠 Mise à jour du Menu Principal (Séparation Admin/User)..."
cat > src/app/home/home.component.ts <<'EOF'
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
EOF

# 4. ROUTES
echo "🛣️ Configuration des routes (Dashboard Admin)..."
cat > src/app/app.routes.ts <<'EOF'
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddHouseComponent } from './add-house/add-house.component';
import { LoginComponent } from './login/login.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: AddHouseComponent },
  { path: 'login', component: LoginComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
EOF

echo "✅ Dashboard Admin créé avec succès !"
echo "👉 Connectez-vous avec 'elyes@gmail.com' pour y accéder."