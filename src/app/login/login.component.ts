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

        <div class="mt-8 space-y-6">
          
          <!-- Bouton Google -->
          <button (click)="onGoogleLogin()" type="button" class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.369 -10.154 45.569 L -6.904 42.319 C -8.964 40.399 -11.634 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -22.424 46.099 -25.074 43.769 -14.754 43.769 Z"/>
              </g>
            </svg>
            Continuer avec Google
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou avec email</span>
            </div>
          </div>

          <!-- Formulaire Email -->
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-6">
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
        </div>
        
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

  // Connexion Google
  async onGoogleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error(error);
      this.errorMessage.set("Erreur Google : " + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Connexion Email/Password
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
