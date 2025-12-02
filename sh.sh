#!/bin/bash
set -e

# Vérification du dossier
if [ -d "elyes-immo" ]; then
    cd elyes-immo
fi

echo "🔧 Correction de l'erreur 'Invalid Compact JWS' avec la clé secrète fournie (ATTENTION: À changer pour la production)..."

# 1. MISE À JOUR ENVIRONNEMENT (Insertion de la Clé Secrète dans le champ 'key')
echo "🌍 Mise à jour de src/environments/environment.ts avec la Clé Secrète..."
cat > src/environments/environment.ts <<'EOF'
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
    // CLÉ SECRÈTE UTILISÉE TEMPORAIREMENT POUR LE DÉVELOPPEMENT. DOIT ÊTRE REMPLACÉE PAR LA CLÉ PUBLIQUE + RLS EN PROD.
    url: 'https://qailxxltsofkgtfkgzhv.supabase.co',
    key: 'sb_secret_Qxw6yEx9L0hDSNg6uZo4Yg_GvmWX68x', 
    bucket: 'propositionspourkerkennah' 
  }
};
EOF

# 2. MISE À JOUR DU SERVICE SUPABASE (Aucun changement nécessaire, il utilise déjà environment.key)
echo "☁️ Mise à jour de SupabaseService (Le service utilisera désormais la clé secrète pour l'upload)."
cat > src/app/services/supabase.service.ts <<'EOF'
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    this.bucketName = environment.supabaseConfig.bucket;
    // Crée le client avec la clé fournie (maintenant la clé secrète)
    this.supabase = createClient(environment.supabaseConfig.url, environment.supabaseConfig.key);
  }

  async uploadFile(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      
      // Upload vers le bucket défini dans l'environnement
      const { data, error } = await this.supabase.storage
        .from(this.bucketName) 
        .upload(fileName, file);

      if (error) {
        console.error('Erreur Upload Supabase:', error);
        // Si l'erreur est liée aux permissions (400 Bad Request), la clé secrète devrait la bypasser.
        // Si l'erreur persiste, assurez-vous que l'URL et le nom du bucket sont corrects.
        return null;
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName) 
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Exception Upload:', e);
      return null;
    }
  }
}
EOF

# 3. MISE A JOUR DU SERVICE FIREBASE (CRUD complet des maisons)
echo "🛠️ Mise à jour de FirebaseService (CRUD House)..."
cat > src/app/services/firebase.service.ts <<'EOF'
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, Firestore, serverTimestamp, query, where, orderBy, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Nouvelle Interface House avec support multimédia
export interface House {
  id?: string;
  title: string;
  price: number;
  location: string;
  description: string;
  // On garde imageUrl pour la compatibilité, mais on ajoute les listes
  imageUrl: string; 
  images: string[];
  videos: string[];
  bedrooms: number;
  createdAt: any;
}

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

export interface FooterConfig {
  phone: string;
  email: string;
  address: string;
  copyright: string;
  facebookUrl?: string;
  instagramUrl?: string;
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

  // --- HOUSES CRUD ---
  getHouses(): Observable<House[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'houses');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const houses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
          observer.next(houses);
        }, (error) => observer.error(error));
      return () => unsubscribe();
    });
  }

  async getHouseById(id: string): Promise<House | null> {
    const docRef = doc(this.db, 'houses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as House;
    }
    return null;
  }

  async addHouse(houseData: Omit<House, 'id' | 'createdAt'>): Promise<void> {
    const colRef = collection(this.db, 'houses');
    await addDoc(colRef, { ...houseData, createdAt: serverTimestamp() });
  }
  
  async updateHouse(id: string, houseData: Partial<House>): Promise<void> {
    const docRef = doc(this.db, 'houses', id);
    await updateDoc(docRef, houseData);
  }

  async deleteHouse(id: string): Promise<void> {
    const docRef = doc(this.db, 'houses', id);
    await deleteDoc(docRef);
  }

  // --- BOOKINGS ---
  async addBooking(booking: Partial<Booking>) {
    const colRef = collection(this.db, 'bookings');
    return await addDoc(colRef, { ...booking, status: 'pending', createdAt: serverTimestamp() });
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

  getApprovedBookingsForHouse(houseId: string): Observable<Booking[]> {
    return new Observable((observer) => {
      const colRef = collection(this.db, 'bookings');
      const q = query(colRef, where('houseId', '==', houseId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
          .filter(b => b.status === 'approved');
        observer.next(bookings);
      });
      return () => unsubscribe();
    });
  }

  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.db, 'bookings', bookingId);
    return await updateDoc(docRef, { status });
  }

  // --- FOOTER ---
  getFooterConfig(): Observable<FooterConfig> {
    return new Observable((observer) => {
      const docRef = doc(this.db, 'settings', 'footer');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          observer.next(docSnap.data() as FooterConfig);
        } else {
          observer.next({ phone: '+216 215 415 425', email: 'elyes@gmail.com', address: 'Tunis', copyright: '2025 ElyesImmo' });
        }
      });
      return () => unsubscribe();
    });
  }

  async updateFooterConfig(config: FooterConfig) {
    const docRef = doc(this.db, 'settings', 'footer');
    return await setDoc(docRef, config, { merge: true });
  }
}
EOF

# 4. MISE A JOUR ADD HOUSE (Gestion Création/Modification)
echo "📝 Mise à jour de AddHouseComponent (CRUD House)."
cat > src/app/add-house/add-house.component.ts <<'EOF'
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FirebaseService, House } from '../services/firebase.service';
import { SupabaseService } from '../services/supabase.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-house',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        
        <div class="bg-blue-600 p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">{{ isEditMode ? 'Modifier Annonce' : 'Publier une annonce' }}</h2>
          <a routerLink="/admin-dashboard" class="text-blue-100 hover:text-white text-sm font-medium">✕ Annuler</a>
        </div>

        <div *ngIf="isLoadingHouse" class="p-8 text-center text-gray-500">
           Chargement des données de la maison...
        </div>

        <form *ngIf="!isLoadingHouse" [formGroup]="houseForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Titre de l'annonce</label>
            <input formControlName="title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="Ex: Villa S+3 Hammamet">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Prix -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Prix (DT)</label>
              <input formControlName="price" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500">
            </div>
            <!-- Chambres -->
             <div>
              <label class="block text-sm font-medium text-gray-700">Chambres</label>
              <input formControlName="bedrooms" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500">
            </div>
          </div>

          <!-- Localisation -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Localisation</label>
            <input formControlName="location" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="Tunis, Sousse...">
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>

          <!-- UPLOAD MULTIMEDIA -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <label class="cursor-pointer block">
              <span class="block text-blue-600 font-bold mb-1">Cliquez pour ajouter des photos et vidéos</span>
              <span class="block text-xs text-gray-500">ou glissez-déposez vos fichiers ici</span>
              <input type="file" multiple (change)="onFileSelected($event)" class="hidden" accept="image/*,video/*">
            </label>
            
            <!-- Prévisualisation des uploads -->
            <div class="mt-4 grid grid-cols-4 gap-2" *ngIf="uploadedFiles.length > 0">
              <div *ngFor="let file of uploadedFiles; let i = index" class="relative group aspect-square bg-gray-100 rounded overflow-hidden">
                <!-- Bouton de suppression -->
                <button type="button" (click)="removeFile(i)" class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                </button>
                <!-- Media -->
                <img *ngIf="file.type === 'image'" [src]="file.url" class="w-full h-full object-cover">
                <div *ngIf="file.type === 'video'" class="w-full h-full flex items-center justify-center bg-black text-white text-xs">Vidéo</div>
              </div>
              <!-- Loading Spinner -->
              <div *ngIf="isUploading" class="aspect-square flex items-center justify-center bg-gray-50">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>

          <!-- Bouton Submit -->
          <div>
            <button type="submit" 
              [disabled]="houseForm.invalid || isSubmitting || isUploading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting ? (isEditMode ? 'Sauvegarde...' : 'Publication...') : (isUploading ? 'Upload en cours...' : (isEditMode ? 'Enregistrer les modifications' : 'Publier l\\'annonce')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddHouseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = false;
  isUploading = false;
  isLoadingHouse = true;
  isEditMode = false;
  houseId: string | null = null;
  
  uploadedFiles: { url: string, type: 'image' | 'video' }[] = [];

  houseForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    location: ['', Validators.required],
    description: ['', Validators.required],
    bedrooms: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.houseId = params.get('id');
        this.isEditMode = !!this.houseId;

        if (this.isEditMode && this.houseId) {
          return this.firebaseService.getHouseById(this.houseId);
        }
        this.isLoadingHouse = false;
        return of(null);
      })
    ).subscribe(house => {
      if (house) {
        this.houseForm.patchValue(house);
        // CORRECTION DE L'ERREUR ICI : Utilisation de || [] pour s'assurer que .map est appelé sur un tableau
        this.uploadedFiles = [
          ...(house.images || []).map(url => ({ url, type: 'image' as const })),
          ...(house.videos || []).map(url => ({ url, type: 'video' as const }))
        ];
      }
      this.isLoadingHouse = false;
    });
  }

  // Gestion Upload
  async handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    this.isUploading = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await this.supabaseService.uploadFile(file);
      if (url) {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        this.uploadedFiles.push({ url, type });
      }
    }
    this.isUploading = false;
  }

  onFileSelected(event: any) {
    this.handleFiles(event.target.files);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.handleFiles(event.dataTransfer?.files || null);
  }
  
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  isImage(url: string): boolean {
    const file = this.uploadedFiles.find(f => f.url === url);
    return file ? file.type === 'image' : false;
  }

  async onSubmit() {
    if (this.houseForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.houseForm.value;

    const images = this.uploadedFiles.filter(f => f.type === 'image').map(f => f.url);
    const videos = this.uploadedFiles.filter(f => f.type === 'video').map(f => f.url);
    
    const mainImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400?text=Pas+d+image';

    const houseData = {
        ...formVal,
        images,
        videos,
        imageUrl: mainImage
    };

    try {
      if (this.isEditMode && this.houseId) {
        await this.firebaseService.updateHouse(this.houseId, houseData);
        alert('Annonce mise à jour !');
      } else {
        await this.firebaseService.addHouse(houseData);
        alert('Annonce publiée !');
      }
      this.router.navigate(['/admin-dashboard']);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
EOF

# 5. MISE A JOUR ADMIN DASHBOARD (Ajout Onglet Propriétés CRUD)
echo "👑 Mise à jour AdminDashboard (Onglet Propriétés CRUD)..."
cat > src/app/admin-dashboard/admin-dashboard.component.ts <<'EOF'
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, Booking, FooterConfig, House } from '../services/firebase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink, Router } from '@angular/router';

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
        
        <!-- Navigation Onglets -->
        <div class="flex space-x-4 mb-8 border-b border-gray-300 pb-2">
          <button (click)="activeTab = 'properties'" [class.text-blue-600]="activeTab === 'properties'" [class.border-b-2]="activeTab === 'properties'" [class.border-blue-600]="activeTab === 'properties'" class="pb-2 font-medium text-gray-600 hover:text-blue-600 transition">
            Propriétés (Maisons)
          </button>
          <button (click)="activeTab = 'bookings'" [class.text-blue-600]="activeTab === 'bookings'" [class.border-b-2]="activeTab === 'bookings'" [class.border-blue-600]="activeTab === 'bookings'" class="pb-2 font-medium text-gray-600 hover:text-blue-600 transition">
            Demandes de Location
          </button>
          <button (click)="activeTab = 'settings'" [class.text-blue-600]="activeTab === 'settings'" [class.border-b-2]="activeTab === 'settings'" [class.border-blue-600]="activeTab === 'settings'" class="pb-2 font-medium text-gray-600 hover:text-blue-600 transition">
            Paramètres du Site
          </button>
        </div>

        <!-- ONGLET 1 : PROPRIÉTÉS (CRUD) -->
        <div *ngIf="activeTab === 'properties'" class="animate-fade-in">
          <div class="mb-6 flex justify-between items-end">
             <h2 class="text-2xl font-bold text-gray-800">Gestion des Maisons</h2>
             <a routerLink="/add" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                <span>+</span> Ajouter Maison
             </a>
          </div>

          <div class="bg-white rounded-xl shadow-md overflow-hidden">
             <div class="overflow-x-auto">
               <table class="min-w-full divide-y divide-gray-200">
                 <thead class="bg-gray-50">
                   <tr>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre & Localisation</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix/Nuit</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambres</th>
                     <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                   </tr>
                 </thead>
                 <tbody class="bg-white divide-y divide-gray-200" *ngIf="houses$ | async as houses">
                   <tr *ngFor="let house of houses">
                     <td class="px-6 py-4 whitespace-nowrap">
                        <img [src]="house.imageUrl" class="h-10 w-10 rounded object-cover" alt="Maison">
                     </td>
                     <td class="px-6 py-4">
                       <div class="text-sm font-medium text-gray-900">{{ house.title }}</div>
                       <div class="text-xs text-gray-500">{{ house.location }}</div>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ house.price }} DT</td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ house.bedrooms }}</td>
                     <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <a [routerLink]="['/add', house.id]" class="text-blue-600 hover:text-blue-900 mr-4">Modifier</a>
                       <button (click)="deleteHouse(house.id!)" class="text-red-600 hover:text-red-900">Supprimer</button>
                     </td>
                   </tr>
                   <tr *ngIf="houses.length === 0"><td colspan="5" class="px-6 py-10 text-center text-gray-500">Aucune propriété enregistrée.</td></tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <!-- ONGLET 2 : RESERVATIONS -->
        <div *ngIf="activeTab === 'bookings'" class="animate-fade-in">
          <!-- Contenu du tableau de réservations existant -->
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Gestion des Demandes de Location</h2>
          
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriété</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" *ngIf="bookings$ | async as bookings">
                <tr *ngFor="let booking of bookings">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ booking.userEmail }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ booking.houseTitle }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ booking.startDate }} > {{ booking.endDate }}</td>
                  <td class="px-6 py-4 text-sm font-bold">{{ booking.totalPrice }} DT</td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 text-xs rounded-full" [ngClass]="{'bg-yellow-100 text-yellow-800': booking.status==='pending', 'bg-green-100 text-green-800': booking.status==='approved', 'bg-red-100 text-red-800': booking.status==='rejected'}">
                      {{ booking.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div *ngIf="booking.status === 'pending'">
                      <button (click)="updateBookingStatus(booking.id!, 'approved')" class="text-green-600 hover:text-green-900 mr-3">Valider</button>
                      <button (click)="updateBookingStatus(booking.id!, 'rejected')" class="text-red-600 hover:text-red-900">Refuser</button>
                    </div>
                    <span *ngIf="booking.status !== 'pending'" class="text-gray-400">Traité</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ONGLET 3 : PARAMETRES FOOTER -->
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
  router = inject(Router);
  
  // Onglets
  activeTab: 'properties' | 'bookings' | 'settings' = 'properties';

  // Data Houses
  houses$: Observable<House[]> = this.firebaseService.getHouses();

  // Data Bookings
  bookings$: Observable<Booking[]> = this.firebaseService.getAllBookings();

  // Data Settings
  footerConfig: FooterConfig | null = null;
  isSaving = false;
  saveMessage = '';

  ngOnInit() {
    // Charger la config du footer
    this.firebaseService.getFooterConfig().subscribe(config => {
      this.footerConfig = config;
    });
  }

  // Actions Bookings
  async updateBookingStatus(id: string, status: 'approved' | 'rejected') {
    if(confirm('Confirmer ?')) {
      await this.firebaseService.updateBookingStatus(id, status);
    }
  }

  // Actions Houses
  async deleteHouse(id: string) {
    if(confirm('Êtes-vous sûr de vouloir supprimer cette maison ? Cette action est irréversible.')) {
      try {
        await this.firebaseService.deleteHouse(id);
        alert('Maison supprimée.');
      } catch (e) {
        console.error(e);
        alert('Erreur lors de la suppression.');
      }
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
EOF

# 6. MISE A JOUR ROUTING (Utilisation de l'ID pour la modification)
echo "🛣️ Mise à jour du Routage (Modification: /add/:id)..."
cat > src/app/app.routes.ts <<'EOF'
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddHouseComponent } from './add-house/add-house.component';
import { LoginComponent } from './login/login.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Pour la création et la modification (ajout/ID de maison)
  { path: 'add', component: AddHouseComponent }, 
  { path: 'add/:id', component: AddHouseComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
EOF

echo "✅ Configuration Supabase mise à jour et intégrée !"