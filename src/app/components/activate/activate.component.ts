import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activate',
  standalone: true,
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css'],
  imports: [CommonModule]
})
export class ActivateComponent implements OnInit {
  activationStatus: 'success' | 'error' | null = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {

      this.apiService.get(`user/activate`, {token : `${token}`}).subscribe({
        next: (response) => {
          if (response) {
            this.activationStatus = 'success';
            this.errorMessage = 'Cuenta activada con éxito. Ahora puedes iniciar sesión.';
          }
        },
        error: (error) => {
          this.activationStatus = 'error';
          if (error.status === 404) {
            this.errorMessage = 'EL token no es válido o no se encontró al usuario.';
          } else {
            this.errorMessage = 'Error al activar la cuenta. Por favor, inténtalo de nuevo más tarde.';
          }
        },
      });
    } else {
      this.activationStatus = 'error';
      this.errorMessage = 'No se proporcionó un token válido.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
