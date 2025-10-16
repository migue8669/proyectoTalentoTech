import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuarios';
  private isAuthenticated = false;

  constructor(private http: HttpClient, private router: Router) {}

  /** 🔐 Iniciar sesión */
  login(username: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?username=${username}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length > 0) {
            this.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(users[0]));
            return true;
          } else {
            return false;
          }
        })
      );
  }

  /** 🆕 Registrar usuario */
  register(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password });
  }

  /** 🚪 Cerrar sesión */
  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /** ✅ Verificar sesión */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
