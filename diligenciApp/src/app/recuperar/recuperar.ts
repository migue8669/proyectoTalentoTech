import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css'],
  imports: [ReactiveFormsModule],
})
export class RecuperarComponent {
  recuperarForm: FormGroup;
  codigoEnviado = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  enviarCodigo(): void {
    if (this.recuperarForm.valid) {
      const email = this.recuperarForm.value.email;
      const codigo = this.generarCodigo();

      // 🔹 Endpoint de tu backend que enviará el correo
      const url = 'http://localhost:3000/enviar-codigo'; 

      this.http.post(url, { email, codigo }).subscribe({
        next: (res: any) => {
          console.log('✅ Código enviado correctamente:', res);
          this.codigoEnviado = true;
          this.mensaje = `Código enviado a ${email}`;
          
        },
        error: (err) => {
          console.error('❌ Error al enviar código', err);
          this.mensaje = 'Error al enviar el código. Intenta nuevamente.';
        },
      });
    } else {
      this.mensaje = 'Por favor ingresa un correo válido.';
    }
  }

  generarCodigo(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Ej: 849302
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
