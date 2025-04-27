import { Injectable } from "@angular/core"
import { type Observable, of, throwError } from "rxjs"
import { delay, tap } from "rxjs/operators"
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private isAuthenticated: boolean = false;
  private readonly accessTokenKey: string = "access_token";
  private readonly refreshTokenKey: string = "refresh_token";

  constructor( private apiService: ApiService) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.apiService.post<LoginResponse>("auth/login", credentials).pipe(
      tap((response) => {
        this.isAuthenticated = true
        localStorage.setItem(this.accessTokenKey, response.access_token)
        localStorage.setItem(this.refreshTokenKey, response.refresh_token)
        console.log(response)
      }),
    );
  }

  register(registerData : RegisterRequest): Observable<User> {

    return this.apiService.post<User>("user/register", registerData).pipe(
      tap((response) => {
        console.log("Registro exitoso", response)
      }),
    );
  }

  logout(): void {
    this.isAuthenticated = false
    localStorage.removeItem(this.accessTokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated
  }
}
