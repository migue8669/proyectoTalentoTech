import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Coordenadas, LocationService } from '../services/location.service';
import { Muro } from '../muro/muro';
import { AuthService } from '../services/auth.service';

// 🔹 Tipo personalizado de marcador
interface CustomMarker extends google.maps.LatLngLiteral {
  id?: string | number; // ✅ importante para PUT/DELETE
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
  selectedMarker: CustomMarker | null = null;

  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.006 };
  zoom = 12;

  markerPositions: CustomMarker[] = [];
  private apiUrl = 'http://localhost:3000/reportes'; // ✅ base del backend

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
    private http: HttpClient,
    private auth: AuthService) {}

  ngOnInit(): void {
    this.getLocation();
    this.loadMarkersFromJson();
  }

  /** 📍 Obtiene la ubicación del usuario */
  async getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    try {
      console.log('📍 Obteniendo ubicación actual...');
      const pos: Coordenadas = await this.locationService.getPosition();

      this.newLocationData = pos;
      this.center = { lat: pos.lat, lng: pos.lng };
      this.zoom = 14;

      // ✅ Agregar marcador de la ubicación actual
      this.markerPositions.push({
        lat: pos.lat,
        lng: pos.lng,
        title: 'Mi ubicación actual',
        servicio: 'Ubicación personal',
        direccion: 'Detectada por el navegador',
      });

      this.cdRef.detectChanges();
      console.log('✅ Ubicación:', pos);
      console.warn('ubucacion ', pos);
    } catch (error: any) {
      this.errorGeoloc = 'Error al obtener ubicación: ' + error.message;
      console.error(this.errorGeoloc);
    } finally {
      this.isLoading = false;
    }
  }

  /** 🔹 Carga los marcadores desde la API o JSON local */
  loadMarkersFromJson() {
    this.http.get<CustomMarker[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('📦 Marcadores cargados:', data);
        this.markerPositions = data.map((m) => ({
          id: m.id,
          lat: Number(m.lat),
          lng: Number(m.lng),
          title: m.title || (m as any).nombre || 'Punto sin nombre',
          servicio: m.servicio,
          direccion: m.direccion,
        }));
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('⚠️ Error al cargar marcadores:', err),
    });
  }

  /** 🪟 Abre la ventana de información */
  openInfoWindow(markerData: CustomMarker, markerRef: MapMarker, infoWindow: MapInfoWindow) {
    this.selectedMarker = markerData;
    infoWindow.open(markerRef);
  }

  /** ✏️ Edita un marcador (PUT) */
  editMarker(marker: CustomMarker) {
    const nuevoTitulo = prompt('Nuevo nombre para este marcador:', marker.title);
    if (!nuevoTitulo) return;

    const updatedMarker = { ...marker, title: nuevoTitulo };

    this.http.put(`${this.apiUrl}/${marker.id}`, updatedMarker).subscribe({
      next: () => {
        console.log('📝 Marcador actualizado:', updatedMarker);
        // ✅ Actualiza el arreglo local
        const index = this.markerPositions.findIndex((m) => m.id === marker.id);
        if (index > -1) this.markerPositions[index] = updatedMarker;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('❌ Error al actualizar marcador:', err),
    });
  }

  /** 🗑️ Elimina un marcador (DELETE) */
  deleteMarker(marker: CustomMarker) {
    if (!marker.id) {
      console.warn('⚠️ Marcador sin ID, no se puede eliminar.');
      return;
    }

    if (confirm(`¿Seguro que quieres eliminar "${marker.title}"?`)) {
      this.http.delete(`${this.apiUrl}/${marker.id}`).subscribe({
        next: () => {
          console.log('🗑️ Marcador eliminado:', marker);
          this.markerPositions = this.markerPositions.filter((m) => m.id !== marker.id);
          this.selectedMarker = null;
          this.cdRef.detectChanges();
        },
        error: (err) => console.error('❌ Error al eliminar marcador:', err),
      });
    }
  }


logout() {
  this.auth.logout();
}

}
