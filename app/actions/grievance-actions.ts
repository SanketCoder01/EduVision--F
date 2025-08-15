"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for grievances
export type Grievance = {
  id: string
  student_id: string
  grievance_id: string
  title: string
  description: string
  category: string
  against?: string
  status: "pending" | "in_review" | "resolved" | "rejected"
  is_anonymous: boolean
  document_urls?: string[]
  created_at: string
  updated_at: string
  resolved_at?: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
  assigned_to?: string
  assignedTo?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type GrievanceComment = {
  id: string
  grievance_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_internal: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all grievances
export async function getAllGrievances() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("grievances")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching grievances:", error)
    return { success: false, error }
  }
}

// Get grievances by student ID
export async function getGrievancesByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("grievances")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student grievances:", error)
    return { success: false, error }
  }
}

// Get grievance by ID
export async function getGrievanceById(grievanceId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("grievances")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("id", grievanceId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching grievance:", error)
    return { success: false, error }
  }
}

// Create a new grievance
export async function createGrievance(grievance: Omit<Grievance, "id" | "grievance_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a grievance ID
    const grievanceId = `GRV-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("grievances")
      .insert({
        ...grievance,
        grievance_id: grievanceId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating grievance:", error)
    return { success: false, error }
  }
}

// Update a grievance
export async function updateGrievance(grievanceId: string, updates: Partial<Grievance>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to resolved, set resolved_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if (updates.status === "resolved" && !updates.resolved_at) {
      updatedData.resolved_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("grievances")
      .update(updatedData)
      .eq("id", grievanceId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating grievance:", error)
    return { success: false, error }
  }
}

// Get comments for a grievance
export async function getGrievanceComments(grievanceId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("grievance_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("grievance_id", grievanceId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching grievance comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a grievance
export async function addGrievanceComment(
  grievanceId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("grievance_comments")
      .insert({
        grievance_id: grievanceId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding grievance comment:", error)
    return { success: false, error }
  }
}

// Upload documents for a grievance
export async function uploadGrievanceDocuments(grievanceId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current grievance to retrieve existing document URLs
    const { data: grievance, error: fetchError } = await supabase
      .from("grievances")
      .select("document_urls")
      .eq("id", grievanceId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = grievance.document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `grievances/${grievanceId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("grievances")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("grievances").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the grievance with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("grievances")
      .update({
        document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", grievanceId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading grievance documents:", error)
    return { success: false, error }
  }
}

// Filter grievances
export async function filterGrievances(filters: {
  status?: string
  category?: string
  searchQuery?: string
  department?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("grievances")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "All") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.category && filters.category !== "All") {
      query = query.eq("category", filters.category)
    }
    
    if (filters.department && filters.department !== "All") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `grievance_id.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering grievances:", error)
    return { success: false, error }
  }
}

// Get anti-ragging faculty contacts
export async function getAntiRaggingFacultyContacts() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("anti_ragging_faculty")
      .select("*")
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching anti-ragging faculty contacts:", error)
    return { success: false, error }
  }
}

// Add or update anti-ragging faculty contact
export async function updateAntiRaggingFacultyContact(facultyId: string, facultyData: {
  name: string
  email: string
  phone: string
  designation: string
  department: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("anti_ragging_faculty")
      .upsert({
        id: facultyId,
        ...facultyData,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating anti-ragging faculty contact:", error)
    return { success: false, error }
  }
}

// Delete anti-ragging faculty contact
export async function deleteAntiRaggingFacultyContact(facultyId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("anti_ragging_faculty")
      .delete()
      .eq("id", facultyId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/grievance")
    revalidatePath("/student-dashboard/other-services/grievance")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting anti-ragging faculty contact:", error)
    return { success: false, error }
  }
}
