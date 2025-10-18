import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Coordenadas, LocationService } from '../services/location.service';
import { Muro } from '../muro/muro';
import { AuthService } from '../services/auth.service';
import { Reporte } from '../services/reporte.service';
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
  styleUrls: ['./mapa.css'],
})
export class Mapa implements OnInit {
  newLocationData: Coordenadas = { lat: 40.7128, lng: -74.006 };
  markerBeingEdited: Reporte = {
    lat: 0,
    lng: 0,
    titulo: '',
    servicio: '',
    precio: '',
    telefono: '',
  }; // ← nuevo
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow; // referencia global

  isLoading = false;
  errorGeoloc: string | null = null;
  selectedMarker: Reporte | null = null;
  currentUser: any = null; // ✅ usuario logueado  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  mostrarMapa = true;
  mostrarMuro = false;

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
    this.currentUser = this.auth.getCurrentUser();
    this.getLocation();
    this.loadMarkersFromJson();
  }
toggleVista() {
  console.log("toogle vista ");

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
    } catch (error:any) {
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
    }
  }
  trackByMarkerId(index: number, marker: Reporte) {
    return marker.id;
  }
  loadMarkersFromJson() {
    this.http.get<Reporte[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.markerPositions = data.map((m) => ({
          id: m.id,
          lat: Number(m.lat),
          lng: Number(m.lng),
          titulo: m.titulo || 'Punto sin nombre',
          servicio: m.servicio,
          direccion: m.direccion,
          telefono: m.telefono,
          precio: m.precio,
          usuario: m.usuario || 'desconocido',
        }));
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
    if (marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes editar marcadores de otros usuarios.');
      return;}
          this.infoWindow?.close();

    // 🔹 Enviar el marcador al muro para que pinte sus datos en el formulario
    this.cdRef.detectChanges();

    this.markerBeingEdited = { ...marker };
    this.mostrarMuro = true;
    this.mostrarMapa = false;
    this.infoWindow?.close();
  }

  deleteMarker(marker: Reporte) {
    if (!marker.id || marker.usuario !== this.currentUser?.username) return;
    if (marker.usuario !== this.currentUser?.username) {
      alert('❌ No puedes eliminar marcadores de otros usuarios.');
      return;
    }
    if (confirm(`¿Seguro que quieres eliminar "${marker.titulo}"?`)) {
      this.http.delete(`${this.apiUrl}/${marker.id}`).subscribe({
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


  onMarkerUpdated(updated: Reporte) {
    const index = this.markerPositions.findIndex((m) => m.id === updated.id);
    if (index > -1) {
      this.markerPositions[index] = { ...updated };
      this.markerPositions = [...this.markerPositions];
      if (this.selectedMarker?.id === updated.id) this.selectedMarker = { ...updated };
      this.cdRef.detectChanges();
      alert('✅ Información del marcador actualizada');
    }
  }

  onMostrarMapa() {
    this.mostrarMapa = true;
    this.mostrarMuro = false;
    this.cdRef.detectChanges();
  }

  logout() {
    this.auth.logout();
  }
}
