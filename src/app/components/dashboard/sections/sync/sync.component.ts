import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarService } from '../../../../services/calendar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.css'
})
export class SyncComponent {
  syncUrl = "https://example.com/calendar/sync/user123456"
  showToast = false;
  toastMessage = "";

  constructor(private calendarService: CalendarService, private router: Router) {
    this.calendarService.getSyncUrl().subscribe({
      next: (response) => {
        this.syncUrl = response;
      },
      error: (error) => {
        console.error('Error fetching sync URL:', error);
        this.showToast = true;
        this.toastMessage = "Error al obtener la URL de sincronización";
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.syncUrl).then(
      () => {
        this.showToast = true;
        this.toastMessage = "URL copiada al portapapeles";
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      },
      (err) => {
        this.showToast = true;
        this.toastMessage = "Error al copiar: " + err;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    );
  }
}
