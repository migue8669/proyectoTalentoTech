import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Mapa } from './mapa/mapa';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mapa', component: Mapa, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
