import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex flex-col min-h-screen">
      
      <!-- Contenu Principal (Prend tout l'espace disponible) -->
      <div class="flex-grow">
        <router-outlet></router-outlet>
      </div>

      <!-- FOOTER -->
      <footer class="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            <!-- Colonne 1: Identité & Logo -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span class="text-2xl font-bold tracking-tight text-white">ElyesImmo</span>
              </div>
              <p class="text-gray-400 text-sm leading-relaxed max-w-xs">
                Votre partenaire de confiance pour trouver la maison de vos rêves en Tunisie. Villas, appartements et studios d'exception.
              </p>
              <!-- Réseaux sociaux (Exemple visuel) -->
              <div class="flex gap-4 pt-2">
                <a href="#" class="text-gray-400 hover:text-white transition"><span class="sr-only">Facebook</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg></a>
                <a href="#" class="text-gray-400 hover:text-white transition"><span class="sr-only">Instagram</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.527c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" /></svg></a>
              </div>
            </div>

            <!-- Colonne 2: Contact Infos -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-500 mb-4">Contact</h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <span class="block text-sm font-medium text-white">Téléphone</span>
                    <a href="tel:+216215415425" class="hover:text-blue-400 transition">+216 215 415 425</a>
                  </div>
                </li>
                <li class="flex items-start gap-3 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span class="block text-sm font-medium text-white">Email</span>
                    <a href="mailto:elyes@gmail.com" class="hover:text-blue-400 transition">elyes@gmail.com</a>
                  </div>
                </li>
                <li class="flex items-start gap-3 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span class="block text-sm font-medium text-white">Bureau</span>
                    <span>Tunis, Tunisie</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Colonne 3: Liens & Horaires -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-500 mb-4">Informations</h3>
              <ul class="space-y-2 text-sm text-gray-400">
                <li><a href="#" class="hover:text-white transition">À propos de nous</a></li>
                <li><a href="#" class="hover:text-white transition">Conditions Générales</a></li>
                <li><a href="#" class="hover:text-white transition">Politique de Confidentialité</a></li>
                <li><a href="#" class="hover:text-white transition">Support Client</a></li>
              </ul>
              <div class="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <p class="text-xs text-gray-400">Heures d'ouverture :</p>
                <p class="text-sm font-medium text-white">Lun - Ven : 09:00 - 18:00</p>
                <p class="text-sm font-medium text-white">Samedi : 09:00 - 13:00</p>
              </div>
            </div>

          </div>

          <!-- Barre Copyright -->
          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2025 ElyesImmo. Tous droits réservés.</p>
            <div class="flex gap-6 mt-4 md:mt-0">
              <span class="hover:text-gray-300 cursor-pointer">Confidentialité</span>
              <span class="hover:text-gray-300 cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './app.css'
})
export class AppComponent {}
