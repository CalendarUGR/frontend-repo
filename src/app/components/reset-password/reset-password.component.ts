import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ActivatedRoute } from "@angular/router";
import { ProfileService } from "../../services/profile.service"

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.css",
})
export class ResetPasswordComponent {
  newPassword = ""
  confirmPassword = ""
  errorMessage = ""
  isLoading = false
  resetSuccess = false
  token: string | null = null;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  resetPassword() {
    this.errorMessage = ""

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = "Por favor, complete todos los campos"
      return
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = "Las contraseñas no coinciden"
      return
    }

    const passRegex = /^(?=.*[A-Z])(?=.*[0-9]).{9,}$/;
    if (!passRegex.test(this.newPassword)) {
      this.errorMessage = "La contraseña debe tener al menos 9 caracteres, una mayúscula y un número";
      return;
    }

    this.isLoading = true

    if (!this.token) {
      this.isLoading = false;
      this.errorMessage = "Token de restablecimiento no válido o no proporcionado.";
      return;
    }

    this.profileService.resetPassword(this.newPassword, this.token).subscribe({
      next: () => {
        this.isLoading = false
        this.resetSuccess = true
        setTimeout(() => {
          this.router.navigate(["/login"])
        }, 1500)
      },
      error: (err) => {
        this.isLoading = false
        console.error("Error :", err.error.message || err);
        this.errorMessage = "Error al restablecer la contraseña. " + (err.error?.message || "Inténtalo de nuevo más tarde.")
      }
    })

  }
}
