import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { CalendarResponse } from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  // We could add some kind of cache in the future
  // Must think about how and when to update it, because managing subscription is easy
  // but managing when a extra class is added or removed is not so easy

  constructor(private apiService: ApiService) { }

  getEntireCalendar(): Observable<CalendarResponse> {

    const token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<CalendarResponse>('academic-subscription/entire-calendar', {}, token).pipe(
        tap((response) => {
          //console.log('Calendar response', response);
        }
      )
    );

  }

}
