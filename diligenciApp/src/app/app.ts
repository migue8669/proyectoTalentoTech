import { Component, signal } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps'; // Opcional, para usar referencias o eventos
import { CommonModule } from '@angular/common';
import { Mapa } from './mapa/mapa';
import { Muro } from './muro/muro'; // <--- ¡NUEVA IMPORTACIÓN REQUERIDA!
import { Coordenadas } from './locationService';

@Component({
  selector: 'app-root',
  imports: [GoogleMapsModule, CommonModule, Mapa, Muro],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('DiligenciApp');

}
