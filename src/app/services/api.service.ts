import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8090/calendarugr/v1';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: { [key: string]: string | number }, access_token?: string, responseType?: any): Observable<T> {
    let headers = new HttpHeaders();


    if (access_token) {
      headers = headers.set('Authorization', `Bearer ${access_token}`);
      return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params, headers, responseType });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any, params?: { [key: string]: string | number }, access_token?: string): Observable<T> {
    let headers = new HttpHeaders();
    if (access_token) {
      headers = headers.set('Authorization', `Bearer ${access_token}`);
      return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { params, headers });
    }
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { params });
  }

  put<T>(endpoint: string, body: any, params?: { [key: string]: string | number }, access_token?: string): Observable<T> {
    let headers = new HttpHeaders();

    if (access_token) {
      headers = headers.set('Authorization', `Bearer ${access_token}`);
      return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { params, headers });
    }

    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { params });
  }

  delete<T>(endpoint: string, params?: { [key: string]: string | number }, access_token?: string,  responseType?: any): Observable<T> {
    let headers = new HttpHeaders();

    if (access_token) {
      headers = headers.set('Authorization', `Bearer ${access_token}`);
      return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params, headers, responseType });
    }

    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

}
