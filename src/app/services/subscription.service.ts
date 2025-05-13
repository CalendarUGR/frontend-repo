import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { Fields, SubjectGrade, Subscription } from '../models/subscriptions.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private apiService: ApiService) { }

  // Subscriptions

  getSubscriptions(): Observable<Subscription[]> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<Subscription[]>('academic-subscription/subscriptions', {}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );
  }

  deleteSubscription(sub : Subscription): Observable<any> {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      'grade': sub.grade,
      'subject': sub.subject,
      'group': sub.group
    }

    return this.apiService.delete<any>('academic-subscription/subscription', params, access_token, 'text').pipe(
      tap((response) => {
        //console.log('Delete subscription response', response);
      })
    );
  }

  addSubscription(sub : Subscription): Observable<any> {
    const access_token: string = localStorage.getItem('access_token') || '';

    const params = {
      'faculty': sub.faculty,
      'grade': sub.grade,
      'subject': sub.subject,
      'group': sub.group
    }

    return this.apiService.post<any>('academic-subscription/subscription', params, {}, access_token).pipe(
      tap((response) => {
        //console.log('Add subscription response', response);
      })
    );
  }

  // Grades, subjects and groups

  getFields(): Observable<Fields> {

    return this.apiService.get<Fields>('schedule-consumer/grades').pipe(
      tap((response) => {
        //console.log('Fields response', response);
      })
    );
  }

  getSubjectsByGrade(grade: string): Observable<SubjectGrade> {

    const params = {
      'grade': grade
    }

    return this.apiService.get<SubjectGrade>(`schedule-consumer/subjects-groups`, params).pipe(
      tap((response) => {
        //console.log('Subjects by grade response', response);
      })
    );
  }

}
