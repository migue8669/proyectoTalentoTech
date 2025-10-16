import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}
  onLogin() {
    this.auth.login(this.username, this.password).subscribe((success) => {
      if (success) {
        this.router.navigate(['/mapa']);
      } else {
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }

  onRegister() {
    // Validación de campos vacíos
    if (!this.username.trim() || !this.password.trim()) {
      alert('Por favor, completa todos los campos antes de registrarte.');
      return;
    }

    // Llamar al servicio de registro
    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        alert('✅ Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        this.username = '';
        this.password = '';
      },
      error: (err) => {
        console.error('Error al registrar usuario:', err);
        alert('⚠️ Ocurrió un error al registrar el usuario. Intenta nuevamente.');
      },
    });
  }
}
