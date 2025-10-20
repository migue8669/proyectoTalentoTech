import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Mapa } from './mapa/mapa';
import { AuthGuard } from './services/auth.guard';
import { RecuperarComponent } from './recuperar/recuperar';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mapa', component: Mapa, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'recuperar', component: RecuperarComponent }

];
