import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Importante para la verificación
import { response } from 'express';

export interface Coordenadas {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
    private platformId = Inject(PLATFORM_ID);

    // Retorna una promesa que resuelve a las coordenadas del usuario
    async getPosition(): Promise<Coordenadas> {


        // Si llegamos aquí, estamos en el navegador y las APIs existen.
        return new Promise((resolve, reject) => {
            console.log("Intentando obtener la ubicación...");
            console.log(navigator.geolocation.getCurrentPosition(
                (position) => {position}))

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    // Mapear el error real de Geolocation a un mensaje amigable
                    let message = 'Error desconocido al obtener la ubicación.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "Permiso denegado por el usuario.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Información de ubicación no disponible.";
                            break;
                        case error.TIMEOUT:
                            message = "Tiempo de espera agotado.";
                            break;
                        default:
                            message = error.message || 'Fallo de geolocalización.';
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }
}


