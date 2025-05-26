import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { LoginRequest } from "../../models/auth.model"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {

  loginData: LoginRequest = {
    email: "",
    password: "",
  }

  showBetaInfo = false;

  errorMessage: string = ""
  showPassword: boolean = false;
  showModal: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { showActivationModal?: boolean };
    if (state?.showActivationModal) {
      this.showModal = true;
    }

    // If access token is present, redirect to dashboard
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      this.router.navigate(["/dashboard"]);
    }
  }

  closeModal() {
    this.showModal = false; // Cerrar el modal
  }

  private checkUGRMail(email: string): boolean {
    // @ugr.es or @correo.ugr.es
    const ugrRegex: RegExp = /@ugr\.es$|@correo\.ugr\.es$/;
    return ugrRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = "Por favor, complete todos los campos"
      return
    }

    if (!this.checkUGRMail(this.loginData.email)) {
      this.errorMessage = "El correo electrónico debe ser de la UGR"
      return
    }

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(["/dashboard"])
      },
      error: (err) => {
        this.errorMessage = err.error.message || "Error en el inicio de sesión"
      },
    })
  }
}
