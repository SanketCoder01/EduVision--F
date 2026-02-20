"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface TimetableEntry {
  id?: string
  faculty_id: string
  department: string
  year: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at?: string
  schedule_data?: any
}

export interface ScheduleDay {
  day: string
  lectures: {
    time: string
    subject: string
    room: string
    faculty: string
    type: string
  }[]
}

export async function uploadTimetableToSupabase(
  file: File,
  department: string,
  year: string,
  facultyId: string,
  scheduleData: ScheduleDay[]
) {
  try {
    const supabase = await createClient()

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${department}_${year}_${Date.now()}.${fileExt}`
    const filePath = `${facultyId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("timetables")
      .upload(filePath, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { success: false, error: "Failed to upload file" }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("timetables")
      .getPublicUrl(filePath)

    // Save timetable metadata to database
    const { data, error } = await supabase
      .from("timetables")
      .insert({
        faculty_id: facultyId,
        department,
        year,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        schedule_data: scheduleData,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Failed to save timetable data" }
    }

    revalidatePath("/dashboard/timetable")
    revalidatePath("/student-dashboard/timetable")

    return { success: true, data }
  } catch (error) {
    console.error("Error uploading timetable:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getFacultyTimetables(facultyId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("faculty_id", facultyId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error fetching timetables:", error)
      return { success: false, error: "Failed to fetch timetables" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getStudentTimetable(department: string, year: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("department", department)
      .eq("year", year)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching timetable:", error)
      return { success: false, error: "Failed to fetch timetable" }
    }

    if (!data) {
      return { success: true, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteTimetable(id: string, fileUrl: string) {
  try {
    const supabase = await createClient()

    // Delete file from storage
    const filePath = fileUrl.split("/timetables/")[1]
    if (filePath) {
      await supabase.storage.from("timetables").remove([filePath])
    }

    // Delete from database
    const { error } = await supabase.from("timetables").delete().eq("id", id)

    if (error) {
      console.error("Error deleting timetable:", error)
      return { success: false, error: "Failed to delete timetable" }
    }

    revalidatePath("/dashboard/timetable")
    revalidatePath("/student-dashboard/timetable")

    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
