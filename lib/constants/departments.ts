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
  'Computer Science and Engineering': {
    bg: 'bg-blue-500',
    border: 'border-blue-600', 
    text: 'text-white',
    hex: '#3B82F6'
  },
  'Cyber Security': {
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white', 
    hex: '#EF4444'
  },
  'Artificial Intelligence and Data Science': {
    bg: 'bg-green-500',
    border: 'border-green-600',
    text: 'text-white',
    hex: '#10B981'
  },
  'Artificial Intelligence and Machine Learning': {
    bg: 'bg-orange-500', 
    border: 'border-orange-600',
    text: 'text-white',
    hex: '#F59E0B'
  }
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
