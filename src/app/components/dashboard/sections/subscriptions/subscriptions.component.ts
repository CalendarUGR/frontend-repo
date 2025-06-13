import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from "@angular/router"

import { Subscription, Fields, GradeFaculty, SubjectGrade, TeacherClasses } from "../../../../models/subscriptions.model"
import { SubscriptionService } from "../../../../services/subscription.service"
import { AuthService } from "../../../../services/auth.service"

@Component({
  selector: "app-subscriptions",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./subscriptions.component.html",
  styleUrls: ["./subscriptions.component.css"],
})
export class SubscriptionsComponent {

  fields: Fields = []

  subjectsByGrade: SubjectGrade = []

  subscriptions: Subscription[] = []

  teacherClasses: TeacherClasses[] = []

  // New subnscription parameters
  selectedGradeFaculty: GradeFaculty | null = null
  selectedSubject: string | null = null
  selectedGroup: string | null = null
  selectedTeacherClasses: TeacherClasses | null = null

  // Browser filters
  filterGrade = ""
  filterSubject = ""
  filterTeacher = ""

  // Show or hide dropdowns
  showFieldDropdown = false
  showSubjectDropdown = false

  // Helper to get object keys
  objectKeys = Object.keys

  isStudent = false
  showTeacherClassesModal = false;
  teacherInput$ = new Subject<string>();

  ngOnInit() {
    this.teacherInput$.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.subscriptionService.getTeacherClasses(value).subscribe({
        next: (teacherClasses) => {
          this.teacherClasses = teacherClasses || [];
        },
        error: (err) => {
          console.error("Error :", err.error.message || err);
          this.teacherClasses = [];
        },
      });
    });
  }

  constructor(private subscriptionService: SubscriptionService, private authService: AuthService, private router: Router) {
    // Fetch subscriptions from the service
    this.updateSubscriptions();

    // Fetch fields from the service
    this.updateFields();

    if (this.authService.isLoggedIn()) {
      this.isStudent = this.authService.getIsStudent();
    }
  }

  updateSubscriptions(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions || [];
      },
      error: (err) => {
        console.error("Error :", err.error.message || err);
        this.subscriptions = [];
      },
    });
  }

  updateFields(): void {
    this.subscriptionService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields || [];
      },
      error: (err) => {
        console.error("Error :", err.error.message || err);
        this.fields = [];
      },
    });
  }

  // Getting filtered grades by field
  get filteredFields(): Fields {
    if (!this.filterGrade) return this.fields;

    return this.fields
      .map((field) => {
        // Filter grades by faculty or grade name
        const filteredGrades = field.grades.filter(
          (grade) =>
            grade.grade.toLowerCase().includes(this.filterGrade.toLowerCase())
        );

        if (filteredGrades.length > 0) {
          return {
            ...field,
            grades: filteredGrades, // Solo los grados que coinciden
          };
        }

        return null; // If no coincidence, return null
      })
      .filter((field) => field !== null) as Fields; // Filter out null values
  }

  // Getting filtered subjects and groups
  get filteredSubjectsAndGroups(): { subject: string; group: string }[] {
    if (!this.selectedGradeFaculty) return [];

    const result: { subject: string; group: string }[] = [];
    const subjectGrade = this.subjectsByGrade;

    if (!subjectGrade) return [];

    subjectGrade.forEach((subjectGroup) => {
      if (!this.filterSubject || subjectGroup.subject.toLowerCase().includes(this.filterSubject.toLowerCase())) {
        if (subjectGroup.groups.length === 0) {
          // Si no hay grupos, agregar el subject con "Sin grupo"
          result.push({ subject: subjectGroup.subject, group: "Sin grupo" });
        } else {
          // Si hay grupos, agregarlos normalmente
          subjectGroup.groups.forEach((group) => {
            result.push({ subject: subjectGroup.subject, group });
          });
        }
      }
    });

    return result;
  }

  get filteredTeachers(): { teacherName: string; classes: Subscription[] }[] {
    if (!this.filterTeacher) return this.teacherClasses;

    return this.teacherClasses;
  }

  // Grouping subscriptions by faculty
  get groupedSubscriptions(): { [faculty: string]: { [grade: string]: { [subject: string]: string[] } } } {
    const grouped: { [faculty: string]: { [grade: string]: { [subject: string]: string[] } } } = {}

    this.subscriptions.forEach((sub) => {
      if (!grouped[sub.faculty]) {
        grouped[sub.faculty] = {}
      }
      if (!grouped[sub.faculty][sub.grade]) {
        grouped[sub.faculty][sub.grade] = {}
      }
      if (!grouped[sub.faculty][sub.grade][sub.subject]) {
        grouped[sub.faculty][sub.grade][sub.subject] = []
      }
      grouped[sub.faculty][sub.grade][sub.subject].push(sub.group)
    })

    return grouped
  }

  // Methods to handle dropdowns and selections
  toggleFieldDropdown(): void {
    this.showFieldDropdown = !this.showFieldDropdown
    if (this.showFieldDropdown) {
      this.showSubjectDropdown = false
    }
  }

  toggleSubjectDropdown(): void {
    this.showSubjectDropdown = !this.showSubjectDropdown
    if (this.showSubjectDropdown) {
      this.showFieldDropdown = false
    }
  }

  selectGradeFaculty(gradeFaculty: GradeFaculty): void {
    this.selectedGradeFaculty = gradeFaculty
    this.selectedSubject = null
    this.selectedGroup = null
    this.showFieldDropdown = false
    this.filterGrade = ""

    // Fill the subjects and groups based on the selected grade faculty
    this.subscriptionService.getSubjectsByGrade(gradeFaculty.grade).subscribe((subjectsByGrade) => {
      this.subjectsByGrade = subjectsByGrade;
    });
  }

  selectSubjectAndGroup(subject: string, group: string): void {
    this.selectedSubject = subject
    this.selectedGroup = group
    this.showSubjectDropdown = false
    this.filterSubject = ""
  }

  subscribe(): void {
    if (this.selectedGradeFaculty && this.selectedSubject && this.selectedGroup) {

      const newSubscription: Subscription = {
        faculty: this.selectedGradeFaculty.faculty,
        grade: this.selectedGradeFaculty.grade,
        subject: this.selectedSubject,
        group: this.selectedGroup,
      }

      this.subscriptionService.addSubscription(newSubscription).subscribe({
        next: () => {
          this.showNotification("Suscripción añadida correctamente ✅");
          this.updateSubscriptions();
          this.softResetForm();
        },
        error: (err) => {
          console.error("Error :", err.error.message || err);
          this.showNotification("La suscripción ya existe o no es válida ( Puede que no tengamos su horario 😔 ).");
        },
      });
    }
  }

  deleteSubscriptionByParams(faculty: string, grade: string, subject: string, group: string): void {
    const subscriptionToDelete: Subscription = {
      faculty,
      grade,
      subject,
      group,
    }

    this.subscriptionService.deleteSubscription(subscriptionToDelete).subscribe({
      next: () => {
        this.showNotification("Suscripción eliminada correctamente ✅");
        this.updateSubscriptions();
        this.softResetForm();
      },
      error: (err) => {
        console.error("Error :", err.error.message || err);
        this.showNotification("Error al eliminar la suscripción. ❌;")
      },
    })
  }

  resetForm(): void {
    this.selectedGradeFaculty = null
    this.selectedSubject = null
    this.selectedGroup = null
    this.filterGrade = ""
    this.filterSubject = ""
  }

  softResetForm(): void {
    this.selectedSubject = null
    this.selectedGroup = null
    this.filterSubject = ""
  }

  // Teacher classes related
  onTeacherInputChange(value: string) {
    this.teacherInput$.next(value);
  }

  selectTeacher(teacher: string) {
    this.selectedTeacherClasses = this.teacherClasses.find((t) => t.teacherName === teacher) || null
    this.showSubjectDropdown = false
    this.filterTeacher = ""
    this.showTeacherClassesModal = true
  }

  closeTeacherClassesModal() {
    this.showTeacherClassesModal = false;
  }

  confirmSubscribeToTeacherClasses() {
    this.showTeacherClassesModal = false;
    this.subscribeToTeacherClasses();
  }

  subscribeToTeacherClasses() {
    if (this.selectedTeacherClasses) {
      this.subscriptionService.subscribeBatching(this.selectedTeacherClasses.classes).subscribe({
        next: () => {
          this.showNotification("Suscripciones añadidas correctamente ✅");
          this.updateSubscriptions();
          this.softResetForm();
        }
        , error: (err) => {
          console.error("Error :", err.error.message || err);
          this.showNotification("Error al añadir las suscripciones. ❌");
        }
      })
    }
  }

  deleteSubscriptionFromTeacher(faculty: string, grade: string, subject: string, group: string) {
    // Remove the sub from the teacher's classes local selectedTeacherClasses
    if (this.selectedTeacherClasses) {
      this.selectedTeacherClasses.classes = this.selectedTeacherClasses.classes.filter((sub) => {
        return !(sub.faculty === faculty && sub.grade === grade && sub.subject === subject && sub.group === group) // Filter out the subscription to be deleted
      })
    }

  }

  // Notification system
  showToast = false
  toastMessage = ""

  showNotification(message: string): void {
    this.toastMessage = message
    this.showToast = true
    setTimeout(() => {
      this.showToast = false
    }, 3000)
  }
}
