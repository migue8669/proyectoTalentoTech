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
  };
  @Output() markerUpdated: EventEmitter<Reporte> = new EventEmitter<Reporte>();
  @Output() mostrarMapaEvent = new EventEmitter<void>();

  direccion: string = 'Cargando dirección...';
  geocoder?: google.maps.Geocoder;
  miFormulario: FormGroup;
  isBrowser: boolean = false;
  currentUser: { id: number; username: string } | null = null;
  mostrarMapa = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private reporteService: ReporteService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.miFormulario = new FormGroup<ReporteServicioDTO>({
      titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
      servicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
      direccion: new FormControl('', { nonNullable: true }),
      lat: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
      lng: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
      precio: new FormControl('', { nonNullable: true }),
      telefono: new FormControl('', { nonNullable: true }),
      usuario: new FormControl('', { nonNullable: true }),
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) this.geocoder = new google.maps.Geocoder();

    this.currentUser = this.authService.getCurrentUser();
    this.miFormulario.get('usuario')?.setValue(this.currentUser?.username || 'desconocido');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['marker'] && changes['marker'].currentValue) {
      const m = changes['marker'].currentValue as Reporte;

      // Actualizar valores del formulario
      this.miFormulario.patchValue({
        titulo: m.titulo || '',
        servicio: m.servicio || '',
        telefono: m.telefono || '',
        precio: m.precio || '',
        direccion: m.direccion || '',
        lat: m.lat || 0,
        lng: m.lng || 0,
        usuario: m.usuario || this.currentUser?.username || 'desconocido',
      });

      // 🔒 Deshabilitar campos dirección, lat y lng al editar
      this.miFormulario.get('direccion')?.disable();
      this.miFormulario.get('lat')?.disable();
      this.miFormulario.get('lng')?.disable();
    }

    if (changes['coordenadasEntrada'] && changes['coordenadasEntrada'].currentValue) {
      const coords = changes['coordenadasEntrada'].currentValue as Coordenadas;
      this.miFormulario.get('lat')?.setValue(coords.lat);
      this.miFormulario.get('lng')?.setValue(coords.lng);
    }
  }

  toggleVista() {
    this.mostrarMapa = !this.mostrarMapa;
  }

  onSubmit(): void {
    if (!this.miFormulario.valid) {
      this.miFormulario.markAllAsTouched();
      console.log('❌ Formulario Inválido');
      return;
    }

    // 🔍 Si estamos editando un marcador (tiene ID)
    if (this.marker && this.marker.id) {
      this.updateMarker();
      return;
    }

    // 🆕 Si es un nuevo marcador
    if (this.geocoder) {
      this.geocoder.geocode(
        { location: { lat: this.coordenadasEntrada.lat, lng: this.coordenadasEntrada.lng } },
        (results, status) => {
          this.direccion =
            status === 'OK' && results?.length ? results[0].formatted_address : 'Dirección no disponible';

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
              console.log('✅ Reporte guardado:', res);
              this.miFormulario.reset({
                titulo: '',
                servicio: '',
                direccion: '',
                telefono: '',
                precio: '',
                lat: this.coordenadasEntrada.lat,
                lng: this.coordenadasEntrada.lng,
                usuario: this.currentUser?.username || 'desconocido',
              });
            },
            error: (err) => console.error('❌ Error al guardar reporte:', err),
          });

          this.markerUpdated.emit(nuevoReporte);
          this.mostrarMapaEvent.emit();
        }
      );
    }
  }

  updateMarker() {
    if (!this.marker) return;

    const updated: Reporte = {
      ...this.marker, // mantiene lat, lng, dirección
      titulo: this.miFormulario.get('titulo')?.value,
      servicio: this.miFormulario.get('servicio')?.value,
      telefono: this.miFormulario.get('telefono')?.value,
      precio: this.miFormulario.get('precio')?.value,
      usuario: this.miFormulario.get('usuario')?.value,
    };

    this.markerUpdated.emit(updated);
    this.mostrarMapaEvent.emit();
  }
}
