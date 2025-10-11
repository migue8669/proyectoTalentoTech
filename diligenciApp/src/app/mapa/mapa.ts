import { Muro } from './../muro/muro';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { Coordenadas, LocationService } from '../locationService';

// Extensión de LatLngLiteral para incluir el título del marcador
interface MapMarker extends google.maps.LatLngLiteral {
  title: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, Muro],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements OnInit {
  // 🚨 CORRECCIÓN CLAVE: Inicializar con un valor por defecto.
  // Esto asegura que Muro reciba un objeto válido inmediatamente.

  newLocationData: Coordenadas = { lat: 40.7128, lng: -74.006 };

  latitude: number = 40.7128; // Default NYC
  longitude: number = -74.006;

  errorGeoloc: string | null = null;
  isLoading = false;

  center: google.maps.LatLngLiteral = { lat: this.latitude, lng: this.longitude };
  zoom = 12;

  markerPositions: MapMarker[] = [
    { lat: this.latitude, lng: this.longitude, title: 'Ubicación Inicial' },
  ];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
    mapId: 'DEMO_MAP_ID',
  };

  constructor(private locationService: LocationService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getLocation();
  }

  async getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    try {
      const pos: Coordenadas = await this.locationService.getPosition();

      console.log('INTENTO: Llamando a getPosition...'); // Creamos una nueva referencia de objeto (pos) para forzar ngOnChanges en Muro.

      this.newLocationData = pos;
      console.log('✅ Ubicación obtenida y nueva referencia asignada:', this.newLocationData); // Actualizar mapa con la nueva posición
      this.cdRef.detectChanges();
      this.latitude = pos.lat;
      this.longitude = pos.lng;
      this.center = { lat: pos.lat, lng: pos.lng };
      this.markerPositions = [
        {
          lat: pos.lat,
          lng: pos.lng,
          title: 'Mi ubicación actual',
        },
      ];
      this.zoom = 14;

      console.log('ÉXITO: Ubicación obtenida y mapa actualizado.', this.center);
    } catch (error: any) {
      this.errorGeoloc = 'Error al obtener la ubicación: ' + error.message; // Si falla, seteamos explícitamente a undefined para que Muro muestre el mensaje de error. //this.newLocationData = undefined;

      this.center = { lat: this.latitude, lng: this.longitude };
      this.markerPositions = [
        { lat: this.latitude, lng: this.longitude, title: 'Ubicación por defecto (Error GPS)' },
      ];
      this.mapOptions = {
        ...this.mapOptions,
        disableDoubleClickZoom: !this.mapOptions.disableDoubleClickZoom,
      };
      console.error('FALLO: Se ejecutó el bloque catch. Error:', error.message);
    } finally {
      this.isLoading = false;
      console.log('FINALIZADO: Estado de carga reseteado.');
    }
  }
}
