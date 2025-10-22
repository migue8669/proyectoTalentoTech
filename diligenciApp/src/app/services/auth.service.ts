import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuarios';
  private currentUser: { id: number; username: string } | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Solo acceder a localStorage si estamos en el navegador
    if (this.isBrowser) {
      const userData = localStorage.getItem('user');
      this.currentUser = userData ? JSON.parse(userData) : null;
    }
  }

  /** 🔐 Iniciar sesión */
  login(username: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?username=${username}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          this.currentUser = { id: users[0].id, username: users[0].username };

          // Guardar sesión solo en el navegador
          if (this.isBrowser) {
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }
          return true;
        }
        return false;
      })
    );
  }

  /** 🆕 Registrar usuario */
  register(username: string, password: string, email:string): Observable<any> {
    if (!username || !password || !email) {
      return of({ error: 'El usuario y la contraseña son obligatorios.' });
    }
    const newUser = { username, password, email };
    console.log("newUser ",newUser);
    
    return this.http.post(this.apiUrl, newUser);
  }
  /** 🔍 Buscar usuario por nombre y correo */
findUserByEmail(username: string, email: string): Observable<any> {
  console.log("findUser");
  
  return this.http.get<any[]>(`${this.apiUrl}?username=${username}&email=${email}`)
    .pipe(map(users => users.length > 0 ? users[0] : null));
}

/** 📧 Enviar correo con código de recuperación (simulado) */
sendRecoveryEmail(email: string, codigo: string): Observable<any> {
  console.log(`📨 Simulando envío de correo a ${email} con código: ${codigo}`);
  // Aquí podrías conectar con un backend real o servicio SMTP
  return of({ success: true });
}


  /** 🚪 Cerrar sesión */
  logout() {
    this.currentUser = null;

    if (this.isBrowser) {
      localStorage.removeItem('user');
    }

    this.router.navigate(['/login']);
  }

  /** ✅ Verificar sesión activa */
  isLoggedIn(): boolean {
    if (this.currentUser) return true;

    if (this.isBrowser) {
      const data = localStorage.getItem('user');
      this.currentUser = data ? JSON.parse(data) : null;
      return !!this.currentUser;
    }

    return false;
  }

  /** 👤 Obtener usuario actual */
  getCurrentUser(): { id: number; username: string } | null {
    if (this.currentUser) return this.currentUser;

    if (this.isBrowser) {
      const data = localStorage.getItem('user');
      this.currentUser = data ? JSON.parse(data) : null;
    }

    return this.currentUser;
  }
  /** 🔄 Recuperar contraseña */
recoverPassword(username: string, newPassword: string): Observable<any> {
  console.log("recover ");
  
  return this.http.get<any[]>(`${this.apiUrl}?username=${username}`).pipe(
    map(users => {
      if (users.length === 0) {
        throw new Error('Usuario no encontrado.');
      }

      const user = users[0];
      return this.http.patch(`${this.apiUrl}/${user.id}`, { password: newPassword }).subscribe();
    })
  );
}

}
