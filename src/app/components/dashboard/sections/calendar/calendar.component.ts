import { Component, Host, HostListener, ViewEncapsulation } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayGridMonthPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import rrulePlugin from '@fullcalendar/rrule'
import { CommonModule } from '@angular/common';


import { CalendarService } from '../../../../services/calendar.service';
import { Router } from '@angular/router';
import { CalendarResponse } from '../../../../models/calendar.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    CommonModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent {

  isMobile: boolean = window.innerWidth < 700;
  isModalOpen = false;
  selectedEvent: any = null;

  calendarOptions: CalendarOptions = {
    locale: esLocale,
    plugins: [dayGridPlugin, dayGridMonthPlugin, rrulePlugin],
    initialView: 'dayGridMonth',
    themeSystem: 'standard',
    height: '90vh',
    weekends: false,
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      if (info.event.id) {
        info.el.setAttribute('id', info.event.id);
        info.el.style.backgroundColor = info.event.extendedProps?.['backgroundColor'];
      }
    }
  };

  constructor(private calendarService: CalendarService, private router: Router) {

    if (this.isMobile) {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next',
        center: '',
        right: 'title'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: 'dayGridMonth,dayGridWeek,dayGridDay',
        right: ''
      };
    } else {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: '',
        right: ''
      };
    }

    // Call the function to get the entire calendar
    this.getEntireCalendar();

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Media query 600px
    if (window.innerWidth < 700) {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next',
        center: '',
        right: 'title'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: 'dayGridMonth,dayGridWeek,dayGridDay',
        right: ''
      };
    } else {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: '',
        right: ''
      };
    }
  }

  private generateBackgroundColor(subject: string, isDot: boolean): string {
    // Generate a random color based on the subject name
    const hash = Array.from(subject).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360; // Get a hue value between 0 and 360
    if (isDot) {
      return `hsl(${hue}, 70%, 50%)`;
    }
    return `hsl(${hue}, 70%, 80%)`;
  }

  private getEventDays(spanishDay: string): string {
    switch (spanishDay) {
      case 'Lunes':
        return 'mo';
      case 'Martes':
        return 'tu';
      case 'Miércoles':
        return 'we';
      case 'Jueves':
        return 'th';
      case 'Viernes':
        return 'fr';
      case 'Sábado':
        return 'sa';
      case 'Domingo':
        return 'su';
      default:
        return '';
    }
  }

  private getEntireCalendar(): void {

    this.calendarService.getEntireCalendar().subscribe({
      next: (response) => {
        const calendar: CalendarResponse = response; // a map with groupEvents, facultyEvents and classes
        let counter: number = 0;
        // First we are going to add the rcurring events (classes key)
        this.calendarOptions.events = calendar.classes.map((event) => {
          // Weekly recurrent events using rrule
          const startDateTime = `${event.initDate}T${event.initHour}`;
          const endDateTime = `${event.finishDate}T${event.finishHour}`;
          const backgroundColor = this.generateBackgroundColor(event.subject, false);
          const dotBackgroundColor = this.generateBackgroundColor(event.subject, true);
          const eventId = `event-${counter++}`;

          return {
            id: eventId,
            backgroundColor: dotBackgroundColor,
            title: 'Aula: '+ event.classroom + ' - ' + event.subject + ' - Grupo : ' + event.group,
            allDay: false,
            extendedProps: {
              backgroundColor: backgroundColor,
              description: 'Clase de la asignatura ' + event.subject + '.\nGrupo : ' + event.group + '.',
              location: 'Aula: ' + event.classroom,
              teachers: event.teachers,
              url : event.subjectUrl,
              start: event.initHour,
              end: event.finishHour,
              type: 'clase oficial',
              day: event.day
            },
            rrule: {
              freq: 'weekly',
              interval: 1,
              byweekday: [this.getEventDays(event.day)],
              dtstart: startDateTime,
              until: endDateTime
            },
            startTime: event.initHour,
            endTime: event.finishHour,
          };
        });

      },
      error: (error) => {
        console.error('Error fetching calendar data:', error);
      }

    });

  }

  handleEventClick(info: any) {
    this.selectedEvent = {
      title: info.event.title,
      description: info.event.extendedProps?.description,
      location: info.event.extendedProps?.location,
      teachers: info.event.extendedProps?.teachers,
      url: info.event.extendedProps?.url,
      initHour: info.event.extendedProps?.start,
      finishHour: info.event.extendedProps?.end,
      day: info.event.extendedProps?.day
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

}
