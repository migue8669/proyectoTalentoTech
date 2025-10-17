import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Coordenadas, LocationService } from '../services/location.service';
import { Muro } from '../muro/muro';
import { AuthService } from '../services/auth.service';
import { Reporte } from '../services/reporte.service';

// 🔹 Tipo personalizado de marcador
export interface CustomMarker extends google.maps.LatLngLiteral {
  id?: string | number;
  title: string;
  servicio?: string;
  direccion?: string;
  telefono?: string;
  precio?: string;
  usuario?: string; // ✅ nuevo campo: quién lo creó
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
  markerBeingEdited: Reporte = {
    lat: 0,
    lng: 0,
    title: '',
    servicio: '',
    precio: '',
    telefono: '',
  }; // ← nuevo
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow; // referencia global

  isLoading = false;
  errorGeoloc: string | null = null;
  selectedMarker: Reporte | null = null;
  currentUser: any = null; // ✅ usuario logueado

  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.006 };
  zoom = 12;

  markerPositions: Reporte[] = [];
  private apiUrl = 'http://localhost:3000/reportes';

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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser(); // ✅ guarda usuario logueado
    this.getLocation();
    this.loadMarkersFromJson();
  }

  /** 📍 Obtiene la ubicación del usuario */
  async getLocation() {
    this.isLoading = true;
    this.errorGeoloc = null;

    try {
      const pos: Coordenadas = await this.locationService.getPosition();

      this.newLocationData = pos;
      this.center = { lat: pos.lat, lng: pos.lng };
      this.zoom = 14;

      // ✅ Marcador de ubicación actual
      this.markerPositions.push({
        lat: pos.lat,
        lng: pos.lng,
        title: 'Mi ubicación actual',
        servicio: 'Ubicación personal',
        direccion: 'Detectada por el navegador',
        telefono: '',
        precio: '',
        usuario: this.currentUser?.username || 'sistema',
      });

      this.cdRef.detectChanges();
    } catch (error: any) {
      this.errorGeoloc = 'Error al obtener ubicación: ' + error.message;
      console.error(this.errorGeoloc);
    } finally {
      this.isLoading = false;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['markerBeingEdited'] && this.markerBeingEdited) {
      console.log('📍 Marcador a editar:', this.markerBeingEdited);
      // Aquí podrías abrir un formulario o modal para editar el marcador
    }
  }
  trackByMarkerId(index: number, marker: Reporte) {
    return marker.id;
  }
  /** 🔹 Carga los marcadores */
  loadMarkersFromJson() {
    this.http.get<Reporte[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.markerPositions = data.map((m) => ({
          id: m.id,
          lat: Number(m.lat),
          lng: Number(m.lng),
          title: m.title || (m as any).nombre || 'Punto sin nombre',
          servicio: m.servicio,
          direccion: m.direccion,
          telefono: m.telefono,
          precio: m.precio,
          usuario: (m as any).usuario || 'desconocido', // ✅ mantener autor
        }));
        this.cdRef.detectChanges();

      },
      error: (err) => console.error('⚠️ Error al cargar marcadores:', err),
    });
  }

  /** 🪟 Abre ventana info */
  openInfoWindow(markerData: Reporte, markerRef: MapMarker, infoWindow: MapInfoWindow) {
    this.selectedMarker = markerData;
    infoWindow.open(markerRef);
  }


  /** ✏️ Editar marcador (solo si es del usuario actual) */
  editMarker(marker: Reporte) {
    if (marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes editar marcadores de otros usuarios.');
      return;
    }
    this.infoWindow?.close();

    // 🔹 Enviar el marcador al muro para que pinte sus datos en el formulario
    this.markerBeingEdited = { ...marker };
    this.cdRef.detectChanges();
  }
  onMarkerUpdated(updated: Reporte) {
    console.log('📍 Marcador actualizado desde Muro:', updated);

    // 1️⃣ Buscamos el índice del marcador actualizado
    const index = this.markerPositions.findIndex((m) => m.id === updated.id);

    if (index > -1) {
      // 2️⃣ Actualizamos el objeto en el array
      this.markerPositions[index] = { ...updated };

      // 3️⃣ Reasignamos el array completo para forzar re-render
      this.markerPositions = [...this.markerPositions];

      // 4️⃣ Si el marcador editado es el que está seleccionado, actualízalo también
      if (this.selectedMarker?.id === updated.id) {
        this.selectedMarker = { ...updated };
      }

      // 5️⃣ Detectamos cambios
      this.cdRef.detectChanges();

      alert('✅ Información del marcador actualizada en el mapa');
    }
  }

  /** 🗑️ Eliminar marcador (solo si es del usuario actual) */
  deleteMarker(marker: Reporte) {
    if (!marker.id) return;

    if (marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes eliminar marcadores de otros usuarios.');
      return;
    }

    if (confirm(`¿Seguro que quieres eliminar "${marker.title}"?`)) {
      this.infoWindow?.close();

      this.http.delete(`${this.apiUrl}/${marker.id}`).subscribe({
        next: () => {
          this.markerPositions = this.markerPositions.filter((m) => m.id !== marker.id);
          this.selectedMarker = null;
          this.cdRef.detectChanges();
          alert('🗑️ Marcador eliminado.');
        },
        error: (err) => console.error('❌ Error al eliminar marcador:', err),
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
