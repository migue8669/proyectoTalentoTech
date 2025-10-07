import { Injectable } from '@angular/core';
export interface Coordenadas {
  lat: number;
  lng: number;
}
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor() { }

  /**
   * Obtiene la posición actual del usuario (latitud y longitud).
   * @returns Una Promesa que resuelve con el objeto Coordenadas o rechaza con un error.
   */
  getPosition(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      // 1. Verificar si el navegador soporta la geolocalización
      if (navigator.geolocation) {
        // 2. Solicitar la posición actual
        navigator.geolocation.getCurrentPosition(
          (resp) => {
            // Éxito: resolver la promesa con las coordenadas
            resolve({
              lng: resp.coords.longitude,
              lat: resp.coords.latitude
            });
          },
          (err) => {
            // Error: rechazar la promesa (ej. si el usuario deniega el permiso)
            reject(err);
          },
          // Opciones opcionales
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        // 3. El navegador no soporta la API
        reject(new Error('Geolocalización no soportada por este navegador.'));
      }
    });
  }

}
