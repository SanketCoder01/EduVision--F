import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

// Debug endpoint to check assignments in database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    
    console.log('DEBUG ENDPOINT: Checking assignments for dept:', department, 'year:', year)
    
    // Get ALL assignments
    const { data: allAssignments, error: allError } = await supabaseAdmin
      .from('assignments')
      .select('id, title, department, target_years, status, faculty_id, created_at')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('Error fetching all assignments:', allError)
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }
    
    // Get published assignments only
    const { data: publishedAssignments, error: pubError } = await supabaseAdmin
      .from('assignments')
      .select('id, title, department, target_years, status, faculty_id, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (pubError) {
      console.error('Error fetching published assignments:', pubError)
    }
    
    // Filter for specific department/year if provided
    let filteredAssignments: any[] = []
    if (department && year) {
      const normalizedDept = department.toLowerCase().trim()
      const yearMapping: { [key: string]: string[] } = {
        '1': ['1', 'first', 'First', '1st'],
        '2': ['2', 'second', 'Second', '2nd'], 
        '3': ['3', 'third', 'Third', '3rd'],
        '4': ['4', 'fourth', 'Fourth', '4th'],
        '1st': ['1', 'first', 'First', '1st'],
        '2nd': ['2', 'second', 'Second', '2nd'],
        '3rd': ['3', 'third', 'Third', '3rd'],
        '4th': ['4', 'fourth', 'Fourth', '4th'],
        'first': ['1', 'first', 'First', '1st'],
        'second': ['2', 'second', 'Second', '2nd'],
        'third': ['3', 'third', 'Third', '3rd'],
        'fourth': ['4', 'fourth', 'Fourth', '4th']
      }
      const possibleYearValues = yearMapping[year.toLowerCase()] || [year]
      
      filteredAssignments = (publishedAssignments || []).filter(a => {
        const assignmentDept = (a.department || '').toLowerCase().trim()
        const isDeptMatch = !a.department || 
                           a.department === 'all' || 
                           assignmentDept === normalizedDept ||
                           assignmentDept === department.toUpperCase()
        
        const isYearMatch = !a.target_years || 
                           a.target_years.length === 0 || 
                           a.target_years.some((y: string) => 
                             possibleYearValues.includes(y.toLowerCase()) || 
                             y.toLowerCase() === 'all'
                           )
        
        return isDeptMatch && isYearMatch
      })
    }
    
    // Get faculty info for assignments
    const facultyIds = [...new Set((allAssignments || []).map(a => a.faculty_id).filter(Boolean))]
    const { data: facultyData } = await supabaseAdmin
      .from('faculty')
      .select('id, name, email, department')
      .in('id', facultyIds)
    
    const facultyMap = (facultyData || []).reduce((acc, f) => {
      acc[f.id] = f
      return acc
    }, {} as Record<string, any>)
    
    // Enrich assignments with faculty info
    const enrichAssignment = (a: any) => ({
      ...a,
      faculty_name: facultyMap[a.faculty_id]?.name || 'Unknown',
      faculty_dept: facultyMap[a.faculty_id]?.department || 'Unknown'
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        requestedDepartment: department,
        requestedYear: year,
        normalizedDept: department ? department.toLowerCase().trim() : null,
        totalAssignments: allAssignments?.length || 0,
        publishedAssignments: publishedAssignments?.length || 0,
        filteredAssignments: filteredAssignments.length
      },
      allAssignments: (allAssignments || []).map(enrichAssignment),
      publishedAssignments: (publishedAssignments || []).map(enrichAssignment),
      filteredAssignments: filteredAssignments.map(enrichAssignment),
      facultyLookup: facultyMap
    })
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
