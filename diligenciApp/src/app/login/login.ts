import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { log } from 'node:console';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  showRegister = false;
  newUsername = '';
  newPassword = '';
  email = '';
  phone = '';

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef ) {}

// Archivo: LoginComponent.ts (Método onLogin corregido)

onLogin() {

  // ✅ CORRECCIÓN CLAVE: Valida que los campos no estén vacíos.
  if (!this.username.trim() || !this.password.trim()) {
    this.error = 'Debes ingresar tanto el usuario como la contraseña.';
    // Detenemos la ejecución si falta algún campo.
    return;
  }

  console.log(this.username, this.password);

  // 2. Llama al servicio, que ya valida existencia y contraseña en una sola consulta.
  this.auth.login(this.username, this.password).subscribe({
    next: (success) => {
      console.log(success);

      if (success) {
        this.router.navigate(['/mapa']);
      } else {
        // 3. Muestra el mensaje de error genérico (seguridad recomendada).
        this.error = 'Usuario o contraseña incorrectos';
      }
    },
    error: (err) => {
      // Manejo de errores de red o servidor (ej: si el backend no responde).
      console.error('Error de conexión o servidor:', err);
      this.error = 'No se pudo conectar con el servidor. Intenta más tarde.';
    }
  });
}
  toggleRegister() {
    this.showRegister = !this.showRegister;

       this.cdr.detectChanges(); // 👈 fuerza la actualización de vista

  }
  onRegister() {
    if (!this.newUsername.trim() || !this.newPassword.trim() || !this.email.trim()) {
      alert('Por favor, completa usuario, contraseña y correo.');
      return;
    }

    const newUser = {
      username: this.newUsername,
      password: this.newPassword,
      email: this.email,
      phone: this.phone,
    };

    this.auth.register(newUser.username,newUser.password,newUser.email).subscribe({
      next: () => {
        alert('✅ Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        this.newUsername = '';
        this.newPassword = '';
        this.email = '';
        this.phone = '';
      },
      error: (err) => {
        console.error('Error al registrar usuario:', err);
        alert('⚠️ Ocurrió un error al registrar el usuario. Intenta nuevamente.');
      },
    });
        this.showRegister = false;

  }
}
