import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ProfileService } from "../../../../services/profile.service"
import type { User } from "../../../../models/user.model"
import { Role } from '../../../../models/user.model';
import { Router } from "@angular/router"
@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {

  role: Role = {
    name: "ROLE_STUDENT",
  }

  user: User = {
    nickname: "usuario_ejemplo",
    email: "usuario@ejemplo.com",
    role: this.role,
    notification: true,
  }

  // States for nickname editing
  isEditingNickname = false
  newNickname = ""

  // States for modals
  showRoleModal = false
  showPasswordModal = false
  showDeleteAccountModal = false

  // Changing password states
  currentPassword = ""
  newPassword = ""
  confirmPassword = ""
  passwordError = ""

  constructor(private profileService: ProfileService, private router: Router) { }

  ngOnInit(): void {
    // Retrieve user data from the service
    this.profileService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.user = user
      }
    })
  }

  getUIRole(): string {
    switch (this.user.role.name) {
      case "ROLE_ADMIN":
        return "Administrador"
      case "ROLE_TEACHER":
        return "Profesor"
      case "ROLE_STUDENT":
        return "Estudiante"
      default:
        return "Desconocido"
    }
  }

  // Methods for nickname editing
  startEditingNickname(): void {
    this.isEditingNickname = true
    this.newNickname = this.user.nickname
  }

  saveNickname(): void {
    if (this.newNickname.trim() && this.newNickname !== this.user.nickname) {
      this.profileService.updateNickname(this.newNickname).subscribe({
        next: (updatedUser) => {
          this.user.nickname = updatedUser.nickname
          this.showNotification("Nickname actualizado correctamente")
        },
        error: (error) => {
          console.error("Error :", error.error.message || error);
          this.showNotification("Error al actualizar el nickname", true)
        },
      })
    }
    this.isEditingNickname = false
  }

  cancelEditingNickname(): void {
    this.isEditingNickname = false
  }

  // Methods for role change
  openRoleModal(): void {
    this.showRoleModal = true
  }

  closeRoleModal(): void {
    this.showRoleModal = false
  }

  changeRole(): void {
    this.showRoleModal = false
    this.profileService.changeRole(this.role).subscribe({
      next: (updatedUser) => {
        this.user.role = updatedUser.role
        this.showNotification("Rol actualizado correctamente")
        this.goToLogin();
      },
      error: (error) => {
        console.error("Error :", error.error.message || error);
        this.showNotification("Error al actualizar el rol", true)
      },
    })
  }

  // Métodos para el cambio de contraseña
  openPasswordModal(): void {
    this.currentPassword = ""
    this.newPassword = ""
    this.confirmPassword = ""
    this.passwordError = ""
    this.showPasswordModal = true
  }

  closePasswordModal(): void {
    this.showPasswordModal = false
  }

  changePassword(): void {
    // Basic validations
    if (!this.currentPassword) {
      this.passwordError = "Debes introducir tu contraseña actual"
      return
    }

    if (!this.newPassword) {
      this.passwordError = "Debes introducir una nueva contraseña"
      return
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = "Las contraseñas no coinciden"
      return
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{9,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.passwordError =
        "La contraseña debe tener al menos 9 caracteres, incluir al menos una letra mayúscula y un número";
      return;
    }

    // Call the service to change the password
    this.profileService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.showNotification("Contraseña cambiada correctamente")
        this.closePasswordModal()
        this.goToLogin();
      },
      error: (error) => {
        console.error("Error :", error.error.message || error);
        if (error.status === 404) {
          this.passwordError = "Contraseña actual incorrecta"
        } else {
          this.passwordError = "Error al cambiar la contraseña"
        }
      },
    })
  }

  // Méthods for account deactivation
  openDeactivateAccountModal(): void {
    this.showDeleteAccountModal = true
  }

  closeDeactivateAccountModal(): void {
    this.showDeleteAccountModal = false
  }

  deactivateAccount(): void {
    this.profileService.deactivateAccount(this.currentPassword).subscribe({
      next: () => {
        this.currentPassword = "";
        this.showDeleteAccountModal = false; // Cerrar el modal solo si la operación es exitosa
        this.showNotification("Cuenta desactivada correctamente");
        this.goToLogin();
      },
      error: (error) => {
        console.error("Error :", error.error.message || error);
        this.showNotification("Error al desactivar la cuenta: " + error.error.message || "Inténtalo de nuevo más tarde", true);
      },
    });
  }

  // To toggle notifications
  toggleNotifications(): void {
    this.profileService.updateNotificationSettings(this.user.notification).subscribe({
      next: () => {
        this.user.notification = !this.user.notification
        const status = this.user.notification ? "activadas" : "desactivadas"
        this.showNotification(`Notificaciones ${status} correctamente`)
      },
      error: (error) => {
        console.error("Error :", error.error.message || error);
        this.user.notification = !this.user.notification
        this.showNotification("Error al actualizar las notificaciones", true)
      },
    })
  }

  // Notifications
  showToast = false
  toastMessage = ""
  isError = false

  goToLogin(): void {
    localStorage.clear();
    setTimeout(() => {
      this.router.navigate(["/login"]);
    }, 1500);
  }

  showNotification(message: string, error = false): void {
    this.toastMessage = message
    this.isError = error
    this.showToast = true
    setTimeout(() => {
      this.showToast = false
    }, 3000)
  }
}
