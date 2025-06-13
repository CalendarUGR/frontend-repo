import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { LoginRequest } from "../../models/auth.model"
import { ProfileService } from "../../services/profile.service"

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
  activationModalTitle: string = "Registro exitoso";
  activationModalText: string = "";

  showRecoverModal: boolean = false;
  recoverEmail: string = "";
  recoverErrorMessage: string = "";

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { showActivationModal?: boolean, activationModalText?: string };
    if (state?.showActivationModal) {
      this.showModal = true;
      this.activationModalTitle = "¡Correo enviado!";
      this.activationModalText = state.activationModalText || "Accede a tu correo para poder finalizar el reseteo de la contraseña.";
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
        console.error("Error :", err.error.message || err);
        this.errorMessage = err.error.message || "Error en el inicio de sesión"
      },
    })
  }

  // Methods for recover modal
  openRecoverModal(): void {
    this.showRecoverModal = true;
  }

  closeRecoverModal(): void {
    this.showRecoverModal = false;
  }

  sendRecoveryEmail(): void {

    if (!this.recoverEmail) {
      this.recoverErrorMessage = "Por favor, ingrese su correo electrónico"
      return
    }

    if (!this.checkUGRMail(this.recoverEmail)) {
      this.recoverErrorMessage = "El correo electrónico debe ser de la UGR"
      return
    }

    this.profileService.sendResetPasswordEmail(this.recoverEmail.trim()).subscribe({
      next: () => {
        this.closeRecoverModal();
        this.activationModalText = "Se ha enviado un correo de recuperación a tu dirección. Por favor, revisa tu bandeja de entrada.";
        this.activationModalTitle = "¡Correo enviado!";
        this.showModal = true; // Show the modal after successful email sending
        this.recoverErrorMessage = ""; // Clear any previous error messages
      },
      error: (err) => {
        console.error("Error :", err.error.message || err);
        this.recoverErrorMessage = "Error al enviar el correo de recuperación";
      },
    })
  }
}
