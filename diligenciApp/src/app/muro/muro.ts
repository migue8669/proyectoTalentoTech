import { Coordenadas } from '../services/location.service';
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
import { Categoria, CategoriaService } from '../services/categoria.service';

interface ReporteServicioDTO {
  titulo: FormControl<string>;
  servicio: FormControl<string>;
  categoria: FormControl<string>;
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
    id: 0,
    titulo: '',
    servicio: '',
    categoria: '',
    precio: '',
    telefono: '',
    lat: 0,
    lng: 0,
    estado:'DISPONIBLE',
    tomadoPor:''
  };
  @Output() markerUpdated: EventEmitter<Reporte> = new EventEmitter<Reporte>();
  @Output() markerNew: EventEmitter<Reporte> = new EventEmitter<Reporte>();

  @Output() mostrarMapaEvent = new EventEmitter<void>();

  direccion: string = 'Cargando dirección...';
  geocoder?: google.maps.Geocoder;
  miFormulario: FormGroup;
  isBrowser: boolean = false;
  currentUser: { id: number; username: string } | null = null;
  mostrarMapa = false;
  categorias: Categoria[] = [];


  constructor(
    private cdRef: ChangeDetectorRef,
    private reporteService: ReporteService,
    private categoriaService:CategoriaService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.miFormulario = new FormGroup<ReporteServicioDTO>({
      titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
      servicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
      // 🆕 Añadir el FormControl para categoría con un validador
      categoria: new FormControl('', { validators: Validators.required, nonNullable: true }),
      direccion: new FormControl('', { nonNullable: true }),
      lat: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
      lng: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
      precio: new FormControl('', { nonNullable: true }),
      telefono: new FormControl('', { nonNullable: true, validators: Validators.pattern(/^\d{10}$/) }),
      usuario: new FormControl('', { nonNullable: true }),
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) this.geocoder = new google.maps.Geocoder();

    this.currentUser = this.authService.getCurrentUser();
    this.miFormulario.get('usuario')?.setValue(this.currentUser?.username || 'desconocido');
    this.cargarCategorias();
  }
cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        // Asigna los datos obtenidos de la BD a la propiedad del componente
        this.categorias = data;

        console.log('✅ Categorías cargadas desde BD:', this.categorias);
      },
      error: (err) => {
        console.error('❌ Error al cargar las categorías:', err);
        // Opcional: Asignar categorías de respaldo si falla la BD
        // this.categorias = [{ id: 0, nombre_principal: 'Error', nombre_subcategoria: 'Default', descripcion: '' }];
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);

    if (changes['marker'] && changes['marker'].currentValue) {
      console.log('ngOnChanges ');

      const m = changes['marker'].currentValue as Reporte;
    console.log(m);

      // Actualizar valores del formulario
      this.miFormulario.patchValue({
        titulo: m.titulo || '',
        servicio: m.servicio || '',
        categoria: m.categoria || '',
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

    // 🧩 Verificamos si hay un marcador cargado con ID → es edición
    const esEdicion = !!(this.marker && this.marker.id);

    if (esEdicion) {
      console.log('✏️ Editando marcador existente...');
      this.updateMarker();
      return;
    }

    // 🆕 Si no hay marker.id, creamos uno nuevo
    console.log('🆕 Creando nuevo marcador...');

    if (this.geocoder) {
      this.geocoder.geocode(
        { location: { lat: this.coordenadasEntrada.lat, lng: this.coordenadasEntrada.lng } },
        (results, status) => {
          this.direccion =
            status === 'OK' && results?.length
              ? results[0].formatted_address
              : 'Dirección no disponible';

          const nuevoReporte: Reporte = {
            titulo: this.miFormulario.get('titulo')?.value,
            servicio: this.miFormulario.get('servicio')?.value,
            // 🆕 Incluir categoría
            categoria: this.miFormulario.get('categoria')?.value,
            direccion: this.direccion,
            telefono: this.miFormulario.get('telefono')?.value || '',
            precio: this.miFormulario.get('precio')?.value || '',
            lat: this.coordenadasEntrada.lat,
            lng: this.coordenadasEntrada.lng,
            estado: 'DISPONIBLE',
            usuario: this.miFormulario.get('usuario')?.value || 'anónimo',
          };
          console.log(nuevoReporte);


          this.reporteService.addReporte(nuevoReporte).subscribe({
            next: (res) => {
              console.log('✅ Reporte guardado correctamente:', res);
              const smallOffset = Math.random() * 0.0001 - 0.00005;
              res.lat += smallOffset;
              res.lng += smallOffset;
              console.log(res.lat);

              // 🔹 Emitimos con bandera para indicar que es nuevo
              this.markerNew.emit({ ...res, esNuevo: true });

              // 🔹 Reiniciamos el formulario con valores base
              this.miFormulario.reset({
                titulo: '',
                servicio: '',
                // 🆕 Reiniciar categoría a vacío
                categoria: '',
                direccion: '',
                telefono: '',
                precio: '',
                lat: this.coordenadasEntrada.lat,
                lng: this.coordenadasEntrada.lng,
                usuario: this.currentUser?.username || 'desconocido',
              });

              // 🔹 Volvemos a la vista de mapa
              this.mostrarMapaEvent.emit();
            },
            error: (err) => console.error('❌ Error al guardar reporte:', err),
          });
        }
      );
    }
  }

  updateMarker() {
    if (!this.marker) return;
    console.log(this.marker.id);

    const updated: Reporte = {
      ...this.marker, // mantiene lat, lng, dirección
      titulo: this.miFormulario.get('titulo')?.value,
      servicio: this.miFormulario.get('servicio')?.value,
      categoria: this.miFormulario.get('categoria')?.value,
      telefono: this.miFormulario.get('telefono')?.value,
      precio: this.miFormulario.get('precio')?.value,
      usuario: this.miFormulario.get('usuario')?.value,
      lat: this.miFormulario.get('lat')?.value,
      lng: this.miFormulario.get('lng')?.value,
    };
    console.log(updated);
    this.reporteService.updateReporte(this.marker.id, updated).subscribe({
      next: (res) => {
        console.log('✅ Marcador actualizado en el servidor:', res);

        // Emitir el evento para que Mapa actualice su lista local
        this.markerUpdated.emit(res);

        alert('✅ Marcador actualizado correctamente');
        this.mostrarMapaEvent.emit();
      },
      error: (err) => {
        console.error('❌ Error al actualizar marcador:', err);
        alert('⚠️ No se pudo actualizar el marcador.');
      },
    });
  }
}
