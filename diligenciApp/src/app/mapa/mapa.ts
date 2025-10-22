import { ChangeDetectorRef, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { Coordenadas, LocationService } from '../services/location.service';
import { Muro } from '../muro/muro';
import { AuthService } from '../services/auth.service';
import { Reporte, ReporteEdit, ReporteService } from '../services/reporte.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, Muro],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css'],
})
export class Mapa implements OnInit {
  newLocationData: Coordenadas = { lat: 40.7128, lng: -74.006 };
  markerBeingEdited: ReporteEdit = { id: 0, titulo: '', servicio: '', precio: '', telefono: '' };
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  isLoading = false;
  errorGeoloc: string | null = null;
  selectedMarker: Reporte | null = null;
  currentUser: any = null;

  mostrarMapa = true;
  mostrarMuro = false;

  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.006 };
  zoom = 12;
  markerPositions: Reporte[] = [];

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
    private reporteService: ReporteService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.getLocation();
    this.loadMarkers();
  }

  toggleVista() {
    this.mostrarMuro = !this.mostrarMuro;
    this.mostrarMapa = !this.mostrarMapa;
    this.cdRef.detectChanges();
  }

  async getLocation() {
    try {
      const pos = await this.locationService.getPosition();
      this.newLocationData = pos;
      this.center = { lat: pos.lat, lng: pos.lng };
      this.zoom = 14;

      this.markerPositions.push({
        lat: pos.lat,
        lng: pos.lng,
        titulo: 'Mi ubicación actual',
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
 trackByMarkerId(index: number, marker: Reporte): number | undefined {
    return marker.id;
  }
loadMarkers() {
  this.reporteService.getReportes().subscribe({
    next: (data) => {
      console.log('📍 Datos recibidos:', data);

      const markerMap = new Map<string, number>();

      this.markerPositions = data.map((m) => {
        const key = `${m.lat}_${m.lng}`;

        // Contar cuántos marcadores existen en la misma posición
        const count = markerMap.get(key) || 0;
        markerMap.set(key, count + 1);

        // Desplazar cada marcador sucesivo en esa posición
        const offsetAngle = (count * 25 * Math.PI) / 180; // cada nuevo, 45° más
        const offsetDistance = 0.0003; // ~30 m de distancia visible
        const latOffset = Math.sin(offsetAngle) * offsetDistance;
        const lngOffset = Math.cos(offsetAngle) * offsetDistance;

        return {
          id: m.id,
          lat: Number(m.lat) + latOffset,
          lng: Number(m.lng) + lngOffset,
          titulo: m.titulo || 'Punto sin nombre',
          servicio: m.servicio,
          direccion: m.direccion,
          telefono: m.telefono,
          precio: m.precio,
          usuario: m.usuario || 'desconocido',
        };
      });

      this.cdRef.detectChanges();
    },
    error: (err) => console.error('⚠️ Error al cargar marcadores:', err),
  });
}


  openInfoWindow(marker: Reporte, markerRef: MapMarker, infoWindow: MapInfoWindow) {
    this.selectedMarker = marker;
    infoWindow.open(markerRef);
  }

  editMarker(marker: Reporte) {
    console.log("edit marker ",marker);
        console.log("currentUser ",this.currentUser);

    
    if (marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes editar marcadores de otros usuarios.');
      return;
    }

    this.infoWindow?.close();
    this.markerBeingEdited = { ...marker, id: marker.id ?? 0 };
    this.mostrarMuro = true;
    this.mostrarMapa = false;
    this.cdRef.detectChanges();
  }

  deleteMarker(marker: Reporte) {
    if (!marker.id || marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes eliminar marcadores de otros usuarios.');
      return;
    }

    if (confirm(`¿Seguro que quieres eliminar "${marker.titulo}"?`)) {
      this.reporteService.deleteReporte(marker.id).subscribe({
        next: () => {
          this.markerPositions = this.markerPositions.filter((m) => m.id !== marker.id);
          this.selectedMarker = null;
          this.cdRef.detectChanges();
          alert('🗑️ Marcador eliminado.');
        },
        error: (err) => console.error('Error al eliminar marcador:', err),
      });
    }
  }

onMarkerUpdated(updated: any) {
  console.log('🆙 Marcador actualizado o nuevo:', updated);

  if (updated.esNuevo) {
    // 📍 Nuevo marcador
    const smallOffset = Math.random() * 0.0001 - 0.00005;
    this.markerPositions.push({
      id: updated.id,
      titulo: updated.titulo,
      servicio: updated.servicio,
      precio: updated.precio,
      telefono: updated.telefono,
      lat: updated.lat + smallOffset,
      lng: updated.lng + smallOffset,
      usuario: updated.usuario,
      direccion: updated.direccion,
    });
  } else {
    // ✏️ Edición de marcador existente
    const index = this.markerPositions.findIndex((m) => m.id === updated.id);
    if (index > -1) {
      this.markerPositions[index] = { ...this.markerPositions[index], ...updated };
    }
  }

  this.cdRef.detectChanges();
}


  onMostrarMapa() {
    this.loadMarkers();
    this.mostrarMapa = true;
    this.mostrarMuro = false;
      this.markerBeingEdited = { id: 0, titulo: '', servicio: '', precio: '', telefono: '' };

    this.cdRef.detectChanges();
  }

  logout() {
    this.auth.logout();
  }
}
