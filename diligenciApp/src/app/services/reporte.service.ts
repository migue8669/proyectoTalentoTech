import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reporte {
  id?: number;
  nombre: string;
  servicio: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  usuario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:3000/reportes'; // URL del json-server

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
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un reporte
  updateReporte(id: number, reporte: Reporte): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.apiUrl}/${id}`, reporte);
  }
}
