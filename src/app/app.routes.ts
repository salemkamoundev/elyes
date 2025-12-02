import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddHouseComponent } from './add-house/add-house.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: AddHouseComponent },
  { path: '**', redirectTo: '' }
];
