import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { log } from 'node:console';

export interface Reporte {
  id?:  number;
  titulo: string;
  servicio?: string;
  direccion?: string;
  telefono?: string;
  precio?: string;
  categoria?:string;
  lat: number;
  lng: number;
  usuario?: string;
  estado: 'DISPONIBLE' | 'TOMADO' | 'FINALIZADO'; // Estado de la solicitud
  tomadoPor?: string; // Usuario que tomó la solicitud
  esNuevo?: boolean; // 👈 agregamos esta propiedad opcional


}


export interface Categoria {
  id: number;
  nombrePrincipal: string;      // ✅ CORREGIR a camelCase
  nombreSubcategoria: string;   // ✅ CORREGIR a camelCase
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8081/reporte'; // URL del json-server
  private apiUrlCat = 'http://localhost:8081/categorias'; // URL del json-server

  constructor(private http: HttpClient) {}

  // Obtener todos los reportes
  getReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.apiUrl);
  }

  // Crear un nuevo reporte
  addReporte(reporte: Reporte): Observable<Reporte> {
    return this.http.post<Reporte>(this.apiUrl, reporte);
  }

  // Eliminar un reporte por id
  deleteReporte(id: number): Observable<void> {
    console.log(id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un reporte
  updateReporte(id: number | undefined, reporte: Reporte): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.apiUrl}/${id}`, reporte);
  }
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrlCat);
  }
}
