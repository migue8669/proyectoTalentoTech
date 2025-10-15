import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';

  constructor() {}

  login(username: string, password: string): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, 'tokenEjemplo');
      return true;
    }
    return false;
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
      window.location.href = '/login'; // Redirige al login
    }
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') {
      // 🔹 SSR (no hay localStorage)
      return false;
    }
    return !!localStorage.getItem(this.tokenKey);
  }
}
