import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"

import { Faculty, Event, Grade, Subject, FacultyGroupEvent, FacultyEvent } from "../../../../models/event.model"
import { Subscription } from "../../../../models/subscriptions.model"
import { SubscriptionService } from "../../../../services/subscription.service"
import { AuthService } from '../../../../services/auth.service';
import { EventService } from "../../../../services/event.service"

@Component({
  selector: "app-events",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"],
})
export class EventsComponent {

  currentYear: number = new Date().getFullYear()

  isAdmin = false
  creatingFacultyEvent = false

  subscriptions: Subscription[] = []
  enrrollmentInfo: Faculty[] = []

  // This could be a FacultyGroupEvent, so ROLE_TEACHER always have an empty facultyEvents
  events: FacultyGroupEvent = {
    groupEvents: [],
    facultyEvents: [],
  }

  // New event object
  newEvent: Event = {
    eventId: 0,
    classroom: "",
    day: "",
    date: "",
    initHour: "",
    finishHour: "",
    groupName: "",
    subjectName: "",
    teacher: "",
    gradeName: "",
    facultyName: "",
    title: "",
  }

  weekDays: string[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

  // Dropdown selection variables for Event
  selectedFaculty: Faculty | null = null
  selectedGrade: Grade | null = null
  selectedSubject: Subject | null = null

  eventFilter = ""
  showEventsDropdown = false

  showFacultyDropdown = false
  showGradeDropdown = false
  showSubjectDropdown = false
  showGroupDropdown = false

  // Dropdown selection variables for Faculty Event
  allDay = false

  // Modal
  showDeleteModal: boolean = false;
  eventToDelete: number | null = null;
  typeEventToDelete: string = "";

  constructor(private subscriptionService: SubscriptionService, private authService: AuthService, private eventService: EventService, private router: Router) {

    this.setIsAdmin(this.authService.getRole());

    this.getSubscriptionsAndEnrrollment();
    this.getMyEvents();
  }

  setIsAdmin(role: string): void {
    this.isAdmin = role == "ROLE_ADMIN"
  }

  getSubscriptionsAndEnrrollment(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions || []
        this.subscriptionsToEnrrollmentInfo();
        //console.log("Suscripciones obtenidas:", this.subscriptions)
      },
      error: (err) => {
        console.error("Error al obtener las suscripciones:", err)
        this.subscriptions = []
      },
    })
  }

  subscriptionsToEnrrollmentInfo(): void {
    const enrollmentInfo: Faculty[] = [];

    this.subscriptions.forEach((subscription) => {
      const { faculty, grade, subject, group } = subscription;

      let facultyEntry = enrollmentInfo.find((f) => f.name === faculty);
      if (!facultyEntry) {
        facultyEntry = { name: faculty, grades: [] };
        enrollmentInfo.push(facultyEntry);
      }

      let gradeEntry = facultyEntry.grades.find((g) => g.name === grade);
      if (!gradeEntry) {
        gradeEntry = { name: grade, subjects: [] };
        facultyEntry.grades.push(gradeEntry);
      }

      let subjectEntry = gradeEntry.subjects.find((s) => s.name === subject);
      if (!subjectEntry) {
        subjectEntry = { name: subject, groups: [] };
        gradeEntry.subjects.push(subjectEntry);
      }

      if (!subjectEntry.groups.includes(group)) {
        subjectEntry.groups.push(group);
      }
    });

    //console.log("Información de matrícula:", enrollmentInfo);
    this.enrrollmentInfo = enrollmentInfo;
  }

  getMyEvents(): void {

    if (!this.isAdmin) {
      this.eventService.getMyGroupEvents().subscribe({
        next: (events) => {
          this.events.groupEvents = events || []
          //console.log("Eventos obtenidos:", this.events)
        },
        error: (err) => {
          console.error("Error al obtener los eventos:", err)
          this.events.groupEvents = []
        },
      })
    } else {
      this.eventService.getMyFacultyEvents().subscribe({
        next: (events) => {
          this.events = events
          //console.log("Eventos obtenidos:", this.events)
        },
        error: (err) => {
          console.error("Error al obtener los eventos:", err)
          this.events = {
            groupEvents: [],
            facultyEvents: [],
          }
        },
      })
    }

  }

  get filteredGroupEvents(): Event[] {
    const currentYear = new Date().getFullYear(); // Obtener el año actual

    if (!this.eventFilter) {
      // Si no hay filtro, devolver todos los eventos de grupo del año actual
      return this.events.groupEvents.filter((event) => {
        const eventYear = new Date(event.date).getFullYear();
        return eventYear === currentYear;
      });
    }

    // Filtrar los eventos de grupo
    return this.events.groupEvents.filter((event) => {
      const eventYear = new Date(event.date).getFullYear();
      return (
        eventYear === currentYear && // Verificar que el evento sea del año actual
        (event.title.toLowerCase().includes(this.eventFilter.toLowerCase()) ||
          event.date.includes(this.eventFilter) ||
          event.subjectName.toLowerCase().includes(this.eventFilter.toLowerCase()))
      );
    });
  }

  get filteredFacultyEvents(): FacultyEvent[] {
    const currentYear = new Date().getFullYear(); // Obtener el año actual

    if (!this.eventFilter) {
      // Si no hay filtro, devolver todos los eventos de facultad del año actual
      return this.events.facultyEvents.filter((event) => {
        const eventYear = new Date(event.date).getFullYear();
        return eventYear === currentYear;
      });
    }

    // Filtrar los eventos de facultad
    return this.events.facultyEvents.filter((event) => {
      const eventYear = new Date(event.date).getFullYear();
      return (
        eventYear === currentYear && // Verificar que el evento sea del año actual
        (event.title.toLowerCase().includes(this.eventFilter.toLowerCase()) ||
          event.date.includes(this.eventFilter))
      );
    });
  }

  // Formatear date to dd/mm/yyyy
  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  formatTime(timeStr: string): string {
    // Convert format HH:mm:ss to HH:mm
    return timeStr.substring(0, 5)
  }

  toggleEventType(): void {
    this.creatingFacultyEvent = !this.creatingFacultyEvent
    this.resetForm()
  }

  // Dropdown toggle functions
  toggleEventsDropdown(): void {
    this.showEventsDropdown = !this.showEventsDropdown
  }

  toggleFacultyDropdown(): void {
    this.showFacultyDropdown = !this.showFacultyDropdown
    if (this.showFacultyDropdown) {
      this.showGradeDropdown = false
      this.showSubjectDropdown = false
      this.showGroupDropdown = false
    }
  }

  toggleGradeDropdown(): void {
    if (!this.selectedFaculty) return
    this.showGradeDropdown = !this.showGradeDropdown
    if (this.showGradeDropdown) {
      this.showFacultyDropdown = false
      this.showSubjectDropdown = false
      this.showGroupDropdown = false
    }
  }

  toggleSubjectDropdown(): void {
    if (!this.selectedGrade) return
    this.showSubjectDropdown = !this.showSubjectDropdown
    if (this.showSubjectDropdown) {
      this.showFacultyDropdown = false
      this.showGradeDropdown = false
      this.showGroupDropdown = false
    }
  }

  toggleGroupDropdown(): void {
    if (!this.selectedSubject) return
    this.showGroupDropdown = !this.showGroupDropdown
    if (this.showGroupDropdown) {
      this.showFacultyDropdown = false
      this.showGradeDropdown = false
      this.showSubjectDropdown = false
    }
  }

  // Selecting options from dropdowns
  selectFaculty(faculty: Faculty): void {
    this.selectedFaculty = faculty
    this.newEvent.facultyName = faculty.name
    this.selectedGrade = null
    this.selectedSubject = null
    this.newEvent.gradeName = ""
    this.newEvent.subjectName = ""
    this.newEvent.groupName = ""
    this.showFacultyDropdown = false
  }

  selectGrade(grade: Grade): void {
    this.selectedGrade = grade
    this.newEvent.gradeName = grade.name
    this.selectedSubject = null
    this.newEvent.subjectName = ""
    this.newEvent.groupName = ""
    this.showGradeDropdown = false
  }

  selectSubject(subject: Subject): void {
    this.selectedSubject = subject
    this.newEvent.subjectName = subject.name
    this.newEvent.groupName = ""
    this.showSubjectDropdown = false
  }

  selectGroup(group: string): void {
    this.newEvent.groupName = group
    this.showGroupDropdown = false
  }

  createEvent(): void {
    if (this.creatingFacultyEvent) {

      if (this.allDay) {
        this.newEvent.initHour = "00:00:00"
        this.newEvent.finishHour = "00:00:00"
      }

      if (this.validateFormFacultyEvent()) {
        // Create event through service
        this.eventService.createFacultyEvent(this.newEvent).subscribe({
          next: (response) => {
            //console.log("Evento creado:", response)
            this.getMyEvents();
          },
          error: (err) => {
            console.error("Error al crear el evento:", err)
            this.showNotification("Error al crear el evento ❌", true)
          },
        })
        this.showNotification("Evento creado correctamente ✅")
        this.resetForm()
      } else {
        this.showNotification("Por favor, completa todos los campos ❌", true)
      }
    }else{

      if (this.validateFormGroupEvent()) {
        // Create event through service
        this.eventService.createGroupEvent(this.newEvent).subscribe({
          next: (response) => {
            //console.log("Evento creado:", response)
            this.getMyEvents();
          },
          error: (err) => {
            console.error("Error al crear el evento:", err)
            this.showNotification("Error al crear el evento ❌", true)
          },
        })
        this.showNotification("Evento creado correctamente ✅")
        this.resetForm()
      } else {
        this.showNotification("Por favor, completa todos los campos ❌", true)
      }

    }
  }

  validateFormGroupEvent(): boolean {
    return (
      !!this.newEvent.title &&
      !!this.newEvent.date &&
      !!this.newEvent.initHour &&
      !!this.newEvent.finishHour &&
      !!this.newEvent.facultyName &&
      !!this.newEvent.gradeName &&
      !!this.newEvent.subjectName &&
      !!this.newEvent.groupName
    )
  }

  validateFormFacultyEvent(): boolean {
    if (this.allDay) {
      return (
        !!this.newEvent.title &&
        !!this.newEvent.date &&
        !!this.newEvent.facultyName
      )
    } else {
      return (
        !!this.newEvent.title &&
        !!this.newEvent.date &&
        !!this.newEvent.initHour &&
        !!this.newEvent.finishHour &&
        !!this.newEvent.facultyName
      )
    }
  }

  deleteEvent(id: string): void {
    // const index = this.events.findIndex((e) => e.eventId === id)
    // if (index !== -1) {
    //   this.events.splice(index, 1)
    //   this.showNotification("Evento eliminado correctamente")
    // }
  }

  resetForm(): void {

    this.newEvent = {
      eventId: 0,
      classroom: "",
      day: "",
      date: "",
      initHour: "",
      finishHour: "",
      groupName: "",
      subjectName: "",
      teacher: "",
      gradeName: "",
      facultyName: "",
      title: "",
    }
    this.selectedFaculty = null
    this.selectedGrade = null
    this.selectedSubject = null
    this.allDay = false
  }

  // Modal
  openDeleteModal(eventId: number, type: string): void {
    this.eventToDelete = eventId;
    this.typeEventToDelete = type;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.typeEventToDelete = "";
    this.eventToDelete = null;
  }

  confirmDeleteEvent(): void {
    if (this.eventToDelete !== null) {
      if (this.typeEventToDelete == "GROUP") {
        this.eventService.deleteGroupEvent(this.eventToDelete).subscribe({
          next: (response) => {
            //console.log("Evento eliminado:", response)
            this.showNotification("Evento eliminado correctamente ✅")
            this.getMyEvents();

          },
          error: (err) => {
            console.error("Error al eliminar el evento:", err)
            this.showNotification("Error al eliminar el evento ❌", true)
          },
        })
        this.closeDeleteModal();
      }else {
        this.eventService.deleteFacultyEvent(this.eventToDelete).subscribe({
          next: (response) => {
            //console.log("Evento eliminado:", response)
            this.showNotification("Evento eliminado correctamente ✅")
            this.getMyEvents();
          },
          error: (err) => {
            console.error("Error al eliminar el evento:", err)
            this.showNotification("Error al eliminar el evento ❌", true)
          },
        })
        this.closeDeleteModal();
      }
    }else{
      this.closeDeleteModal();
      this.showNotification("Error al eliminar el evento ❌", true)
    }
  }

  confirmDeleteFacultyEvent(): void {
    if (this.eventToDelete !== null) {
      this.eventService.deleteFacultyEvent(this.eventToDelete).subscribe({
        next: (response) => {
          //console.log("Evento eliminado:", response)
          this.showNotification("Evento eliminado correctamente ✅")
          this.getMyEvents();
        },
        error: (err) => {
          console.error("Error al eliminar el evento:", err)
          this.showNotification("Error al eliminar el evento ❌", true)
        },
      })
      this.closeDeleteModal();

    }else{
      this.showNotification("Error al eliminar el evento ❌", true)
    }
  }

  // Notifications
  showToast = false
  toastMessage = ""
  isError = false

  showNotification(message: string, error = false): void {
    this.toastMessage = message
    this.isError = error
    this.showToast = true
    setTimeout(() => {
      this.showToast = false
    }, 3000)
  }

  updateDayOfWeek(): void {
    if (this.newEvent.date) {
      const date = new Date(this.newEvent.date)
      const dayIndex = date.getDay()
      // In JavaScript, getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
      // Adjusting to match the weekDays array
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
      this.newEvent.day = this.weekDays[adjustedIndex]
    }
  }
}
