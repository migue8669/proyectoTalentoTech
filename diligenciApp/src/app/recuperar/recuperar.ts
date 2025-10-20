import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 Importa esto

@Component({
  selector: 'app-recuperar',
  imports: [FormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css'
})
export class RecuperarComponent {
  username = '';
  newPassword = '';
  message = '';
  isSuccess = false;

  constructor(private auth: AuthService, private router: Router) {}

  recoverPassword() {
    if (!this.username || !this.newPassword) {
      this.message = '⚠️ Por favor completa todos los campos.';
      this.isSuccess = false;
      return;
    }

    this.auth.recoverPassword(this.username, this.newPassword).subscribe({
      next: () => {
        this.message = '✅ Contraseña actualizada con éxito.';
        this.isSuccess = true;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.message = '❌ ' + (err.message || 'Error al recuperar contraseña.');
        this.isSuccess = false;
      },
    });
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
