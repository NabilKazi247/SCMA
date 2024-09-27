import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private apiUrl = 'https://swapi.dev/api';

  constructor(private http: HttpClient) {}

  getModel(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`);
  }

  getModelDetails(modelType: string): Observable<any> {
    return this.http.get<any>(`${modelType}`);
  }
}
