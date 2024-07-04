import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private apiUrl = 'https://swapi.dev/api';

  constructor(private http: HttpClient) {}

  getCharacter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/${id}/`);
  }

  getCharacterCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/`);
  }
}
