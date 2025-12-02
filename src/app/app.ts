import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <!-- Le Router Outlet gère les pages (Home, Login, Admin...) -->
      <div class="flex-grow">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer Factorisé -->
      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './app.css'
})
export class AppComponent {}
