import { LocationService, Coordenadas } from '../services/location.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  Inject,
  PLATFORM_ID,
  OnChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Reporte, ReporteService } from '../services/reporte.service';
import { AuthService } from '../services/auth.service';

interface ReporteServicioDTO {
  titulo: FormControl<string>;
  servicio: FormControl<string>;
  direccion?: FormControl<string | undefined>;
  telefono?: FormControl<string | undefined>;
  precio?: FormControl<string | undefined>;
  lat: FormControl<number | undefined>;
  lng: FormControl<number | undefined>;
  usuario: FormControl<string>;
}

@Component({
  selector: 'app-muro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './muro.html',
  styleUrl: './muro.css',
})
export class Muro implements OnInit, OnChanges {
  @Input() coordenadasEntrada: Coordenadas = { lat: 0, lng: 0 };
  @Input() marker: Reporte = {
    titulo: '',
    lat: 0,
    lng: 0,
    servicio: '',
    precio: '',
    telefono: '',
  }; // ← nuevo
  @Output() markerUpdated: EventEmitter<Reporte> = new EventEmitter<Reporte>();
  @Output() mostrarMapaEvent = new EventEmitter<void>(); // avisa que se debe mostrar mapa

  direccion: string = 'Cargando dirección...';
  lista = new Array<Coordenadas>();
  geocoder?: google.maps.Geocoder; // ← Ya no lo inicializamos directamente
  miFormulario: FormGroup;
  isBrowser: boolean = false;
  currentUser: { id: number; username: string } | null = null; // ✅ usuario activo
  mostrarMapa = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private reporteService: ReporteService, // ← nuevo
    private authService: AuthService, // ✅ Inyectar AuthService

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detecta si el código corre en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Inicializamos el formulario
    this.miFormulario = new FormGroup<ReporteServicioDTO>({
      titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
      servicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
      direccion: new FormControl('', { nonNullable: true }),
      lat: new FormControl(
        { value: this.coordenadasEntrada.lat, disabled: false },
        { nonNullable: true }
      ),
      lng: new FormControl(
        { value: this.coordenadasEntrada.lng, disabled: false },
        { nonNullable: true }
      ),
      precio: new FormControl('', { nonNullable: true }), // ← nuevo
      telefono: new FormControl('', { nonNullable: true }), // ← nuevo
      usuario: new FormControl('', { nonNullable: true }), // ← nuevo
    });
  }

  ngOnInit(): void {
    //if (this.isBrowser) {
    this.geocoder = new google.maps.Geocoder();

    // ✅ Obtener usuario autenticado desde AuthService
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      console.log('👤 Usuario autenticado:', this.currentUser.username);
      this.miFormulario.get('usuario')?.setValue(this.currentUser.username);
    } else {
      console.warn('⚠️ No hay usuario autenticado.');
      this.miFormulario.get('usuario')?.setValue('desconocido');
    }

  }
   ngOnChanges(changes: SimpleChanges): void {
  if (changes['marker'] && changes['marker'].currentValue) {
    const m = changes['marker'].currentValue as Reporte;

    this.miFormulario.patchValue({
      titulo: m.titulo || '',
      servicio: m.servicio || '',
      telefono: m.telefono || '',
      precio: m.precio || '',
      direccion: m.direccion ,
      lat: m.lat || 0,
      lng: m.lng || 0,
      usuario: m.usuario || this.currentUser?.username || 'desconocido'
    });

    if ((!m.direccion || m.direccion.trim() === '') && m.lat && m.lng) {
      this.direccion = 'Cargando dirección...';
      this.miFormulario.get('direccion')?.setValue(this.direccion);
       console.log("m.lat ",m.lat);

      // Llamamos a función async separada
      this.loadDireccion(m.lat, m.lng);
    } else if (m.direccion) {
      this.direccion = m.direccion;
      this.miFormulario.get('direccion')?.setValue(this.direccion);
    }
  }

  if (changes['coordenadasEntrada'] && changes['coordenadasEntrada'].currentValue) {
    const coords = changes['coordenadasEntrada'].currentValue as Coordenadas;
    this.miFormulario.get('lat')?.setValue(coords.lat);
    this.miFormulario.get('lng')?.setValue(coords.lng);
  }
}

// Función async separada
private async loadDireccion(lat: number, lng: number) {
  try {
    const direccion = await this.geocodeLatLng(lat, lng);
    this.direccion = direccion;
    this.miFormulario.get('direccion')?.setValue(direccion);
    this.cdRef.detectChanges();
    console.log('📍 Dirección obtenida por geocoding:', direccion);
  } catch (err) {
    console.error('❌ Error al obtener dirección:', err);
    this.direccion = 'Dirección no disponible';
    this.miFormulario.get('direccion')?.setValue(this.direccion);
    this.cdRef.detectChanges();
  }
}


  private geocodeLatLng(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        return reject('Geocoder no inicializado');
      }
        console.log("lat geocodelatlng ",lat);

      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0].formatted_address);
        } else {
          resolve('Dirección no disponible');
        }
      });
    });
  }
    toggleVista() {
    this.mostrarMapa = !this.mostrarMapa;
  }

onSubmit(): void {
  if (!this.miFormulario.valid) {
    console.log('❌ Formulario Inválido. Revise los campos.');
    this.miFormulario.markAllAsTouched();
    return;
  }

  if (this.geocoder) {
    this.geocoder.geocode(
      { location: { lat: this.coordenadasEntrada.lat, lng: this.coordenadasEntrada.lng } },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          this.direccion = results[0].formatted_address;
        } else {
          this.direccion = 'Dirección no disponible';
        }

        // Actualizar el formulario
        this.miFormulario.get('direccion')?.setValue(this.direccion);
        this.cdRef.detectChanges();

        // Crear y guardar el reporte **dentro del callback**
        const nuevoReporte: Reporte = {
          titulo: this.miFormulario.get('titulo')?.value,
          servicio: this.miFormulario.get('servicio')?.value,
          direccion: this.direccion,
          telefono: this.miFormulario.get('telefono')?.value || '',
          precio: this.miFormulario.get('precio')?.value || '',
          lat: this.coordenadasEntrada.lat,
          lng: this.coordenadasEntrada.lng,
          usuario: this.miFormulario.get('usuario')?.value || 'anónimo',
        };

        this.reporteService.addReporte(nuevoReporte).subscribe({
          next: (res) => {
            console.log('✅ Reporte guardado en db.json:', res);
            this.miFormulario.reset({
              titulo: '',
              servicio: '',
              direccion: '',
              telefono: '',
              precio: '',
              lat: this.coordenadasEntrada.lat,
              lng: this.coordenadasEntrada.lng,
              usuario: '',
            });
          },
          error: (err) => console.error('❌ Error al guardar reporte:', err),
        });

        this.markerUpdated.emit(nuevoReporte);
      }
    );
  } else {
    // Si no hay geocoder disponible (SSR)
    this.direccion = 'Dirección no disponible';
    this.miFormulario.get('direccion')?.setValue(this.direccion);
    this.cdRef.detectChanges();
  }
this.mostrarMapaEvent.emit();

}

  updateMarker() {
    if (!this.marker) return;

    // aquí actualizas los campos del marcador desde tu formulario
    const updated: Reporte = {
      ...this.marker,
      id: Number(this.marker.id), // 🔹 fuerza a number
    };
    this.markerUpdated.emit(updated);
    this.mostrarMapaEvent.emit();
  }
}
