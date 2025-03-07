export interface ResumeData {
  basics: Basics;
  work: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications?: Certification[];
  volunteering?: Volunteering[];
}

export interface Basics {
  name: string;
  label: string;
  image?: string;
  email: string;
  phone?: string;
  url?: string;
  summary: string;
  location?: Location;
  profiles: Profile[];
}

export interface Location {
  address?: string;
  postalCode?: string;
  city: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network: string;
  username: string;
  url: string;
  icon?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  website?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  courses?: string[];
}

export interface Skill {
  name: string;
  level?: string;
  keywords: string[];
}

export interface Project {
  name: string;
  description: string;
  highlights: string[];
  keywords: string[];
  url?: string;
  github?: string;
  image?: string;
}

export interface Certification {
  name: string;
  date: string;
  issuer: string;
  url?: string;
}

export interface Volunteering {
  organization: string;
  position: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
} 