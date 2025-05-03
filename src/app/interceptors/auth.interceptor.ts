import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  console.log('INTERCEPTOR');

  if (!accessToken) {
    console.log('NO ACCESS TOKEN');
    router.navigate(['/login']);
    return throwError(() => new Error('No access token found'));
  }

  if (req.url.includes('auth/refresh') || req.url.includes('auth/login') || req.url.includes('user/register')) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401 && refreshToken) {
        console.log('ACCESS TOKEN EXPIRED');
        return apiService.post<{ access_token: string }>('auth/refresh', { refresh_token: refreshToken }).pipe(
          switchMap((response) => {
            console.log('REFRESHING TOKEN');
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', refreshToken);

            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });

            return next(retryRequest);
          }),
          catchError(() => {
            console.log('REFRESH TOKEN EXPIRED');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.navigate(['/login']);
            return throwError(() => new Error('Refresh token expired'));
          })
        );
      } else {
        return throwError(() => error);
      }
    })
  );
};
