"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for maintenance complaints
export type MaintenanceComplaint = {
  id: string
  student_id: string
  complaint_id: string
  title: string
  description: string
  location: string
  issue_type: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "rejected"
  assigned_to?: string
  image_urls?: string[]
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
  assignedTo?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type MaintenanceComment = {
  id: string
  complaint_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_internal: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all maintenance complaints
export async function getAllMaintenanceComplaints() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching maintenance complaints:", error)
    return { success: false, error }
  }
}

// Get maintenance complaints by student ID
export async function getMaintenanceComplaintsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student maintenance complaints:", error)
    return { success: false, error }
  }
}

// Get maintenance complaint by ID
export async function getMaintenanceComplaintById(complaintId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("id", complaintId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching maintenance complaint:", error)
    return { success: false, error }
  }
}

// Create a new maintenance complaint
export async function createMaintenanceComplaint(complaint: Omit<MaintenanceComplaint, "id" | "complaint_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a complaint ID
    const complaintId = `MAINT-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .insert({
        ...complaint,
        complaint_id: complaintId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/maintenance")
    revalidatePath("/student-dashboard/other-services/maintenance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating maintenance complaint:", error)
    return { success: false, error }
  }
}

// Update a maintenance complaint
export async function updateMaintenanceComplaint(complaintId: string, updates: Partial<MaintenanceComplaint>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to completed, set resolved_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if (updates.status === "completed" && !updates.resolved_at) {
      updatedData.resolved_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .update(updatedData)
      .eq("id", complaintId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/maintenance")
    revalidatePath("/student-dashboard/other-services/maintenance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating maintenance complaint:", error)
    return { success: false, error }
  }
}

// Get comments for a maintenance complaint
export async function getMaintenanceComments(complaintId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("maintenance_complaint_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching maintenance comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a maintenance complaint
export async function addMaintenanceComment(
  complaintId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("maintenance_complaint_comments")
      .insert({
        complaint_id: complaintId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/maintenance")
    revalidatePath("/student-dashboard/other-services/maintenance")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding maintenance comment:", error)
    return { success: false, error }
  }
}

// Upload images for a maintenance complaint
export async function uploadMaintenanceImages(complaintId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current complaint to retrieve existing image URLs
    const { data: complaint, error: fetchError } = await supabase
      .from("maintenance_complaints")
      .select("image_urls")
      .eq("id", complaintId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = complaint.image_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `maintenance/${complaintId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("maintenance")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("maintenance").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the complaint with the new image URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("maintenance_complaints")
      .update({
        image_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", complaintId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/maintenance")
    revalidatePath("/student-dashboard/other-services/maintenance")
    
    return { success: true, data, imageUrls: newUrls }
  } catch (error) {
    console.error("Error uploading maintenance images:", error)
    return { success: false, error }
  }
}

// Filter maintenance complaints
export async function filterMaintenanceComplaints(filters: {
  status?: string
  issueType?: string
  searchQuery?: string
  priority?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("maintenance_complaints")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "All") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.issueType && filters.issueType !== "All") {
      query = query.eq("issue_type", filters.issueType)
    }
    
    if (filters.priority && filters.priority !== "All") {
      query = query.eq("priority", filters.priority.toLowerCase())
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `complaint_id.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering maintenance complaints:", error)
    return { success: false, error }
  }
}
