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
