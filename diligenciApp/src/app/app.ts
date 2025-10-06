import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps'; // Opcional, para usar referencias o eventos
import { CommonModule } from '@angular/common'; // <--- ¡NUEVA IMPORTACIÓN REQUERIDA!

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,GoogleMapsModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DiligenciApp');

  center: google.maps.LatLngLiteral = {
    lat: 19.4326, // Latitud de ejemplo (Ciudad de México)
    lng: -99.1332 // Longitud de ejemplo (Ciudad de México)
  };

  // Nivel de zoom
  zoom = 12;

  // Opciones del mapa (opcional)
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'hybrid', // Puede ser 'roadmap', 'satellite', 'hybrid', 'terrain'
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
  };

  // Marcadores (opcional)
  markerPositions: google.maps.LatLngLiteral[] = [
    { lat: 19.4326, lng: -99.1332 },
    { lat: 19.42, lng: -99.15 }
  ];

}
