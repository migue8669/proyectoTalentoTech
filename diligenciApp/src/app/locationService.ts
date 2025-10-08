import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Importante para la verificación

export interface Coordenadas {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // 1. Inyectar PLATFORM_ID en el constructor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Obtiene la posición actual del usuario (latitud y longitud).
   * @returns Una Promesa que resuelve con el objeto Coordenadas o rechaza con un error.
   */
  getPosition(): Promise<Coordenadas> {

    // 2. VERIFICACIÓN CRÍTICA: Asegurarse de que estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      // Si estamos en el servidor (SSR), el objeto 'navigator' no existe.
      console.warn("Geolocalización no disponible en el servidor (SSR). Saltando...");
      // Devolvemos un error controlado
      return Promise.reject(new Error("La geolocalización solo está disponible en el cliente (navegador)."));
    }

    // Si estamos en el navegador, procedemos con la API de geolocalización
    return new Promise((resolve, reject) => {
      console.log("Intentando obtener la ubicación...");

      // 3. Verificar si el navegador soporta la geolocalización
      if ('geolocation' in navigator) {

        // 4. Solicitar la posición actual
        navigator.geolocation.getCurrentPosition(
          (resp) => {
            console.log(resp, " respuesta");

            console.log("Respuesta de geolocalización obtenida.");
            // Éxito: resolver la promesa con las coordenadas
            resolve({
              lng: resp.coords.longitude,
              lat: resp.coords.latitude
            });
          },
          (err) => {
            // Error: rechazar la promesa (ej. si el usuario deniega el permiso)
            console.error("Error real de geolocalización:", err);
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
        // 5. El navegador no soporta la API
        reject(new Error('Geolocalización no soportada por este navegador.'));
      }
    });
  }
}
