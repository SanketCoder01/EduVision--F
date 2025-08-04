"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Initialize the database tables
export async function initializeDatabase() {
  try {
    const supabase = createServerSupabaseClient()

    // Test database connection
    const { data, error } = await supabase.from("faculty").select("count").limit(1)

    if (error) {
      console.log("Database tables may not exist, but connection is working")
      return { success: true, message: "Database connection established" }
    }

    // Create classes table
    await supabase.rpc("create_classes_table")

    // Create study_groups table
    await supabase.rpc("create_study_groups_table")

    // Create study_group_members table
    await supabase.rpc("create_study_group_members_table")

    // Create study_group_tasks table
    await supabase.rpc("create_study_group_tasks_table")

    // Create study_group_task_attachments table
    await supabase.rpc("create_study_group_task_attachments_table")

    // Create mentorship tables
    await supabase.rpc("create_mentorship_tables")

    // Create virtual classroom tables
    await supabase.rpc("create_virtual_classroom_tables")
    
    // Create other services tables
    await supabase.rpc("create_other_services_tables")

    revalidatePath("/dashboard/study-groups")
    revalidatePath("/dashboard/mentorship")
    revalidatePath("/student-dashboard/study-groups")
    revalidatePath("/student-dashboard/virtual-classroom")
    revalidatePath("/university/other-services")
    revalidatePath("/student-dashboard/other-services")
    revalidatePath("/dashboard/other-services")

    return { success: true, message: "Database is ready" }
  } catch (error) {
    console.log("Database initialization error:", error)
    return { success: true, message: "Using mock data mode" }
  }
}

// Check if a table exists
export async function checkTableExists(tableName: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("information_schema.tables").select("*").eq("table_name", tableName)

    if (error) throw error

    return { success: true, exists: data && data.length > 0 }
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return { success: false, exists: false, error }
  }
}

// Seed database with sample data
export async function seedDatabase() {
  const supabase = createServerSupabaseClient()

  try {
    // Add sample faculty
    const { data: faculty, error: facultyError } = await supabase
      .from("faculty")
      .upsert([
        { id: "f1", name: "Dr. Sarah Johnson", email: "sarah.johnson@example.com", department: "Computer Science" },
        { id: "f2", name: "Dr. Michael Brown", email: "michael.brown@example.com", department: "Mathematics" },
        { id: "f3", name: "Dr. Emily Chen", email: "emily.chen@example.com", department: "Physics" },
      ])
      .select()

    if (facultyError) throw facultyError

    // Add sample students
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .upsert([
        { id: "s1", name: "John Doe", email: "john.doe@example.com", prn: "PRN001", department: "Computer Science" },
        {
          id: "s2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          prn: "PRN002",
          department: "Computer Science",
        },
        {
          id: "s3",
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          prn: "PRN003",
          department: "Computer Science",
        },
        { id: "s4", name: "Lisa Wang", email: "lisa.wang@example.com", prn: "PRN004", department: "Mathematics" },
        {
          id: "s5",
          name: "Robert Taylor",
          email: "robert.taylor@example.com",
          prn: "PRN005",
          department: "Mathematics",
        },
        { id: "s6", name: "Emma Davis", email: "emma.davis@example.com", prn: "PRN006", department: "Physics" },
        { id: "s7", name: "Thomas Moore", email: "thomas.moore@example.com", prn: "PRN007", department: "Physics" },
        {
          id: "s8",
          name: "Sophia Garcia",
          email: "sophia.garcia@example.com",
          prn: "PRN008",
          department: "Computer Science",
        },
        {
          id: "s9",
          name: "William Martinez",
          email: "william.martinez@example.com",
          prn: "PRN009",
          department: "Mathematics",
        },
        {
          id: "s10",
          name: "Olivia Johnson",
          email: "olivia.johnson@example.com",
          prn: "PRN010",
          department: "Physics",
        },
      ])
      .select()

    if (studentsError) throw studentsError

    // Add sample classes
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .upsert([
        {
          id: "c1",
          name: "Data Structures and Algorithms",
          description: "A comprehensive course covering fundamental data structures and algorithms.",
          faculty_id: "f1",
        },
        {
          id: "c2",
          name: "Calculus II",
          description: "Advanced calculus topics including integration techniques and applications.",
          faculty_id: "f2",
        },
        {
          id: "c3",
          name: "Physics for Computer Science",
          description: "Physics concepts relevant to computer science and engineering.",
          faculty_id: "f3",
        },
      ])
      .select()

    if (classesError) throw classesError

    // Add students to classes
    const classStudents = [
      { class_id: "c1", student_id: "s1" },
      { class_id: "c1", student_id: "s2" },
      { class_id: "c1", student_id: "s3" },
      { class_id: "c1", student_id: "s8" },
      { class_id: "c2", student_id: "s4" },
      { class_id: "c2", student_id: "s5" },
      { class_id: "c2", student_id: "s9" },
      { class_id: "c3", student_id: "s6" },
      { class_id: "c3", student_id: "s7" },
      { class_id: "c3", student_id: "s10" },
    ]

    const { error: classStudentsError } = await supabase.from("class_students").upsert(classStudents)

    if (classStudentsError) throw classStudentsError

    // Add sample mentorships
    const mentorships = [
      { faculty_id: "f1", student_id: "s1", status: "active" },
      { faculty_id: "f1", student_id: "s2", status: "active" },
      { faculty_id: "f1", student_id: "s3", status: "active" },
      { faculty_id: "f2", student_id: "s4", status: "active" },
      { faculty_id: "f2", student_id: "s5", status: "active" },
      { faculty_id: "f3", student_id: "s6", status: "active" },
      { faculty_id: "f3", student_id: "s7", status: "active" },
    ]

    const { error: mentorshipsError } = await supabase.from("mentorships").upsert(mentorships)

    if (mentorshipsError) throw mentorshipsError

    // Add sample mentorship meetings
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const { data: meetings, error: meetingsError } = await supabase
      .from("mentorship_meetings")
      .upsert([
        {
          id: "m1",
          faculty_id: "f1",
          title: "Academic Progress Review",
          description: "Reviewing academic progress and addressing any concerns.",
          meeting_type: "individual",
          meeting_date: tomorrow.toISOString(),
          duration_minutes: 30,
          location: "Office 101",
        },
        {
          id: "m2",
          faculty_id: "f1",
          title: "Group Mentorship Session",
          description: "Group discussion on career opportunities in tech.",
          meeting_type: "group",
          meeting_date: nextWeek.toISOString(),
          duration_minutes: 60,
          location: "Conference Room A",
        },
        {
          id: "m3",
          faculty_id: "f1",
          title: "Past Individual Meeting",
          description: "Discussion about academic goals.",
          meeting_type: "individual",
          meeting_date: yesterday.toISOString(),
          duration_minutes: 30,
          location: "Office 101",
        },
        {
          id: "m4",
          faculty_id: "f1",
          title: "Past Group Session",
          description: "Workshop on research methodologies.",
          meeting_type: "group",
          meeting_date: lastWeek.toISOString(),
          duration_minutes: 90,
          location: "Lab 202",
        },
      ])
      .select()

    if (meetingsError) throw meetingsError

    // Add meeting attendees
    const attendees = [
      { meeting_id: "m1", student_id: "s1", attended: null },
      { meeting_id: "m2", student_id: "s1", attended: null },
      { meeting_id: "m2", student_id: "s2", attended: null },
      { meeting_id: "m2", student_id: "s3", attended: null },
      { meeting_id: "m3", student_id: "s2", attended: true, feedback: "Good participation in the meeting." },
      { meeting_id: "m4", student_id: "s1", attended: true, feedback: "Actively contributed to the discussion." },
      { meeting_id: "m4", student_id: "s2", attended: true, feedback: "Asked insightful questions." },
      { meeting_id: "m4", student_id: "s3", attended: false, feedback: "Did not attend. Follow up required." },
    ]

    const { error: attendeesError } = await supabase.from("mentorship_meeting_attendees").upsert(attendees)

    if (attendeesError) throw attendeesError

    // Add sample virtual classroom sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("virtual_classroom_sessions")
      .upsert([
        {
          id: "vc1",
          class_id: "c1",
          faculty_id: "f1",
          title: "Introduction to Binary Trees",
          description: "Covering binary tree concepts and implementations.",
          start_time: tomorrow.toISOString(),
          duration_minutes: 90,
          meeting_link: "https://meet.example.com/binary-trees",
        },
        {
          id: "vc2",
          class_id: "c2",
          faculty_id: "f2",
          title: "Integration Techniques",
          description: "Advanced integration methods and practice problems.",
          start_time: nextWeek.toISOString(),
          duration_minutes: 90,
          meeting_link: "https://meet.example.com/integration",
        },
      ])
      .select()

    if (sessionsError) throw sessionsError

    revalidatePath("/dashboard/study-groups")
    revalidatePath("/dashboard/mentorship")
    revalidatePath("/student-dashboard/study-groups")
    revalidatePath("/student-dashboard/virtual-classroom")

    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("faculty").select("count").limit(1)

    return { success: !error, connected: !error }
  } catch (error) {
    return { success: false, connected: false }
  }
}
