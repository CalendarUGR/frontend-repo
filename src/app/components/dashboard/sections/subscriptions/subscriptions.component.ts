import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Subscription, Fields, GradeFaculty, SubjectGrade } from "../../../../models/subscriptions.model"
import { SubscriptionService } from "../../../../services/subscription.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-subscriptions",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./subscriptions.component.html",
  styleUrls: ["./subscriptions.component.css"],
})
export class SubscriptionsComponent {
  // Datos de ejemplo usando las interfaces especificadas
  fields: Fields = []

  // Asignaturas y grupos por grado
  subjectsByGrade: SubjectGrade = []

  // Suscripciones actuales
  subscriptions: Subscription[] = []

  // New subnscription parameters
  selectedGradeFaculty: GradeFaculty | null = null
  selectedSubject: string | null = null
  selectedGroup: string | null = null

  // Browser filters
  filterGrade = ""
  filterSubject = ""

  // Show or hide dropdowns
  showFieldDropdown = false
  showSubjectDropdown = false

  // Helper to get object keys
  objectKeys = Object.keys

  constructor(private subscriptionService: SubscriptionService, private router: Router) {
    // Fetch subscriptions from the service
    this.updateSubscriptions();

    // Fetch fields from the service
    this.updateFields();
  }

  updateSubscriptions(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions || [];
      },
      error: (err) => {
        console.error("Error al obtener las suscripciones:", err);
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
        console.error("Error al obtener los campos:", err);
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
        console.error("Error al eliminar la suscripción:", err);
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
