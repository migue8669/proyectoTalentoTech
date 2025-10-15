import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Coordenadas {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiKey = 'AIzaSyC27dGs-ArYnNnQD3azSWx1aXtA3Pc7IgA'; // 🔑 Reemplaza con tu clave
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor( private http: HttpClient) {

  }
  // Retorna una promesa que resuelve a las coordenadas del usuario
  async getPosition(): Promise<Coordenadas> {
    // Si llegamos aquí, estamos en el navegador y las APIs existen.
    return new Promise((resolve, reject) => {
      console.log('Intentando obtener la ubicación...');
      console.log(
        navigator.geolocation.getCurrentPosition((position) => {
          position;
        })
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Mapear el error real de Geolocation a un mensaje amigable
          let message = 'Error desconocido al obtener la ubicación.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso denegado por el usuario.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado.';
              break;
            default:
              message = error.message || 'Fallo de geolocalización.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  getDireccion(lat: number, lng: number) {
    const url = `${this.baseUrl}?latlng=${lat},${lng}&key=${this.apiKey}&language=es`;
    console.log("url ",url);

    return this.http.get(url);
  }
}
