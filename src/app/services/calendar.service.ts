import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { CalendarResponse, HolidayResponse } from '../models/calendar.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  // We could add some kind of cache in the future
  // Must think about how and when to update it, because managing subscription is easy
  // but managing when a extra class is added or removed is not so easy

  currentYear: number = new Date().getFullYear();
  holidayApi: string = "https://date.nager.at/api/v3/publicholidays/" + this.currentYear + "/ES";

  constructor(private apiService: ApiService, private http: HttpClient) {}

  getHolydayApi(): Observable<HolidayResponse[]> {
    // Http request GET directly without using API Service
    return this.http.get<HolidayResponse[]>(this.holidayApi).pipe(
      tap((response) => {
        //console.log('Holidays response', response);
      })
    );

  }

  getEntireCalendar(): Observable<CalendarResponse> {

    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<CalendarResponse>('academic-subscription/entire-calendar', {}, access_token).pipe(
      tap((response) => {
        //console.log('Calendar response', response);
      }
      )
    );
  }

  getSyncUrl(): Observable<string> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<string>('academic-subscription/sync-url', {}, access_token, 'text').pipe(
      tap((response) => {
        //console.log('Sync URL response', response);
      })
    );
  }

}
