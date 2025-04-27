import { Component, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.css",
})
export class NavbarComponent {
  isMenuOpen = false
  isMobile = window.innerWidth < 768

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768
    if (!this.isMobile) {
      this.isMenuOpen = false
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
