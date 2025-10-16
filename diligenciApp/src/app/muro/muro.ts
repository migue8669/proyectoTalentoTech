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
} from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Reporte, ReporteService } from '../services/reporte.service';

interface ReporteServicioDTO {
  nombre: FormControl<string>;
  servicio: FormControl<string>;
  direccion?: FormControl<Coordenadas | undefined>;
  lat: FormControl<number | undefined>;
  lng: FormControl<number | undefined>;
}

@Component({
  selector: 'app-muro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './muro.html',
  styleUrl: './muro.css',
})
export class Muro implements OnInit, OnChanges {
@Input() coordenadasEntrada: Coordenadas = { lat: 0, lng: 0 };


  direccion: string = 'Cargando dirección...';
  lista = new Array<Coordenadas>();
  geocoder?: google.maps.Geocoder; // ← Ya no lo inicializamos directamente
  miFormulario: FormGroup;
  isBrowser: boolean = false;

  constructor(
    private locationService: LocationService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private reporteService: ReporteService, // ← nuevo

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detecta si el código corre en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Inicializamos el formulario
    this.miFormulario = new FormGroup<ReporteServicioDTO>({
      nombre: new FormControl('', { validators: Validators.required, nonNullable: true }),
      servicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
      direccion: new FormControl(
        { value: this.coordenadasEntrada, disabled: false },
        { nonNullable: true }
      ),
      lat: new FormControl(
        { value: this.coordenadasEntrada.lat, disabled: false },
        { nonNullable: true }
      ),
      lng: new FormControl(
        { value: this.coordenadasEntrada.lng, disabled: false },
        { nonNullable: true }
      ),
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // ✅ Solo creamos el geocoder en el navegador
      this.geocoder = new google.maps.Geocoder();
    } else {
      console.log('⛔ SSR detectado: no se inicializa google.maps');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges en Muro detectado');
    console.log(changes);

    this.coordenadasEntrada = changes['coordenadasEntrada']
      ? changes['coordenadasEntrada'].currentValue
      : this.coordenadasEntrada;

    console.log('coordenadasEntrada actualizadas:', this.coordenadasEntrada);

  //  if (this.isBrowser) {
      this.locationService
        .getDireccion(this.coordenadasEntrada.lat, this.coordenadasEntrada.lng)
        .subscribe((res: any) => {
          console.log('respuesta direccion ', res);

          this.direccion = res.results[1].formatted_address;
          console.log('📍 Dirección:', this.direccion);
          this.miFormulario.get('direccion')?.setValue(this.direccion);
        });
  //  }
  }

  onSubmit(): void {
    if (this.miFormulario.valid) {
  
      const nuevoReporte: Reporte = {
        nombre: this.miFormulario.get('nombre')?.value,
        servicio: this.miFormulario.get('servicio')?.value,
        direccion: this.direccion,
        lat: this.coordenadasEntrada.lat,
        lng: this.coordenadasEntrada.lng,
      };

      this.reporteService.addReporte(nuevoReporte).subscribe({
        next: (res) => {
          console.log('✅ Reporte guardado en db.json:', res);
          this.miFormulario.reset({
            nombre: '',
            servicio: '',
            direccion: this.direccion,
            lat: this.coordenadasEntrada.lat,
            lng: this.coordenadasEntrada.lng,
          });
        },
        error: (err) => console.error('❌ Error al guardar reporte:', err),
      });
    } else {
      console.log('❌ Formulario Inválido. Revise los campos.');
      this.miFormulario.markAllAsTouched();
    }
  }
}
