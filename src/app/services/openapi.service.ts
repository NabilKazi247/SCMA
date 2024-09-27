import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenapiService {
  private apiUrl = '/api'; // Use proxy

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(
        'apikey:' +
          '433598b2b177768131a9093bfa8892138f1aa702b46933a5ff969317af3e8b2f'
      )}`,
    });
  }

  getProjects(): Observable<any> {
    // return this.http.get<any>(`${this.apiUrl}/spec.json`, {
    //   headers: this.getHeaders(),
    // });

    return this.http.get<any>(
      `https://petstore3.swagger.io/api/v3/openapi.json`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getProjectDetails(projectId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${projectId}`, {
      headers: this.getHeaders(),
    });
  }
  // New method for making API requests with dynamic parameters
  makeApiRequest(
    path: string,
    method: string,
    params: any,
    body: any = {}
  ): Observable<any> {
    const url = `${this.apiUrl}${path}`;
    const url2 = `https://petstore3.swagger.io/api/v3${path}`;
    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get<any>(url2, { headers: this.getHeaders(), params });
      case 'post':
        return this.http.post<any>(url2, body, { headers: this.getHeaders() });
      case 'put':
        return this.http.put<any>(url2, body, { headers: this.getHeaders() });
      case 'delete':
        return this.http.delete<any>(url2, {
          headers: this.getHeaders(),
          params,
        });
      default:
        throw new Error('Unsupported method');
    }
  }
}
// const url = `${this.apiUrl}${path}`;
// switch (method.toLowerCase()) {
//   case 'get':
//     return this.http.get<any>(url, { headers: this.getHeaders(), params });
//   case 'post':
//     return this.http.post<any>(url, body, { headers: this.getHeaders() });
//   case 'put':
//     return this.http.put<any>(url, body, { headers: this.getHeaders() });
//   case 'delete':
//     return this.http.delete<any>(url, {
//       headers: this.getHeaders(),
//       params,
//     });
//   default:
//     throw new Error('Unsupported method');
// }
