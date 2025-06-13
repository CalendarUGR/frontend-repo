import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"
import { RegisterRequest } from "../../models/auth.model"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {

  registerData: RegisterRequest = {
    nickname: "",
    email: "",
    password: ""
  }

  showBetaInfo = false;

  showPassword1: boolean = false;
  showPassword2: boolean = false;

  confirmPassword: string = ""
  errorMessage: string = ""

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  togglePassword1Visibility(): void {
    this.showPassword1 = !this.showPassword1;
  }

  togglePassword2Visibility(): void {
    this.showPassword2 = !this.showPassword2;
  }

  register() {
    if (!this.registerData.nickname || !this.registerData.email || !this.registerData.password || !this.confirmPassword) {
      this.errorMessage = "Por favor, complete todos los campos"
      return
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = "Las contraseñas no coinciden"
      return
    }

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.router.navigate(["/login"], {
          state: { showActivationModal: true,
            activationModalTitle: "¡Registro exitoso!",
            activationModalText: "Por favor, revisa tu correo para activar tu cuenta."
           }, // Pasar estado al login
        });
        this.errorMessage = ""
      },
      error: (error) => {
        console.error("Error :", error.error.message || error);
        this.errorMessage = "Error en el registro. " + error.error?.message || "Por favor, inténtalo de nuevo más tarde."
      }
    })
  }
}
