import { Injectable } from "@angular/core"
import { type Observable, of, throwError } from "rxjs"
import { catchError, delay, tap } from "rxjs/operators"
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private readonly accessTokenKey: string = "access_token";
  private readonly refreshTokenKey: string = "refresh_token";

  private role: string = "";
  private isStudent: boolean = false;

  constructor(private apiService: ApiService) {

    const accessToken = localStorage.getItem(this.accessTokenKey);

    // Check if the user is already authenticated
    this.setIsStudent(accessToken);

  }

  setIsStudent(accessToken: string | null = null): void {
    if (accessToken) {
      this.role = this.getRoleFromToken(accessToken);
      if (this.role == "ROLE_STUDENT") {
        this.isStudent = true;
      }else {
        this.isStudent = false;
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.apiService.post<LoginResponse>("auth/login", credentials).pipe(
    tap((response) => {
      // Solo guardar en localStorage si la respuesta es correcta
      localStorage.clear();
      localStorage.setItem(this.accessTokenKey, response.access_token);
      localStorage.setItem(this.refreshTokenKey, response.refresh_token);
      this.setIsStudent(response.access_token);
    }),
    catchError((error) => {
      // No tocar localStorage si hay error
      console.error("Login error:", error);
      return throwError(() => error);
    })
  );
}

  register(registerData: RegisterRequest): Observable<User> {

    return this.apiService.post<User>("user/register", registerData).pipe(
      tap((response) => {
        //console.log("Registro exitoso", response)
      }),
    );
  }

  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  }

  getRole(): string {
    return this.role;
  }

  getIsStudent(): boolean {
    return this.isStudent;
  }


  decodeToken(token: string): any {
    if (!token) return null;

    const payload = token.split(".")[1]; // Extraer la segunda parte del JWT
    try {
      return JSON.parse(atob(payload)); // Decodificar Base64 y convertir a JSON
    } catch (e) {
      console.error("Error al decodificar el token:", e);
      return null;
    }
  }

  getRoleFromToken(token: string): string {
    const decoded = this.decodeToken(token);
    return decoded?.role || "";
  }

}
