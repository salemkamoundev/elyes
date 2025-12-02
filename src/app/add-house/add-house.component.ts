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
