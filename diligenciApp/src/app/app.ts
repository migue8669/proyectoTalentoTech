import { Component, signal } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'; // Opcional, para usar referencias o eventos
import { CommonModule } from '@angular/common';
import { Mapa } from './mapa/mapa';
import { Muro } from './muro/muro';
import { LoginComponent } from "./login/login";
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [GoogleMapsModule, CommonModule, Mapa, Muro, LoginComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('DiligenciApp');
}


