import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-muro',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './muro.html',
  styleUrl: './muro.css'
})
export class Muro implements OnInit {

  // 1. Declarar la propiedad del formulario
  miFormulario: FormGroup;

  constructor() {
    // 2. Inicializar el formulario y sus controles
    this.miFormulario = new FormGroup({
      // Definir los controles con su valor inicial y validadores
      nombre: new FormControl(''),
      servicio: new FormControl('', Validators.required),
      mensaje: new FormControl('')
    });
  }

  ngOnInit(): void {
  }

  // 3. Método para manejar el envío del formulario
  onSubmit(): void {
    if (this.miFormulario.valid) {
      console.log('Formulario Válido. Datos:', this.miFormulario.value);
      // Aquí se enviaría la información a un servicio/API

      // Opcional: reiniciar el formulario
      this.miFormulario.reset();
    } else {
      console.log('Formulario Inválido');
      // Marcar todos los campos como "tocados" para mostrar errores
      this.miFormulario.markAllAsTouched();
    }
  }

}
