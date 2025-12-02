#!/bin/bash
set -e

# Vérification du dossier
if [ -d "elyes-immo" ]; then
    cd elyes-immo
fi

echo "🔐 Configuration Login Firebase & Supabase..."

# 1. MISE À JOUR DE L'ENVIRONNEMENT (Avec Supabase)
echo "🌍 Mise à jour de src/environments/environment.ts..."
cat > src/environments/environment.ts <<EOF
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyDll32rZOyn9kan59MUaaYUONYBB5eNXk0',
    authDomain: 'elyes-2e850.firebaseapp.com',
    projectId: 'elyes-2e850',
    storageBucket: 'elyes-2e850.firebasestorage.app',
    messagingSenderId: '516472898770',
    appId: '1:516472898770:web:ec880b8404688be135d90b',
    measurementId: 'G-7L01JCJPEQ'
  },
  supabaseConfig: {
    secret: 'sb_secret_Qxw6yEx9L0hDSNg6uZo4Yg_GvmWX68x',
    publishable: 'sb_publishable_zgqJtHLLSJ0bCB0b545I8A_CMDlUTqT'
  }
};
EOF

# 2. MISE À JOUR DU SERVICE FIREBASE (Auth Methods)
echo "🛠️ Mise à jour de FirebaseService (Ajout Login/Register)..."
cat > src/app/services/firebase.service.ts <<EOF
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
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
  serverTimestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  public auth: Auth = getAuth(this.app);
  public db: Firestore = getFirestore(this.app);
  
  // Observable de l'état utilisateur (créé manuellement avec onAuthStateChanged)
  user$: Observable<User | null> = new Observable((observer) => {
    // onAuthStateChanged retourne une fonction de désinscription (unsubscribe)
    return onAuthStateChanged(this.auth, 
      (user) => observer.next(user),
      (error) => observer.error(error)
    );
  });

  constructor() {}

  // --- AUTHENTIFICATION ---

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  register(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  // --- FIRESTORE ---

  getHouses(): Observable<any[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const unsubscribe = onSnapshot(colRef, 
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
    return await addDoc(colRef, {
      ...houseData,
      createdAt: serverTimestamp()
    });
  }
}
EOF

# 3. CRÉATION DU LOGIN COMPONENT
echo "👤 Création de LoginComponent..."
mkdir -p src/app/login

cat > src/app/login/login.component.ts <<EOF
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: \`
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-blue-600 text-white rounded flex items-center justify-center text-xl font-bold">
            E
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{ isLoginMode() ? 'Connexion' : 'Créer un compte' }}
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ isLoginMode() ? 'Ou' : 'Déjà inscrit ?' }}
            <button (click)="toggleMode()" class="font-medium text-blue-600 hover:text-blue-500 underline focus:outline-none">
              {{ isLoginMode() ? 'créer un nouveau compte' : 'se connecter' }}
            </button>
          </p>
        </div>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Adresse Email</label>
              <input formControlName="email" type="email" required 
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Adresse Email">
            </div>
            <div>
              <label for="password" class="sr-only">Mot de passe</label>
              <input formControlName="password" type="password" required 
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Mot de passe">
            </div>
          </div>

          <!-- Message d'erreur -->
          <div *ngIf="errorMessage()" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
            {{ errorMessage() }}
          </div>

          <div>
            <button type="submit" 
              [disabled]="authForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoginMode() ? 'Se connecter' : 'S\\'inscrire' }}
            </button>
          </div>
        </form>
        
        <div class="text-center mt-4">
           <a routerLink="/" class="text-sm text-gray-500 hover:text-gray-900">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  \`
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(FirebaseService);
  router = inject(Router);

  isLoginMode = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode() {
    this.isLoginMode.update(val => !val);
    this.errorMessage.set('');
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const { email, password } = this.authForm.value;

    try {
      if (this.isLoginMode()) {
        await this.authService.login(email, password);
      } else {
        await this.authService.register(email, password);
      }
      // Redirection vers l'accueil après succès
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error(error);
      let msg = "Une erreur est survenue.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = "Email ou mot de passe incorrect.";
      } else if (error.code === 'auth/email-already-in-use') {
        msg = "Cet email est déjà utilisé.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Le mot de passe doit contenir au moins 6 caractères.";
      }
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
EOF

# 4. MISE À JOUR DU ROUTAGE
echo "🛣️ Ajout de la route /login..."
cat > src/app/app.routes.ts <<EOF
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddHouseComponent } from './add-house/add-house.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: AddHouseComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
EOF

# 5. MISE À JOUR DE LA NAVBAR (HOME)
echo "🏠 Mise à jour de la Navbar pour afficher Login/Logout..."
cat > src/app/home/home.component.ts <<EOF
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: \`
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
  \`
})
export class HomeComponent {
  firebaseService = inject(FirebaseService);
  houses$: Observable<any[]> = this.firebaseService.getHouses();

  logout() {
    this.firebaseService.logout();
  }
}
EOF

echo "✅ Page Login ajoutée, Config Supabase mise à jour !"
echo "👉 Rafraîchis la page pour voir le bouton 'Se connecter'."