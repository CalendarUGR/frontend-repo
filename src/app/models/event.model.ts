export interface Event {
  eventId: number
  classroom: string
  day: string
  date: string
  initHour: string
  finishHour: string
  groupName: string
  subjectName: string
  teacher: string
  gradeName: string
  facultyName: string
  title: string
}

export interface FacultyEvent {
  eventId: number
  facultyName: string
  day : string
  date : string
  initHour : string
  finishHour : string
  title : string
}

export interface FacultyGroupEvent {
  groupEvents : Event[]
  facultyEvents : FacultyEvent[]
}

export interface Faculty {
  name: string
  grades: Grade[]
}

export interface Grade {
  name: string
  subjects: Subject[]
}

export interface Subject {
  name: string
  groups: string[]
}
