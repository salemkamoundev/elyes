import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
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
              {{ isLoginMode() ? 'Se connecter' : 'S\'inscrire' }}
            </button>
          </div>
        </form>
        
        <div class="text-center mt-4">
           <a routerLink="/" class="text-sm text-gray-500 hover:text-gray-900">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  `
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
