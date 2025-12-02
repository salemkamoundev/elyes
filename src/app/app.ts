import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div class="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md">
        <h1 class="text-4xl font-extrabold text-blue-600 mb-4">Elyes Immo 🏠</h1>
        <p class="text-gray-600 mb-6">
          L'installation est réparée ! <br>
          Tailwind CSS v3 est activé.
        </p>
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105">
          Ça fonctionne !
        </button>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'elyes-immo';
}
