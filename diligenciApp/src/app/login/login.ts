import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

  onLogin() {
    this.auth.login(this.username, this.password).subscribe((success) => {
      if (success) {
        this.router.navigate(['/mapa']);
      } else {
        this.error = 'Usuario o contraseña incorrectos';
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
