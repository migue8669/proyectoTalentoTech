import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterOutlet } from '@angular/router';
import { Coordenadas, LocationService } from '../locationService';

@Component({
  selector: 'app-mapa',
  imports: [GoogleMapsModule,CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class Mapa {

  latitude: number =0;
  longitude: number =0;
  errorGeoloc: string | null = null;
  isLoading = false;
  constructor(private locationService: LocationService) { }

  getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    this.locationService
      .getPosition()
      .then((pos: Coordenadas) => {
        // Asignar los valores obtenidos
        this.latitude = pos.lat;
        this.longitude = pos.lng;
        this.isLoading = false;
        console.log('Latitud:', this.latitude, 'Longitud:', this.longitude);
      })
      .catch((error) => {
        // Manejar el error (ej. usuario denegó el acceso)
        this.errorGeoloc = 'Error al obtener la ubicación: ' + error.message;
        this.isLoading = false;
        console.error('Error de geolocalización:', error);
      });
  }

  center: google.maps.LatLngLiteral = {
    lat: this.latitude, // Latitud de ejemplo (Ciudad de México)
    lng: this.longitude, // Longitud de ejemplo (Ciudad de México)
  };
  // Nivel de zoom
    zoom = 12;

  markerPositions: google.maps.LatLngLiteral[] = [
    { lat: this.latitude, lng: this.longitude },
    { lat: this.latitude, lng: this.longitude },
  ];
    // Opciones del mapa (opcional)
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'hybrid', // Puede ser 'roadmap', 'satellite', 'hybrid', 'terrain'
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
  };
}
