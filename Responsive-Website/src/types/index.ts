export type PageType = 
  | "home" 
  | "about" 
  | "departments" 
  | "campus" 
  | "contact" 
  | "cse-dept" 
  | "cyber-dept" 
  | "ai-dept" 
  | "aiml-dept"
  | "student-login"
  | "faculty-login" 
  | "university-login"
  | "expert-login"
  | "admin-portal";

export interface ContentData {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroLabel: string;
  expertName: string;
  expertImage: string;
  newsItems: NewsItem[];
  whyUsFeatures: Feature[];
  departments: Department[];
  departmentData: { [key: string]: DepartmentData };
  managementTeam: ManagementMember[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  color: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  background: string;
}

export interface Department {
  icon: string;
  title: string;
  description: string;
  color: string;
  page: PageType;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translation {
  home: string;
  about: string;
  departments: string;
  campus: string;
  contact: string;
  login: string;
  universityName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  exploreCourses: string;
}

export interface DepartmentData {
  title: string;
  hodName: string;
  hodImage: string;
  faculty: FacultyMember[];
}

export interface FacultyMember {
  name: string;
  image: string;
  quote: string;
  qualification: string;
}

export interface ManagementMember {
  name: string;
  position: string;
  image: string;
  isPresident: boolean;
}

export interface CampusImage {
  title: string;
  image: string;
}