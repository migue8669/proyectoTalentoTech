import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { Coordenadas, LocationService } from '../locationService';

// Extensión de LatLngLiteral para incluir el título del marcador
interface MapMarker extends google.maps.LatLngLiteral {
    title: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],

  // Usamos template en línea para asegurar que los bindings son correctos
  template: `
    <div class="map-container">
        <div class="header">
          <h1 class="text-xl font-bold text-gray-800">Mapa de Ubicación</h1>
        </div>



        <!-- Mapa de Google -->
        <google-map
          height="450px"
          width="100%"
          [options]="mapOptions"
          [center]="center"
          [zoom]="zoom"
        >
          <!-- Renderiza todos los marcadores dinámicamente -->
          @for (pos of markerPositions; track pos.title) {
              <map-advanced-marker [position]="pos" [title]="pos.title"></map-advanced-marker>
          }
        </google-map>

        <div class="coord-display">
          <p><strong>Centro del Mapa:</strong> Lat: {{ center.lat | number:'1.4-4' }} | Lng: {{ center.lng | number:'1.4-4' }}</p>
          <p><strong>Marcadores:</strong> {{ markerPositions.length }}</p>
        </div>
    </div>
  `,styleUrl:'./mapa.css'})

export class Mapa implements OnInit {

  // 1. Usar coordenadas por defecto conocidas (no 0, 0)
  latitude: number = 40.7128; // Default NYC
  longitude: number = -74.0060;

  errorGeoloc: string | null = null;
  isLoading = false;

  // 2. Inicialización de propiedades del mapa
  center: google.maps.LatLngLiteral = { lat: this.latitude, lng: this.longitude };
  zoom = 12;

  // Inicializamos el marcador usando las coordenadas por defecto
  markerPositions: MapMarker[] = [{ lat: this.latitude, lng: this.longitude, title: 'Ubicación Inicial' }];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8,
    mapId: 'DEMO_MAP_ID', // Requerido para Advanced Markers
  };

  constructor(private locationService: LocationService) {

  }

  ngOnInit(): void {
    this.getLocation();
  }

  // Usamos async/await para un manejo de promesa más limpio y seguro
  async getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    try {
        console.log('INTENTO: Llamando a getPosition...');
        const pos: Coordenadas = await this.locationService.getPosition();

        // 3. Comprobación de valores válidos
        if (typeof pos.lat !== 'number' || typeof pos.lng !== 'number' || (pos.lat === 0 && pos.lng === 0)) {
            console.error('ERROR DE DATOS: Coordenadas recibidas son 0,0 o inválidas.', pos);
            throw new Error("Coordenadas recibidas inválidas o cero. El mapa mantendrá la ubicación por defecto.");
        }

        // 4. Los datos son válidos, procedemos a actualizar
        this.latitude = pos.lat;
        this.longitude = pos.lng;

        // CLAVE: RE-ASIGNAR COMPLETAMENTE LOS OBJETOS PARA FORZAR LA REACTIVIDAD
        this.center = { lat: pos.lat, lng: pos.lng };


        this.zoom = 14;
        console.log('ÉXITO: Ubicación obtenida y mapa actualizado.', this.center);

    } catch (error: any) {
        // Manejar errores
        this.errorGeoloc = 'Error al obtener la ubicación: ' + error.message;

        // En caso de error, el mapa mantiene las coordenadas por defecto.
        this.center = { lat: this.latitude, lng: this.longitude };
        this.markerPositions = [{ lat: this.latitude, lng: this.longitude, title: 'Ubicación por defecto (Error GPS)' }];

        console.error('FALLO: Se ejecutó el bloque catch. Error:', error.message);
    } finally {
        // Esta línea se ejecuta SIEMPRE al finalizar el try o el catch
        this.isLoading = false;
        console.log('FINALIZADO: Estado de carga reseteado.');
    }
  }
}
