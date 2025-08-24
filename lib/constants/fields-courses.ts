// Field and Course definitions for comprehensive registration system

export const FIELDS = [
  'B.E/B.Tech',
  'Pharmacy', 
  'B.Sc',
  'M.Sc',
  'BCA',
  'MCA',
  'B.Com',
  'M.Com',
  'BBA',
  'MBA',
  'BCS',
  'MCS'
] as const;

export const COURSES_BY_FIELD = {
  'B.E/B.Tech': [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical Engineering (EE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Automobile Engineering',
    'Robotics & AI',
    'Data Science & AI',
    'Biotechnology'
  ],
  "Pharmacy": [
    "Bachelor of Pharmacy",
    "Diploma in Pharmacy"
  ],
  "B.Sc": [
    "Computer Science",
    "Information Technology",
    "Physics",
    "Chemistry", 
    "Mathematics",
    "Biology"
  ],
  "M.Sc": [
    "Computer Science",
    "Information Technology", 
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology"
  ],
  "BCA": [
    "Computer Applications",
    "Cyber Security",
    "Data Science"
  ],
  "MCA": [
    "Computer Applications", 
    "Cyber Security",
    "Data Science",
    "Software Engineering"
  ],
  "B.Com": [
    "General Commerce",
    "Banking and Finance",
    "Accounting and Finance"
  ],
  "M.Com": [
    "General Commerce",
    "Banking and Finance", 
    "Accounting and Finance"
  ],
  "BBA": [
    "General Management",
    "Marketing",
    "Finance",
    "Human Resources"
  ],
  "MBA": [
    "General Management",
    "Marketing",
    "Finance", 
    "Human Resources",
    "Operations",
    "Operations Management",
    "International Business",
    "Digital Marketing",
    "Data Analytics",
    "Healthcare Management",
    "Technology Management"
  ],
  'BCS': [
    'Computer Science',
    'Software Engineering',
    'Information Systems',
    'Cyber Security'
  ],
  'MCS': [
    'Research in AI',
    'ML',
    'Data Science',
    'Networks',
    'Security'
  ]
} as const;

// Department mappings based on course selection
export const COURSE_DEPARTMENT_MAPPING = {
  // CSE Department courses
  'Computer Science & Engineering (CSE)': 'Computer Science and Engineering',
  'Information Technology (IT)': 'Computer Science and Engineering',
  'Computer Applications': 'Computer Science and Engineering',
  'Computer Science': 'Computer Science and Engineering',
  'Software Engineering': 'Computer Science and Engineering',
  'Information Systems': 'Computer Science and Engineering',
  
  // Cyber Security Department
  'Cyber Security': 'Cyber Security',
  
  // AIDS Department courses
  'Data Science & AI': 'Artificial Intelligence and Data Science',
  'Data Science': 'Artificial Intelligence and Data Science',
  'Research in AI': 'Artificial Intelligence and Data Science',
  'ML': 'Artificial Intelligence and Data Science',
  'Data Analytics': 'Artificial Intelligence and Data Science',
  
  // AIML Department courses
  'Robotics & AI': 'Artificial Intelligence and Machine Learning',
  
  // Default to CSE for other courses
  'Electronics & Communication Engineering (ECE)': 'Computer Science and Engineering',
  'Electrical Engineering (EE)': 'Computer Science and Engineering',
  'Mechanical Engineering (ME)': 'Computer Science and Engineering',
  'Civil Engineering': 'Computer Science and Engineering',
  'Chemical Engineering': 'Computer Science and Engineering',
  'Aerospace Engineering': 'Computer Science and Engineering',
  'Automobile Engineering': 'Computer Science and Engineering',
  'Biotechnology': 'Computer Science and Engineering',
  'Bachelor of Pharmacy': 'Computer Science and Engineering',
  'Diploma in Pharmacy': 'Computer Science and Engineering',
  'Physics': 'Computer Science and Engineering',
  'Chemistry': 'Computer Science and Engineering',
  'Mathematics': 'Computer Science and Engineering',
  'Biology': 'Computer Science and Engineering',
  'General Commerce': 'Computer Science and Engineering',
  'Banking and Finance': 'Computer Science and Engineering',
  'Accounting and Finance': 'Computer Science and Engineering',
  'General Management': 'Computer Science and Engineering',
  'Marketing': 'Computer Science and Engineering',
  'Finance': 'Computer Science and Engineering',
  'Human Resources': 'Computer Science and Engineering',
  'Operations': 'Computer Science and Engineering',
  'Operations Management': 'Computer Science and Engineering',
  'International Business': 'Computer Science and Engineering',
  'Digital Marketing': 'Computer Science and Engineering',
  'Healthcare Management': 'Computer Science and Engineering',
  'Technology Management': 'Computer Science and Engineering',
  'Networks': 'Computer Science and Engineering',
  'Security': 'Computer Science and Engineering'
} as const;

// Helper function to get department based on course
export const getDepartmentByCourse = (course: string): string => {
  return COURSE_DEPARTMENT_MAPPING[course as keyof typeof COURSE_DEPARTMENT_MAPPING] || 'Computer Science and Engineering';
};

// Helper function to get courses for a specific field
export const getCoursesByField = (field: Field): readonly string[] => {
  return COURSES_BY_FIELD[field] || [];
};

// Helper function to search courses
export const searchCourses = (field: Field, searchTerm: string): string[] => {
  if (!searchTerm) return [...getCoursesByField(field)];
  
  const courses = getCoursesByField(field);
  return courses.filter(course => 
    course.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Type definitions
export type Field = typeof FIELDS[number];
export type Course = typeof COURSES_BY_FIELD[keyof typeof COURSES_BY_FIELD][number];

// Field colors for UI
export const FIELD_COLORS = {
  'B.E/B.Tech': { bg: 'bg-blue-500', text: 'text-white', hex: '#3B82F6' },
  'Pharmacy': { bg: 'bg-green-500', text: 'text-white', hex: '#10B981' },
  'B.Sc': { bg: 'bg-purple-500', text: 'text-white', hex: '#8B5CF6' },
  'M.Sc': { bg: 'bg-indigo-500', text: 'text-white', hex: '#6366F1' },
  'BCA': { bg: 'bg-orange-500', text: 'text-white', hex: '#F59E0B' },
  'MCA': { bg: 'bg-red-500', text: 'text-white', hex: '#EF4444' },
  'B.Com': { bg: 'bg-yellow-500', text: 'text-black', hex: '#EAB308' },
  'M.Com': { bg: 'bg-amber-500', text: 'text-white', hex: '#F59E0B' },
  'BBA': { bg: 'bg-teal-500', text: 'text-white', hex: '#14B8A6' },
  'MBA': { bg: 'bg-cyan-500', text: 'text-white', hex: '#06B6D4' },
  'BCS': { bg: 'bg-pink-500', text: 'text-white', hex: '#EC4899' },
  'MCS': { bg: 'bg-rose-500', text: 'text-white', hex: '#F43F5E' }
} as const;
