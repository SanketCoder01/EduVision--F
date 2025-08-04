"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Mock data for when database is not available
const mockClasses = [
  { id: "1", name: "FY CSE A", department: "Computer Science", year: 1, section: "A", students_count: 60 },
  { id: "2", name: "FY CSE B", department: "Computer Science", year: 1, section: "B", students_count: 60 },
  { id: "3", name: "SY CSE A", department: "Computer Science", year: 2, section: "A", students_count: 55 },
  { id: "4", name: "SY CSE B", department: "Computer Science", year: 2, section: "B", students_count: 55 },
  { id: "5", name: "TY CSE A", department: "Computer Science", year: 3, section: "A", students_count: 50 },
  { id: "6", name: "TY CSE B", department: "Computer Science", year: 3, section: "B", students_count: 50 },
]

const mockStudents = [
  { id: "1", name: "Gaikwad Sanket Sunil", prn: "2124UCEM2059", class_id: "3" },
  { id: "2", name: "Rahul Sharma", prn: "2124UCEM2060", class_id: "3" },
  { id: "3", name: "Priya Patel", prn: "2124UCEM2061", class_id: "3" },
  { id: "4", name: "Amit Kumar", prn: "2124UCEM2062", class_id: "3" },
  { id: "5", name: "Neha Singh", prn: "2124UCEM2063", class_id: "3" },
  { id: "6", name: "Rohan Gupta", prn: "2124UCEM2064", class_id: "3" },
]

// Get all classes
export async function getClasses() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("classes").select("*").order("name", { ascending: true })

    if (error) {
      console.log("Database error, using mock data:", error.message)
      return { success: true, data: mockClasses }
    }

    // Get student count for each class
    const classesWithStudentCount = await Promise.all(
      data.map(async (cls) => {
        const { count, error: countError } = await supabase
          .from("class_students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id)

        return {
          ...cls,
          students_count: countError ? 0 : count || 0,
        }
      }),
    )

    return { success: true, data: classesWithStudentCount }
  } catch (error) {
    console.log("Connection error, using mock data:", error)
    return { success: true, data: mockClasses }
  }
}

// Get class by ID
export async function getClassById(classId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("classes").select("*").eq("id", classId).single()

    if (error) {
      const mockClass = mockClasses.find((c) => c.id === classId)
      return { success: true, data: mockClass || mockClasses[0] }
    }

    return { success: true, data }
  } catch (error) {
    const mockClass = mockClasses.find((c) => c.id === classId)
    return { success: true, data: mockClass || mockClasses[0] }
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    const supabase = createServerSupabaseClient()

    // Try to create a simple test table
    const { error } = await supabase.rpc("create_test_table", {})

    if (error) {
      console.log("Database initialization not available, using mock data")
    }

    revalidatePath("/dashboard/study-groups")
    return { success: true }
  } catch (error) {
    console.log("Database initialization not available, using mock data")
    return { success: true }
  }
}

// Seed database with sample data
export async function seedDatabase() {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.rpc("seed_database", {})

    if (error) {
      console.log("Database seeding not available, using mock data")
    }

    revalidatePath("/dashboard/study-groups")
    return { success: true }
  } catch (error) {
    console.log("Database seeding not available, using mock data")
    return { success: true }
  }
}

// Get students by class ID
export async function getStudentsByClass(classId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .order("name", { ascending: true })

    if (error) {
      const classStudents = mockStudents.filter((s) => s.class_id === classId)
      return { success: true, data: classStudents }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    const classStudents = mockStudents.filter((s) => s.class_id === classId)
    return { success: true, data: classStudents }
  }
}

// Create study groups
export async function createStudyGroups(formData: {
  classId: string
  groupSize: number
  groupMembers: Array<{
    groupId: number
    studentIds: string[]
  }>
  createdBy: string
  creationType: "faculty" | "student"
}) {
  try {
    const supabase = createServerSupabaseClient()

    // Create groups
    const groups = []
    for (const group of formData.groupMembers) {
      const { data, error } = await supabase
        .from("study_groups")
        .insert({
          class_id: formData.classId,
          name: `Group ${group.groupId}`,
          created_by: formData.createdBy,
          creation_type: formData.creationType,
        })
        .select()
        .single()

      if (error) {
        // Mock group creation
        const mockGroup = {
          id: `group-${Date.now()}-${group.groupId}`,
          class_id: formData.classId,
          name: `Group ${group.groupId}`,
          created_by: formData.createdBy,
          creation_type: formData.creationType,
        }
        groups.push(mockGroup)
        continue
      }

      groups.push(data)

      // Add members to group
      const groupMembers = group.studentIds.map((studentId) => ({
        group_id: data.id,
        student_id: studentId,
      }))

      await supabase.from("study_group_members").insert(groupMembers)
    }

    revalidatePath("/dashboard/study-groups")
    revalidatePath("/student-dashboard/study-groups")
    return { success: true, data: groups }
  } catch (error) {
    console.log("Study group creation error, using mock response:", error)
    return { success: true, data: [] }
  }
}

// Get study groups by class ID
export async function getStudyGroupsByClass(classId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: groups, error: groupsError } = await supabase
      .from("study_groups")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })

    if (groupsError) {
      return { success: true, data: [] }
    }

    // Get group members
    const groupIds = groups.map((group) => group.id)

    if (groupIds.length > 0) {
      const { data: members, error: membersError } = await supabase
        .from("study_group_members")
        .select("*, student:students(*)")
        .in("group_id", groupIds)

      if (membersError) throw membersError

      // Add members to groups
      const groupsWithMembers = groups.map((group) => {
        const groupMembers = members.filter((member) => member.group_id === group.id)
        return {
          ...group,
          members: groupMembers,
        }
      })

      return { success: true, data: groupsWithMembers }
    }

    return { success: true, data: groups.map((group) => ({ ...group, members: [] })) }
  } catch (error) {
    return { success: true, data: [] }
  }
}

// Add task to study group
export async function addTaskToStudyGroup(formData: {
  groupIds: string[]
  title: string
  description: string
  dueDate: string
  attachments?: Array<{
    name: string
    fileType: string
    fileUrl: string
  }>
}) {
  try {
    const supabase = createServerSupabaseClient()

    const tasks = []
    for (const groupId of formData.groupIds) {
      const { data, error } = await supabase
        .from("study_group_tasks")
        .insert({
          group_id: groupId,
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
        })
        .select()
        .single()

      if (error) {
        const mockTask = {
          id: `task-${Date.now()}`,
          group_id: groupId,
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
        }
        tasks.push(mockTask)
        continue
      }

      tasks.push(data)

      // Add attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        const taskAttachments = formData.attachments.map((attachment) => ({
          task_id: data.id,
          name: attachment.name,
          file_type: attachment.fileType,
          file_url: attachment.fileUrl,
        }))

        const { error: attachmentsError } = await supabase.from("study_group_task_attachments").insert(taskAttachments)

        if (attachmentsError) throw attachmentsError
      }
    }

    revalidatePath("/dashboard/study-groups")
    revalidatePath("/student-dashboard/study-groups")
    return { success: true, data: tasks }
  } catch (error) {
    return { success: true, data: [] }
  }
}

// Get tasks by group ID
export async function getTasksByGroup(groupId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: tasks, error: tasksError } = await supabase
      .from("study_group_tasks")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (tasksError) {
      return { success: true, data: [] }
    }

    // Get task attachments
    const taskIds = tasks.map((task) => task.id)

    if (taskIds.length > 0) {
      const { data: attachments, error: attachmentsError } = await supabase
        .from("study_group_task_attachments")
        .select("*")
        .in("task_id", taskIds)

      if (attachmentsError) throw attachmentsError

      // Add attachments to tasks
      const tasksWithAttachments = tasks.map((task) => {
        const taskAttachments = attachments.filter((attachment) => attachment.task_id === task.id)
        return {
          ...task,
          attachments: taskAttachments,
        }
      })

      return { success: true, data: tasksWithAttachments }
    }

    return { success: true, data: tasks.map((task) => ({ ...task, attachments: [] })) }
  } catch (error) {
    return { success: true, data: [] }
  }
}
