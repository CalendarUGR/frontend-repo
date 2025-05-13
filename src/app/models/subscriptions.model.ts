// Faculty and Grade related

export interface GradeFaculty {
  faculty: string;
  grade: string;
}

export interface FieldGrade {
  field: string;
  grades: GradeFaculty[];
}

export interface Fields extends Array<FieldGrade> {}

// Sbject and Group related

export interface SubjectGroups {
  subject: string;
  groups: string[];
}

export interface SubjectGrade extends Array<SubjectGroups> {}

// Suscriptions related
export interface Subscription {
  faculty: string;
  grade: string;
  subject: string;
  group: string;
}
