import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8090/calendarugr/v1';

  constructor(private http: HttpClient) {}

  post<T>(endpoint: string, body: any, params?: { [key: string]: string | number }): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { params });
  }

  get<T>(endpoint: string, params?: { [key: string]: string | number }, token?: string): Observable<T> {
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);

      return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { headers });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

}
