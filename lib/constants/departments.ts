// Standardized department definitions for EduVision
export const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Cyber Security', 
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning'
] as const;

export const DEPARTMENT_CODES = {
  'Computer Science and Engineering': 'CSE',
  'Cyber Security': 'Cyber Security',
  'Artificial Intelligence and Data Science': 'AIDS', 
  'Artificial Intelligence and Machine Learning': 'AIML'
} as const;

export const YEARS = [
  '1st Year',
  '2nd Year', 
  '3rd Year',
  '4th Year'
] as const;

export const GENDERS = [
  'Boys',
  'Girls'
] as const;

// Color scheme for departments
export const DEPARTMENT_COLORS = {
  'Computer Science and Engineering': '#3B82F6', // Blue
  'Cyber Security': '#EF4444', // Red
  'Artificial Intelligence and Data Science': '#10B981', // Green
  'Artificial Intelligence and Machine Learning': '#F59E0B' // Orange
} as const;

// Venue configurations
export const VENUE_CONFIGS = {
  'seminar-hall': {
    name: 'Seminar Hall',
    totalSeats: 160,
    seatsPerRow: 10,
    rows: 16
  },
  'solar-shade': {
    name: 'Solar Shade',
    totalSeats: 250,
    seatsPerRow: 13,
    rows: 20
  }
} as const;

export type Department = typeof DEPARTMENTS[number];
export type DepartmentCode = typeof DEPARTMENT_CODES[keyof typeof DEPARTMENT_CODES];
export type Year = typeof YEARS[number];
export type Gender = typeof GENDERS[number];
export type VenueName = keyof typeof VENUE_CONFIGS;
