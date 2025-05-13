import { Component, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router"
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
  isMobile = window.innerWidth < 1023
  isStudent = false

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false; // Close the menu on route change
      }
    });

    // if the user is logged in, check if the role is student
    if (this.authService.isLoggedIn()) {
      this.isStudent = this.authService.getIsStudent();
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 1023;
    if (!this.isMobile) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
