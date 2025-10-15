import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Coordenadas, LocationService } from '../services/locationService';
import { Muro } from '../muro/muro';

// 🔹 Tipo personalizado de marcador
interface CustomMarker extends google.maps.LatLngLiteral {
  title: string;
  servicio?: string;
  direccion?: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, Muro],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements OnInit {
  newLocationData: Coordenadas = { lat: 40.7128, lng: -74.006 };
  isLoading = false;
  errorGeoloc: string | null = null;
  selectedMarker: any = null; // ✅ agrega esto

  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.006 };
  zoom = 12;

  markerPositions: CustomMarker[] = [];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 5,
  };

  constructor(
    private locationService: LocationService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getLocation();
    this.loadMarkersFromJson();
  }

  async getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    try {
      console.log('📍 Obteniendo ubicación actual...');
      const pos: Coordenadas = await this.locationService.getPosition();

      this.newLocationData = pos;
      this.center = { lat: pos.lat, lng: pos.lng };
      this.zoom = 14;

      // Agregar marcador del usuario
      this.markerPositions.push({
        lat: pos.lat,
        lng: pos.lng,
        title: 'Mi ubicación actual',
        servicio: 'Ubicación personal',
        direccion: 'Detectada por el navegador',
      });

      this.cdRef.detectChanges();
      console.log('✅ Ubicación:', pos);
    } catch (error: any) {
      this.errorGeoloc = 'Error al obtener ubicación: ' + error.message;
      console.error(this.errorGeoloc);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga los marcadores desde el JSON local o API
   */
  loadMarkersFromJson() {
    // 🔹 Puedes usar 'assets/db.json' si el archivo está dentro de Angular
    // 🔹 O cambiar a 'http://localhost:3000/reportes' si usas json-server
    const url = 'http://localhost:3000/reportes';

    this.http.get<CustomMarker[]>(url).subscribe({
      next: (data) => {
        console.log('📦 Marcadores cargados:', data);
        this.markerPositions = [
          ...this.markerPositions,
          ...data.map((m) => ({
            lat: Number(m.lat),
            lng: Number(m.lng),
            title: m.title || (m as any).nombre || 'Punto sin nombre',
            servicio: m.servicio,
            direccion: m.direccion,
          })),
        ];
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('⚠️ Error al cargar db.json:', err),
    });
  }

  /**
   * Abre la ventana de información del marcador
   */
openInfoWindow(markerData: CustomMarker, markerRef: MapMarker, infoWindow: MapInfoWindow) {
  this.selectedMarker = markerData;
  infoWindow.open(markerRef);
}

}
