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
