import { LocationService } from './../locationService';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Coordenadas } from '../locationService';

interface ReporteServicioDTO {
  nombre: FormControl<string>;
  servicio: FormControl<string>;
  direccion?: FormControl<Coordenadas | undefined>;
}

@Component({
  selector: 'app-muro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './muro.html',
  styleUrl: './muro.css',
})
export class Muro implements OnInit {
  @Input() coordenadasEntrada!: Coordenadas;

  direccion: string = 'Cargando dirección...';
  lista = new Array<Coordenadas>();
  geocoder?: google.maps.Geocoder; // ← Ya no lo inicializamos directamente
  miFormulario: FormGroup;
  isBrowser: boolean = false;

  constructor(
    private locationService: LocationService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detecta si el código corre en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Inicializamos el formulario
    this.miFormulario = new FormGroup<ReporteServicioDTO>({
      nombre: new FormControl('', { validators: Validators.required, nonNullable: true }),
      servicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
      direccion: new FormControl({ value: this.coordenadasEntrada, disabled: false }, { nonNullable: true }),
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

    if (this.isBrowser) {
      this.locationService.getDireccion(this.coordenadasEntrada.lat, this.coordenadasEntrada.lng).subscribe((res: any) => {
        console.log("res ",res);

          this.direccion = res.results[1].formatted_address;
          console.log('📍 Dirección:', this.direccion);
              this.miFormulario.get('direccion')?.setValue(this.direccion);

      });
    }

  }



  onSubmit(): void {
    console.log('lista ', this.lista);
    console.log('direccion form ', this.miFormulario.get('direccion')?.value);
    console.log(this.miFormulario.value);

    if (this.miFormulario.valid) {
      console.log('✅ Formulario Válido. Datos a enviar:', this.miFormulario.value);
      this.miFormulario.reset({
        nombre: '',
        servicio: '',
        direccion: this.miFormulario.get('direccion')?.value,
      });
    } else {
      console.log('❌ Formulario Inválido. Revise los campos.');
      this.miFormulario.markAllAsTouched();
    }
  }
}
