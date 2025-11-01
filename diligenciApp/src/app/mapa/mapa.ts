import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { Coordenadas, LocationService } from '../services/location.service';
import { Muro } from '../muro/muro';
import { AuthService } from '../services/auth.service';
import { Reporte, ReporteService } from '../services/reporte.service';
import { CommonModule } from '@angular/common';
import { Banner } from "../banner/banner";

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, Muro],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css'],
})
export class Mapa implements OnInit {
  newLocationData: Coordenadas = { lat:  6.261282148730641, lng:  -75.54816176338464 };
  markerBeingEdited: Reporte = {
    id: 0, titulo: '', servicio: '', precio: '', telefono: '', estado: 'DISPONIBLE', tomadoPor: '',
    lat: 0,
    lng: 0
  };
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
@ViewChild(MapMarker) allMarkers!: QueryList<MapMarker>;
  isLoading = false;
  errorGeoloc: string | null = null;
  selectedMarker: Reporte | null = null;
  currentUser: any = null;

  mostrarMapa = true;
  mostrarMuro = false;

  center: google.maps.LatLngLiteral = { lat: 6.261282148730641 , lng: -75.54816176338464 };
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
    this.openAllMarkers()
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
        categoria:'',
        precio: '',
        estado: 'NINGUNO',
        usuario: this.currentUser?.username || 'sistema',
        tomadoPor: ''
      });

      this.cdRef.detectChanges();
    } catch (error: any) {
      this.errorGeoloc = 'Error al obtener ubicación: ' + error.message;
      console.error(this.errorGeoloc);
    } finally {
      this.isLoading = false;
    }
  }
    finishMarker(marker: Reporte) {

    const updatedData: Reporte = {
      estado: 'FINALIZADO',
      id: marker.id,
      titulo: marker.titulo,
      servicio: marker.servicio,
      telefono: marker.telefono,
      direccion: marker.direccion,
      precio: marker.precio,
      usuario: marker.usuario,
      categoria:marker.categoria,
      lat: marker.lat,
      lng: marker.lng
    };

    this.reporteService.updateReporte(marker.id, updatedData).subscribe({
      next: (response) => {
        this.updateMarkerInList(marker.id!, updatedData);
        this.infoWindow?.close();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al finalizar la solicitud:', err)
    });
  }

  noFinishMarker(marker: Reporte){
    console.log("noFinish ",marker);


    const updatedData: Reporte = {
      estado: 'NOEXITOSO',
      id: marker.id,
      titulo: marker.titulo,
      servicio: marker.servicio,
      telefono: marker.telefono,
      direccion: marker.direccion,
      precio: marker.precio,
      categoria:marker.categoria,
      usuario: marker.usuario,
      lat: marker.lat,
      lng: marker.lng
    };

    this.reporteService.updateReporte(marker.id, updatedData).subscribe({
      next: (response) => {
        this.updateMarkerInList(marker.id!, updatedData);
        this.infoWindow?.close();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al finalizar la solicitud:', err)
    });
  }

   updateMarkerInList(id: number, changes: Partial<Reporte>) {
     // 1. Actualizar la lista principal
    const index = this.markerPositions.findIndex(m => m.id === id);
    if (index > -1) {
        this.markerPositions[index] = { ...this.markerPositions[index], ...changes };
    }

    // 2. Actualizar el marcador seleccionado (si es el mismo)
    if (this.selectedMarker?.id === id) {
        this.selectedMarker = { ...this.selectedMarker, ...changes };
    }
  }
    takeMarker(marker: Reporte) {
    if (!marker.id || !this.currentUser || marker.estado.toUpperCase() !== 'DISPONIBLE') return;
console.log(marker);
console.log(this.currentUser.username);
console.log(marker.usuario);

    const updatedData: Reporte = {
      estado: 'TOMADO',
      tomadoPor: this.currentUser.username,
      id: marker.id,
      titulo: marker.titulo,
      servicio: marker.servicio,
      telefono: marker.telefono,
      categoria:marker.categoria,
      direccion: marker.direccion,
      precio: marker.precio,
      lat: marker.lat,
      lng: marker.lng,
      usuario: marker.usuario
    };
console.log(updatedData);

    this.reporteService.updateReporte(marker.id, updatedData).subscribe({
      next: (response) => {
        this.updateMarkerInList(marker.id!, updatedData);
        this.infoWindow?.close();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al tomar la solicitud:', err)
    });
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
        const offsetAngle = (count * 1 * Math.PI) / 180; // cada nuevo, 45° más
        const offsetDistance = 0.00003; // ~30 m de distancia visible
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
          categoria:m.categoria,
          estado: m.estado,
          tomadoPor: m.tomadoPor,
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
    console.log(marker);


    console.log(this.selectedMarker);

    infoWindow.open(markerRef);
  }
openAllMarkers(): void {
    // Si no hay marcadores (p.ej. la lista está vacía), salimos
    if (!this.allMarkers || this.allMarkers.length === 0) return;

    // Iteramos sobre todos los marcadores de la QueryList
    this.allMarkers.forEach((marker: MapMarker) => {
      console.log("dentro de foreach");

      // Abrimos la única infoWindow que tenemos. Como solo hay una,
      // se anclará al último marcador que se procese, cerrando todas las anteriores.
      // Visualmente, simula la apertura en todos, terminando en el último.
      this.infoWindow.open(marker);

      // La línea de abajo (this.infoWindow?.close()) la puedes comentar o eliminar.
      // Si la dejas, cerrará la ventana completamente. La eliminamos para que el último quede abierto.
      // this.infoWindow.close();
    });}
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
          this.infoWindow?.close();
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
      categoria:updated.categoria,
      lat: updated.lat + smallOffset,
      lng: updated.lng + smallOffset,
      usuario: updated.usuario,
      direccion: updated.direccion,
      estado: updated.estado,
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
      this.markerBeingEdited = { id: 0, titulo: '', servicio: '', precio: '', telefono: '' ,estado:'DISPONIBLE',tomadoPor:'', lat:0, lng:0};

    this.cdRef.detectChanges();
  }

  logout() {
    this.auth.logout();
  }
}
