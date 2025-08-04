"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for scholarships and applications
export type Scholarship = {
  id: string
  name: string
  description: string
  eligibility_criteria: string
  amount: number
  deadline: string
  provider: string
  provider_website?: string
  document_requirements: string
  is_active: boolean
  is_featured: boolean
  category: "merit" | "need-based" | "research" | "sports" | "cultural" | "international" | "minority" | "other"
  created_at: string
  updated_at: string
}

export type ScholarshipApplication = {
  id: string
  scholarship_id: string
  student_id: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "additional_info_required"
  application_data: any // JSON data for the application
  documents_urls: string[] // Array of document URLs
  feedback?: string
  submitted_at?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
  scholarship?: Scholarship
}

export type ScholarshipComment = {
  id: string
  application_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  created_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

// Get all scholarships
export async function getAllScholarships() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarships")
      .select()
      .order("deadline", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return { success: false, error }
  }
}

// Get active scholarships
export async function getActiveScholarships() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarships")
      .select()
      .eq("is_active", true)
      .order("deadline", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching active scholarships:", error)
    return { success: false, error }
  }
}

// Get featured scholarships
export async function getFeaturedScholarships() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarships")
      .select()
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("deadline", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching featured scholarships:", error)
    return { success: false, error }
  }
}

// Get scholarship by ID
export async function getScholarshipById(scholarshipId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarships")
      .select()
      .eq("id", scholarshipId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    return { success: false, error }
  }
}

// Create a new scholarship
export async function createScholarship(scholarship: Omit<Scholarship, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarships")
      .insert(scholarship)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/scholarships")
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating scholarship:", error)
    return { success: false, error }
  }
}

// Update a scholarship
export async function updateScholarship(scholarshipId: string, updates: Partial<Scholarship>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("scholarships")
      .update(updatedData)
      .eq("id", scholarshipId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/scholarships")
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating scholarship:", error)
    return { success: false, error }
  }
}

// Delete a scholarship
export async function deleteScholarship(scholarshipId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if any applications exist for this scholarship
    const { data: applications, error: applicationsError } = await supabase
      .from("scholarship_applications")
      .select("id")
      .eq("scholarship_id", scholarshipId)
    
    if (applicationsError) throw applicationsError
    
    if (applications && applications.length > 0) {
      return { 
        success: false, 
        error: { message: `Cannot delete scholarship. It has ${applications.length} application(s).` } 
      }
    }
    
    // Delete the scholarship
    const { error } = await supabase
      .from("scholarships")
      .delete()
      .eq("id", scholarshipId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/scholarships")
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting scholarship:", error)
    return { success: false, error }
  }
}

// Get all scholarship applications
export async function getAllScholarshipApplications() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .select(`
        *,
        student:student_id(*),
        scholarship:scholarship_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarship applications:", error)
    return { success: false, error }
  }
}

// Get scholarship applications by student ID
export async function getScholarshipApplicationsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .select(`
        *,
        student:student_id(*),
        scholarship:scholarship_id(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student scholarship applications:", error)
    return { success: false, error }
  }
}

// Get scholarship applications by scholarship ID
export async function getScholarshipApplicationsByScholarshipId(scholarshipId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .select(`
        *,
        student:student_id(*),
        scholarship:scholarship_id(*)
      `)
      .eq("scholarship_id", scholarshipId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarship applications:", error)
    return { success: false, error }
  }
}

// Get scholarship application by ID
export async function getScholarshipApplicationById(applicationId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .select(`
        *,
        student:student_id(*),
        scholarship:scholarship_id(*)
      `)
      .eq("id", applicationId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarship application:", error)
    return { success: false, error }
  }
}

// Create a new scholarship application
export async function createScholarshipApplication(application: Omit<ScholarshipApplication, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .insert(application)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating scholarship application:", error)
    return { success: false, error }
  }
}

// Update a scholarship application
export async function updateScholarshipApplication(applicationId: string, updates: Partial<ScholarshipApplication>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    // If status is being updated to submitted, set submitted_at
    if (updates.status === "submitted" && !updates.submitted_at) {
      updatedData.submitted_at = new Date().toISOString()
    }
    
    // If status is being updated to approved or rejected, set reviewed_at
    if ((updates.status === "approved" || updates.status === "rejected") && !updates.reviewed_at) {
      updatedData.reviewed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("scholarship_applications")
      .update(updatedData)
      .eq("id", applicationId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating scholarship application:", error)
    return { success: false, error }
  }
}

// Delete a scholarship application
export async function deleteScholarshipApplication(applicationId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Delete all comments for this application
    const { error: commentsError } = await supabase
      .from("scholarship_comments")
      .delete()
      .eq("application_id", applicationId)
    
    if (commentsError) throw commentsError
    
    // Delete the application
    const { error } = await supabase
      .from("scholarship_applications")
      .delete()
      .eq("id", applicationId)
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting scholarship application:", error)
    return { success: false, error }
  }
}

// Upload application document
export async function uploadScholarshipDocument(applicationId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `scholarship_applications/${applicationId}/documents/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("scholarship_documents")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("scholarship_documents").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Get the current application to update the documents_urls array
    const { data: application, error: applicationError } = await supabase
      .from("scholarship_applications")
      .select("documents_urls")
      .eq("id", applicationId)
      .single()
    
    if (applicationError) throw applicationError
    
    // Update the documents_urls array
    const documentsUrls = application.documents_urls || []
    documentsUrls.push(urlData.publicUrl)
    
    // Update the application with the new documents_urls array
    const { data, error } = await supabase
      .from("scholarship_applications")
      .update({
        documents_urls: documentsUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data, documentUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading scholarship document:", error)
    return { success: false, error }
  }
}

// Remove application document
export async function removeScholarshipDocument(applicationId: string, documentUrl: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current application to update the documents_urls array
    const { data: application, error: applicationError } = await supabase
      .from("scholarship_applications")
      .select("documents_urls")
      .eq("id", applicationId)
      .single()
    
    if (applicationError) throw applicationError
    
    // Update the documents_urls array by removing the specified URL
    const documentsUrls = application.documents_urls || []
    const updatedDocumentsUrls = documentsUrls.filter(url => url !== documentUrl)
    
    // Update the application with the new documents_urls array
    const { data, error } = await supabase
      .from("scholarship_applications")
      .update({
        documents_urls: updatedDocumentsUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select()
    
    if (error) throw error
    
    // Try to delete the file from storage (this is optional and may fail if the URL format is different)
    try {
      // Extract the file path from the URL
      const url = new URL(documentUrl)
      const pathParts = url.pathname.split("/")
      const filePath = pathParts.slice(pathParts.indexOf("scholarship_documents") + 1).join("/")
      
      if (filePath) {
        await supabase.storage.from("scholarship_documents").remove([filePath])
      }
    } catch (storageError) {
      console.warn("Could not delete file from storage:", storageError)
      // Continue even if storage deletion fails
    }
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error removing scholarship document:", error)
    return { success: false, error }
  }
}

// Get comments for a scholarship application
export async function getScholarshipComments(applicationId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scholarship comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a scholarship application
export async function addScholarshipComment(comment: Omit<ScholarshipComment, "id" | "created_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("scholarship_comments")
      .insert(comment)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding scholarship comment:", error)
    return { success: false, error }
  }
}

// Delete a comment from a scholarship application
export async function deleteScholarshipComment(commentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from("scholarship_comments")
      .delete()
      .eq("id", commentId)
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/scholarships")
    revalidatePath("/dashboard/other-services/scholarships")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting scholarship comment:", error)
    return { success: false, error }
  }
}

// Filter scholarships
export async function filterScholarships(filters: {
  category?: string
  isActive?: boolean
  isFeatured?: boolean
  searchQuery?: string
  deadlineAfter?: string
  deadlineBefore?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("scholarships")
      .select()
    
    // Apply filters
    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category.toLowerCase())
    }
    
    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive)
    }
    
    if (filters.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured)
    }
    
    if (filters.deadlineAfter) {
      query = query.gte("deadline", filters.deadlineAfter)
    }
    
    if (filters.deadlineBefore) {
      query = query.lte("deadline", filters.deadlineBefore)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("deadline", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering scholarships:", error)
    return { success: false, error }
  }
}

// Filter scholarship applications
export async function filterScholarshipApplications(filters: {
  status?: string
  scholarshipId?: string
  studentId?: string
  searchQuery?: string
  submittedAfter?: string
  submittedBefore?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("scholarship_applications")
      .select(`
        *,
        student:student_id(*),
        scholarship:scholarship_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.scholarshipId) {
      query = query.eq("scholarship_id", filters.scholarshipId)
    }
    
    if (filters.studentId) {
      query = query.eq("student_id", filters.studentId)
    }
    
    if (filters.submittedAfter) {
      query = query.gte("submitted_at", filters.submittedAfter)
    }
    
    if (filters.submittedBefore) {
      query = query.lte("submitted_at", filters.submittedBefore)
    }
    
    if (filters.searchQuery) {
      // This is a bit more complex as we need to search in related tables
      // For simplicity, we'll just search in the application data
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `application_data->>'name'.ilike.%${searchTerm}%,application_data->>'email'.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering scholarship applications:", error)
    return { success: false, error }
  }
}
