/**
 * EduVision Supabase Utilities
 * Shared helpers for auth, student/faculty lookups, and realtime dept+year filtering
 */
import { supabase } from './supabase'

const DEPTS = ['cse', 'cyber', 'aids', 'aiml']
const YEARS = ['1st', '2nd', '3rd', '4th']

export function normalizeDept(dept: string): string {
  const d = dept?.toLowerCase().trim() || ''
  if (d === 'cse' || d.includes('computer science') || d.includes('cs&e') || (d.startsWith('cs') && d.length <= 4)) return 'cse'
  if (d === 'aiml' || d.includes('machine learning') || d.includes('ai & ml') || d.includes('ai ml')) return 'aiml'
  if (d === 'aids' || d.includes('data science') || d.includes('ai & data') || d.includes('ai ds')) return 'aids'
  if (d === 'cyber' || d.includes('cybersecurity') || d.includes('cyber security') || d.includes('security')) return 'cyber'
  return d || 'cse'
}

export function normalizeYear(y: string): string {
  if (!y) return '1st'
  const lower = y.toLowerCase()
  if (lower.includes('1') || lower.includes('first')) return '1st'
  if (lower.includes('2') || lower.includes('second')) return '2nd'
  if (lower.includes('3') || lower.includes('third')) return '3rd'
  if (lower.includes('4') || lower.includes('fourth')) return '4th'
  return y
}

export function getShardedTableName(dept: string, year: string): string {
  const d = normalizeDept(dept)
  const y = normalizeYear(year).replace(/[^1-4]/g, '')
  const yrStr = y === '1' ? '1st' : y === '2' ? '2nd' : y === '3' ? '3rd' : '4th'
  return `students_${d}_${yrStr}_year`
}

/** Get the currently logged-in faculty. Returns null if not faculty. */
export async function getCurrentFaculty() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: byId } = await supabase.from('faculty').select('*').eq('id', user.id).maybeSingle()
  if (byId) return byId

  const { data: byEmail } = await supabase.from('faculty').select('*').eq('email', user.email).maybeSingle()
  return byEmail
}

/** Get the currently logged-in student by scanning sharded tables. */
export async function getCurrentStudent() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  for (const dept of DEPTS) {
    for (const yr of YEARS) {
      const tbl = `students_${dept}_${yr}_year`
      const { data } = await supabase.from(tbl as any).select('*').eq('id', user.id).maybeSingle()
      if (data) return { ...data, email: user.email, department: dept, year: yr }
    }
  }

  // Fallback by email
  for (const dept of DEPTS) {
    for (const yr of YEARS) {
      const tbl = `students_${dept}_${yr}_year`
      const { data } = await supabase.from(tbl as any).select('*').eq('email', user.email).maybeSingle()
      if (data) return { ...data, email: user.email, department: dept, year: yr }
    }
  }

  // Last resort: use metadata
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name,
    department: user.user_metadata?.department || 'cse',
    year: user.user_metadata?.year || '1st'
  }
}

/** Fetch students for a specific dept+year from sharded table */
export async function getStudentsForYear(dept: string, year: string) {
  const tbl = getShardedTableName(dept, year)
  const { data, error } = await supabase.from(tbl as any).select('id, name, email, department, year, prn, face_image')
  if (error) {
    console.warn(`getStudentsForYear(${tbl}): ${error.message}`)
    return []
  }
  return (data || []).map((s: any) => ({ ...s, year: normalizeYear(year) }))
}

/** Fetch ALL students across all 4 years for a dept */
export async function getAllStudentsForDept(dept: string) {
  const deptCode = normalizeDept(dept)
  const results = await Promise.all(YEARS.map(yr => getStudentsForYear(deptCode, yr)))
  return results.flat()
}

/** Create a Supabase realtime channel for student table changes */
export function subscribeToStudentTable(dept: string, year: string, callback: () => void) {
  const tbl = getShardedTableName(dept, year)
  return supabase.channel(`rt_${tbl}`).on(
    'postgres_changes', { event: '*', schema: 'public', table: tbl }, callback
  ).subscribe()
}
