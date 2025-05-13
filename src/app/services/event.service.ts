import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { Event, FacultyEvent, FacultyGroupEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService) { }

  getMyGroupEvents(): Observable<Event[]> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<Event[]>('academic-subscription/group-event', {}, access_token).pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }

  getMyFacultyEvents(): Observable<FacultyGroupEvent> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<FacultyGroupEvent>('academic-subscription/faculty-group-event', {}, access_token).pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }

  createFacultyEvent(newFacutyEvent: FacultyEvent) {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      facultyName: newFacutyEvent.facultyName,
      day : newFacutyEvent.day,
      date : newFacutyEvent.date,
      initHour : newFacutyEvent.initHour,
      finishHour : newFacutyEvent.finishHour,
      title : newFacutyEvent.title
    };

    return this.apiService.post<FacultyEvent>('academic-subscription/faculty-event', params, {}, access_token).pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }

  createGroupEvent(newGroupEvent: Event) {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      classroom: newGroupEvent.classroom,
      day: newGroupEvent.day,
      date: newGroupEvent.date,
      initHour: newGroupEvent.initHour,
      finishHour: newGroupEvent.finishHour,
      groupName: newGroupEvent.groupName,
      subjectName: newGroupEvent.subjectName,
      teacher: newGroupEvent.teacher,
      gradeName: newGroupEvent.gradeName,
      facultyName: newGroupEvent.facultyName,
      title: newGroupEvent.title
    };

    return this.apiService.post<Event>('academic-subscription/group-event', params, {}, access_token).pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }

  deleteGroupEvent(eventId: number) {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      eventId: eventId
    };

    return this.apiService.delete(`academic-subscription/group-event`, params, access_token, 'text').pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }

  deleteFacultyEvent(eventId: number) {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      eventId: eventId
    };

    return this.apiService.delete(`academic-subscription/faculty-event`, params, access_token, 'text').pipe(
      tap((response) => {
        //console.log('Events response', response);
      })
    );
  }


}
