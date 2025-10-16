/**
 * Department-based Security and Access Control
 * 
 * Hierarchy:
 * - CSE faculty: Can access only CSE students (all years)
 * - Cyber Security faculty: Can access CSE, AIDS, AIML students (all years)
 * - AIDS faculty: Can access only AIDS students (all years)
 * - AIML faculty: Can access only AIML students (all years)
 */

export const DEPARTMENTS = {
  CSE: 'CSE',
  CYBER_SECURITY: 'Cyber Security',
  AIDS: 'AIDS',
  AIML: 'AIML',
  MECHANICAL: 'Mechanical',
  CIVIL: 'Civil',
  ELECTRICAL: 'Electrical',
} as const;

export const YEARS = {
  FE: 'FE',
  SE: 'SE',
  TE: 'TE',
  BE: 'BE',
} as const;

export type Department = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];
export type Year = typeof YEARS[keyof typeof YEARS];

/**
 * Get accessible departments for a faculty member
 */
export function getAccessibleDepartments(facultyDepartment: string): string[] {
  switch (facultyDepartment) {
    case DEPARTMENTS.CSE:
      return [DEPARTMENTS.CSE];
    
    case DEPARTMENTS.CYBER_SECURITY:
      return [DEPARTMENTS.CSE, DEPARTMENTS.AIDS, DEPARTMENTS.AIML];
    
    case DEPARTMENTS.AIDS:
      return [DEPARTMENTS.AIDS];
    
    case DEPARTMENTS.AIML:
      return [DEPARTMENTS.AIML];
    
    case DEPARTMENTS.MECHANICAL:
      return [DEPARTMENTS.MECHANICAL];
    
    case DEPARTMENTS.CIVIL:
      return [DEPARTMENTS.CIVIL];
    
    case DEPARTMENTS.ELECTRICAL:
      return [DEPARTMENTS.ELECTRICAL];
    
    default:
      return [facultyDepartment];
  }
}

/**
 * Check if faculty can access a specific department
 */
export function canAccessDepartment(
  facultyDepartment: string,
  targetDepartment: string
): boolean {
  const accessibleDepts = getAccessibleDepartments(facultyDepartment);
  return accessibleDepts.includes(targetDepartment);
}

/**
 * Check if faculty can modify content for a department
 */
export function canModifyDepartment(
  facultyDepartment: string,
  targetDepartment: string
): boolean {
  // Cyber Security can modify CSE, AIDS, AIML
  if (facultyDepartment === DEPARTMENTS.CYBER_SECURITY) {
    return [DEPARTMENTS.CSE, DEPARTMENTS.AIDS, DEPARTMENTS.AIML].includes(targetDepartment);
  }
  
  // Others can only modify their own department
  return facultyDepartment === targetDepartment;
}

/**
 * Get all years
 */
export function getAllYears(): string[] {
  return Object.values(YEARS);
}

/**
 * Validate department and year combination
 */
export function isValidDepartmentYear(department: string, year: string): boolean {
  const validDepartments = Object.values(DEPARTMENTS);
  const validYears = Object.values(YEARS);
  
  return validDepartments.includes(department as Department) && 
         validYears.includes(year as Year);
}

