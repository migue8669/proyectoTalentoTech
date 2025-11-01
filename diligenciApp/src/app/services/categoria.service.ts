import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Categoria {
  id: number;
  nombrePrincipal: string;
  nombreSubcategoria: string;
  descripcion: string;
}



@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrlCat = 'http://localhost:8081/categorias'; // URL del json-server

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrlCat);
  }
}
