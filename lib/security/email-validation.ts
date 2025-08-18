// Email domain validation for Sanjivani University (single domain only)
const ALLOWED_EMAIL_DOMAINS = ['@sanjivani.edu.in']

export const validateUniversityEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const emailLower = email.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.some(domain => emailLower.endsWith(domain))
}

export function getEmailType(email: string): 'student' | 'faculty' | 'admin' | 'invalid' {
  if (!validateUniversityEmail(email)) return 'invalid'
  const emailLower = email.toLowerCase()
  const local = emailLower.split('@')[0]
  // Student pattern examples:
  // - 2021cse001 (legacy pattern)
  // - firstname.lastname_24cse (new underscore pattern)
  if (/^\d{4}[a-z]+\d+$/i.test(local) || /_.+\d{2}[a-z]+$/i.test(local) || /_\d{2}[a-z]+$/i.test(local)) {
    return 'student'
  }
  // Default to faculty if in main domain but not matching student pattern
  return 'faculty'
}

export function extractStudentInfo(email: string): { prn?: string, department?: string, year?: string } | null {
  if (!validateUniversityEmail(email)) {
    return null
  }
  
  const emailPart = email.split('@')[0]

  const toYearLabel = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Year`
  const currentYear = new Date().getFullYear()

  const mapDept = (code: string): string | undefined => {
    const c = code.toLowerCase()
    if (['cse', 'cs', 'ce', 'uce'].includes(c)) return 'Computer Science and Engineering (CSE)'
    if (['cyber', 'cys', 'csec'].includes(c)) return 'Cyber Security'
    if (['aids', 'ai&ds', 'ds'].includes(c)) return 'Artificial Intelligence and Data Science (AIDS)'
    if (['aiml', 'ai&ml', 'ml'].includes(c)) return 'Artificial Intelligence and Machine Learning (AIML)'
    return undefined
  }

  // Pattern 1: legacy PRN style: 2021cse001
  const prnMatch = emailPart.match(/^(\d{4})([a-z]+)(\d+)$/i)
  if (prnMatch) {
    const [, y4, deptCode] = prnMatch
    const admissionYear = parseInt(y4, 10)
    let academicYear = currentYear - admissionYear + 1
    if (academicYear < 1) academicYear = 1
    if (academicYear > 4) academicYear = 4
    return {
      prn: emailPart.toUpperCase(),
      department: mapDept(deptCode),
      year: toYearLabel(academicYear),
    }
  }

  // Pattern 2: underscore style: name_24cse or firstname.lastname_24uce
  const usMatch = emailPart.match(/_(\d{2})([a-z]+)$/i)
  if (usMatch) {
    const [, y2, deptCode] = usMatch
    const admissionYear = 2000 + parseInt(y2, 10)
    let academicYear = currentYear - admissionYear + 1
    if (academicYear < 1) academicYear = 1
    if (academicYear > 4) academicYear = 4
    return {
      prn: emailPart.toUpperCase(),
      department: mapDept(deptCode),
      year: toYearLabel(academicYear),
    }
  }

  return null
}
