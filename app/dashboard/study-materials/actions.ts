"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface StudyMaterial {
  id?: string
  title: string
  description?: string
  faculty_id: string
  faculty_name?: string
  department: string
  year: string
  subject: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  created_at?: string
}

export async function uploadStudyMaterial(
  file: File,
  title: string,
  description: string,
  subject: string,
  department: string,
  year: string,
  facultyId: string,
  facultyName: string
) {
  try {
    const supabase = await createClient()

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${department}_${year}_${subject}_${Date.now()}.${fileExt}`
    const filePath = `${facultyId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { success: false, error: "Failed to upload file" }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("study-materials")
      .getPublicUrl(filePath)

    // Save study material metadata to database
    const { data, error } = await supabase
      .from("study_materials")
      .insert({
        title,
        description,
        faculty_id: facultyId,
        faculty_name: facultyName,
        department,
        year,
        subject,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Failed to save study material data" }
    }

    // Send notifications to students
    await notifyStudents(department, year, title, subject, data.id)

    revalidatePath("/dashboard/study-materials")
    revalidatePath("/student-dashboard/study-materials")

    return { success: true, data }
  } catch (error) {
    console.error("Error uploading study material:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getFacultyStudyMaterials(facultyId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching study materials:", error)
      return { success: false, error: "Failed to fetch study materials" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getStudentStudyMaterials(department: string, year: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("department", department)
      .eq("year", year)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching study materials:", error)
      return { success: false, error: "Failed to fetch study materials" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteStudyMaterial(id: string, fileUrl: string) {
  try {
    const supabase = await createClient()

    // Delete file from storage
    const filePath = fileUrl.split("/study-materials/")[1]
    if (filePath) {
      await supabase.storage.from("study-materials").remove([filePath])
    }

    // Delete from database
    const { error } = await supabase.from("study_materials").delete().eq("id", id)

    if (error) {
      console.error("Error deleting study material:", error)
      return { success: false, error: "Failed to delete study material" }
    }

    revalidatePath("/dashboard/study-materials")
    revalidatePath("/student-dashboard/study-materials")

    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

async function notifyStudents(
  department: string,
  year: string,
  title: string,
  subject: string,
  materialId: string
) {
  try {
    const supabase = await createClient()

    // Get students in the target department and year
    const { data: students, error } = await supabase
      .from("user_profiles")
      .select("user_id, name, email")
      .eq("user_type", "student")
      .eq("department", department)
      .eq("year", year)

    if (error || !students?.length) {
      console.error("Error fetching students for notifications:", error)
      return
    }

    // Create notifications for each student
    const notifications = students.map(student => ({
      user_id: student.user_id,
      type: "study_material",
      title: `New Study Material: ${title}`,
      message: `A new study material for ${subject} has been uploaded.`,
      data: {
        material_id: materialId,
        title,
        subject,
        department,
        year
      },
      read: false,
      created_at: new Date().toISOString()
    }))

    // Insert notifications
    await supabase.from("notifications").insert(notifications)
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
