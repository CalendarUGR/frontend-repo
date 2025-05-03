export interface Class {
  classroom: string;
  day: string;
  initDate: string;
  finishDate: string;
  initHour: string;
  finishHour: string;
  group: string;
  subject: string;
  teachers: string;
  grade: string;
  subjectUrl: string;
}

export interface ExtraClass {
  id_user: string;
  facultyName: string;
  gradeName: string;
  subjectName: string;
  groupName: string;
  day: string;
  date: string;
  initHour: string;
  finishHour: string;
  teacher: string;
  classroom: string;
  title: string;
  type: string;
}

export interface CalendarResponse {
  groupEvents: ExtraClass[];
  facultyEvents: ExtraClass[];
  classes: Class[];
}
