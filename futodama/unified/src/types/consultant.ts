// Consultant Types

export type EmploymentType = "employee" | "freelance";
export type AvailabilityStatus = "available" | "partially_available" | "unavailable";
export type SkillLevel = "experienced" | "very_experienced" | "expert";
export type LanguageLevel = "basic" | "conversational" | "fluent" | "native";

export interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  photo: string;
  employmentType: EmploymentType;
  availability: {
    status: AvailabilityStatus;
    date?: string;
  };
  hourlyRate: number;
  location: string;
  cv: ConsultantCV;
  cvHealthScore: number;
  lastCVUpdate: string;
}

// Named ConsultantCV to avoid conflict with CV analysis type
export interface ConsultantCV {
  professionalProfile: string;
  personalProfile: string;
  experience: Experience[];
  education: Education[];
  courses: Course[];
  skills: Skill[];
  languages: Language[];
}

export interface Experience {
  id: string;
  company: string;
  project: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  year: number;
  certificate?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
}

export interface Language {
  id: string;
  language: string;
  level: LanguageLevel;
}

// CV Health Types (for display, not analysis)
export interface CVHealthCheck {
  score: number;
  strengths: string[];
  improvements: CVImprovement[];
}

export interface CVImprovement {
  id: string;
  section: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  explanation: string;
}
