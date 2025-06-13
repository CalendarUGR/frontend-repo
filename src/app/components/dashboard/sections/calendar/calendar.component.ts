import { Component, Host, HostListener, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core/index.js';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayGridMonthPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid';
import { CommonModule } from '@angular/common';


import { CalendarService } from '../../../../services/calendar.service';
import { Router } from '@angular/router';
import { AllDayEvent } from '../../../../models/allDayEvent.model';
import { forkJoin } from 'rxjs';

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

  counter: number = 0;

  isMobile: boolean = window.innerWidth < 700;
  isModalOpen = false;
  selectedEvent: any = null;
  allDayEvents: AllDayEvent[] = [];

  calendarOptions: CalendarOptions = {
    locale: esLocale,
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, rrulePlugin, dayGridMonthPlugin],
    themeSystem: 'standard',
    height: '90vh',
    weekends: false,
    eventMinHeight: 50,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      if (info.event.id) {
        info.el.setAttribute('id', info.event.id);
        info.el.style.backgroundColor = info.event.extendedProps?.['backgroundColor'];
        info.el.style.borderColor = info.event.extendedProps?.['backgroundColor'];
      }
    }
  };

  constructor(private calendarService: CalendarService, private router: Router) {

    if (this.isMobile) {
      this.calendarOptions.initialView = 'timeGridDay';
      this.calendarOptions.headerToolbar = {
        left: 'prev,next',
        center: '',
        right: 'title'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: 'dayGridMonth,timeGridWeek,timeGridDay',
        right: ''
      };
    } else {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      };

      this.calendarOptions.footerToolbar = {
        left: '',
        center: '',
        right: ''
      };
    }

    // Call the function to get the entire calendar
    this.initializeCalendar();
    // this.getHolydayApi();
    // this.getEntireCalendar();

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
        center: 'dayGridMonth,timeGridWeek,timeGridDay',
        right: ''
      };
    } else {
      this.calendarOptions.headerToolbar = {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
      return `hsl(${hue}, 70%, 60%)`;
    }
    return `hsl(${hue}, 70%, 80%)`;
  }

  private getEventDays(spanishDay: string): string {
    switch (spanishDay) {
      case 'lunes':
        return 'mo';
      case 'martes':
        return 'tu';
      case 'miércoles':
        return 'we';
      case 'jueves':
        return 'th';
      case 'viernes':
        return 'fr';
      case 'sábado':
        return 'sa';
      case 'domingo':
        return 'su';
      default:
        return '';
    }
  }

  private initializeCalendar(): void {
    forkJoin({
      holidays: this.calendarService.getHolydayApi(),
      calendar: this.calendarService.getEntireCalendar()
    }).subscribe({
      next: ({ holidays, calendar }) => {
        if (holidays) {
          const filteredHolidays = holidays.filter(
            (holiday) => holiday.counties?.includes('ES-AN') || !holiday.counties
          );

          const holidayEvents = filteredHolidays.map((holiday) => {
            const dayOfWeek = this.getEventDays(
                new Date(holiday.date).toLocaleDateString('es-ES', { weekday: 'long' })
            );

            this.allDayEvents.push({
              date: holiday.date,
              day: dayOfWeek
            });

            const startTime = `${holiday.date}T00:00:00`;
            const endTime = `${holiday.date}T23:59:59`;
            const eventId = `event-${this.counter++}`;

            return {
              id: eventId,
              backgroundColor: 'rgb(228, 175, 174)',
              title: holiday.localName,
              allDay: true,
              start: startTime,
              end: endTime,
              classNames: ['holiday-event'],
              extendedProps: {
                description: holiday.localName,
                backgroundColor: 'rgb(184, 45, 42)',
                location: 'Andalucía',
                type: 'HOLIDAY',
                day: new Date(holiday.date).toLocaleDateString('es-ES', { weekday: 'long' })
              },

            };
          });

          this.calendarOptions.events = holidayEvents;
        }

        if (calendar) {
          const facultyEvents = calendar.facultyEvents.map((event) => {
            const startTime = `${event.date}T${event.initHour}`;
            const endTime = `${event.date}T${event.finishHour}`;
            const weekDay = this.getEventDays(event.day);
            const eventId = `event-${this.counter++}`;
            const allDay = event.initHour === event.finishHour && event.initHour === '00:00:00';

            if (allDay) {
              this.allDayEvents.push({
                date: event.date,
                day: weekDay
              });
            }

            const duration = (() => {
              const [sh, sm, ss] = event.initHour.split(':').map(Number);
              const [eh, em, es] = event.finishHour.split(':').map(Number);
              const start = sh * 3600 + sm * 60 + ss;
              const end = eh * 3600 + em * 60 + es;
              const diff = end - start;
              return diff > 0 ? { seconds: diff } : { hours: 1 };
            })();

            return {
              id: eventId,
              backgroundColor: 'rgb(228, 175, 174)',
              title: event.title + ' - ' + event.facultyName,
              allDay: allDay,
              start: startTime,
              end: endTime,
              classNames: ['faculty-event'],
              extendedProps: {
                backgroundColor: 'rgb(184, 45, 42)',
                description: event.title + '.',
                location: event.facultyName,
                start: event.initHour,
                end: event.finishHour,
                type: event.type,
                day: event.day
              },
              duration: duration
            };
          });

          const classEvents = calendar.classes.map((event) => {
            const startDateTime = `${event.initDate}T${event.initHour}`;
            const endDateTime = `${event.finishDate}T${event.finishHour}`;
            const backgroundColor = this.generateBackgroundColor(event.subject, false);
            const dotBackgroundColor = this.generateBackgroundColor(event.subject, true);
            const eventId = `event-${this.counter++}`;

            const datesToExclude = this.allDayEvents
              .filter((fac_ev) => fac_ev.day === this.getEventDays(event.day))
              .map((fac_ev) => fac_ev.date);

            const duration = (() => {
              const [sh, sm, ss] = event.initHour.split(':').map(Number);
              const [eh, em, es] = event.finishHour.split(':').map(Number);
              const start = sh * 3600 + sm * 60 + ss;
              const end = eh * 3600 + em * 60 + es;
              const diff = end - start;
              return diff > 0 ? { seconds: diff } : { hours: 1 };
            })();

            return {
              id: eventId,
              backgroundColor: dotBackgroundColor,
              title: 'Aula: ' + event.classroom + ' - ' + event.subject + ' - Grupo : ' + event.group,
              allDay: false,
              extendedProps: {
                backgroundColor: backgroundColor,
                description: 'Clase de la asignatura ' + event.subject + '.\nGrupo : ' + event.group + '.',
                location: 'Aula: ' + event.classroom,
                teachers: event.teachers,
                url: event.subjectUrl,
                start: event.initHour,
                end: event.finishHour,
                type: 'OFFICIAL',
                day: event.day
              },
              rrule: {
                freq: 'weekly',
                interval: 1,
                byweekday: [this.getEventDays(event.day)],
                dtstart: startDateTime,
                until: endDateTime
              },
              exdate: datesToExclude ? datesToExclude.map((date) => `${date}T${event.initHour}`) : [],
              duration: duration
            };
          });

          const groupEvents = calendar.groupEvents.map((event) => {
            const startTime = `${event.date}T${event.initHour}`;
            const endTime = `${event.date}T${event.finishHour}`;
            const backgroundColor = this.generateBackgroundColor(event.subjectName, false);
            const dotBackgroundColor = this.generateBackgroundColor(event.subjectName, true);
            const eventId = `event-${this.counter++}`;

            const duration = (() => {
              const [sh, sm, ss] = event.initHour.split(':').map(Number);
              const [eh, em, es] = event.finishHour.split(':').map(Number);
              const start = sh * 3600 + sm * 60 + ss;
              const end = eh * 3600 + em * 60 + es;
              const diff = end - start;
              return diff > 0 ? { seconds: diff } : { hours: 1 };
            })();

            return {
              id: eventId,
              backgroundColor: backgroundColor,
              title: 'Aula: ' + event.classroom + ' - ' + event.title + '.',
              allDay: false,
              start: startTime,
              end: endTime,
              extendedProps: {
                backgroundColor: dotBackgroundColor,
                description: 'Clase extra de la asignatura ' + event.subjectName + '.\nGrupo : ' + event.groupName + ': ' + event.title + '.',
                location: 'Aula: ' + event.classroom,
                teachers: event.teacher,
                start: event.initHour,
                end: event.finishHour,
                type: event.type,
                day: event.day
              },
              duration: duration
            };
          });

          this.calendarOptions.events = (this.calendarOptions.events as EventInput[]).concat(
            facultyEvents,
            classEvents,
            groupEvents
          );
        }
      },
      error: (error) => {
        console.error('Error fetching calendar data:', error.error.message);
      }
    });
  }


  handleEventClick(info: any) {
    this.selectedEvent = {
      title: info.event.title,
      description: info.event.extendedProps?.description,
      location: info.event.extendedProps?.location,
      teachers: info.event.extendedProps?.teachers,
      url: info.event.extendedProps?.url ? info.event.extendedProps?.url : '',
      initHour: info.event.extendedProps?.start,
      finishHour: info.event.extendedProps?.end,
      day: info.event.extendedProps?.day,
      allDay: info.event.allDay
    };
    this.isModalOpen = true;

  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

}
