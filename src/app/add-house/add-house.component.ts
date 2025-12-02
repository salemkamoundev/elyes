import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-add-house',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        
        <div class="bg-blue-600 p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Publier une annonce</h2>
          <a routerLink="/" class="text-blue-100 hover:text-white text-sm font-medium">✕ Annuler</a>
        </div>

        <form [formGroup]="houseForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Titre de l'annonce</label>
            <input formControlName="title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="Ex: Villa S+3 Hammamet">
            <p *ngIf="houseForm.get('title')?.touched && houseForm.get('title')?.invalid" class="mt-1 text-sm text-red-600">Le titre est requis.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Prix -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Prix (DT)</label>
              <input formControlName="price" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="1200">
            </div>

            <!-- Localisation -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Localisation</label>
              <input formControlName="location" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="Tunis, Sousse...">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Chambres -->
             <div>
              <label class="block text-sm font-medium text-gray-700">Chambres</label>
              <input formControlName="bedrooms" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="3">
            </div>
             <!-- URL Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700">URL de l'image</label>
              <input formControlName="imageUrl" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="https://...">
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500" placeholder="Décrivez votre bien..."></textarea>
          </div>

          <!-- Bouton Submit -->
          <div>
            <button type="submit" 
              [disabled]="houseForm.invalid || isSubmitting"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting ? 'Publication en cours...' : 'Publier l\'annonce' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddHouseComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  isSubmitting = false;

  houseForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    location: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    bedrooms: [1, [Validators.required, Validators.min(0)]]
  });

  async onSubmit() {
    if (this.houseForm.invalid) return;

    this.isSubmitting = true;
    try {
      await this.firebaseService.addHouse(this.houseForm.value);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la publication.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
