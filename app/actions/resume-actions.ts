"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for resume templates and student resumes
export type ResumeTemplate = {
  id: string
  name: string
  description: string
  template_html: string
  template_css?: string
  preview_image_url?: string
  category: "general" | "technical" | "creative" | "academic" | "professional"
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type StudentResume = {
  id: string
  student_id: string
  template_id: string
  resume_data: any // JSON data for the resume
  resume_html?: string
  pdf_url?: string
  is_public: boolean
  created_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
  template?: ResumeTemplate
}

// Get all resume templates
export async function getAllResumeTemplates() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("resume_templates")
      .select()
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching resume templates:", error)
    return { success: false, error }
  }
}

// Get featured resume templates
export async function getFeaturedResumeTemplates() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("resume_templates")
      .select()
      .eq("is_featured", true)
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching featured resume templates:", error)
    return { success: false, error }
  }
}

// Get resume template by ID
export async function getResumeTemplateById(templateId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("resume_templates")
      .select()
      .eq("id", templateId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching resume template:", error)
    return { success: false, error }
  }
}

// Create a new resume template
export async function createResumeTemplate(template: Omit<ResumeTemplate, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("resume_templates")
      .insert(template)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/resume-builder")
    revalidatePath("/student-dashboard/other-services/resume-builder")
    revalidatePath("/dashboard/other-services/resume-builder")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating resume template:", error)
    return { success: false, error }
  }
}

// Update a resume template
export async function updateResumeTemplate(templateId: string, updates: Partial<ResumeTemplate>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("resume_templates")
      .update(updatedData)
      .eq("id", templateId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/resume-builder")
    revalidatePath("/student-dashboard/other-services/resume-builder")
    revalidatePath("/dashboard/other-services/resume-builder")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating resume template:", error)
    return { success: false, error }
  }
}

// Delete a resume template
export async function deleteResumeTemplate(templateId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if any student resumes are using this template
    const { data: resumes, error: resumesError } = await supabase
      .from("student_resumes")
      .select("id")
      .eq("template_id", templateId)
    
    if (resumesError) throw resumesError
    
    if (resumes && resumes.length > 0) {
      return { 
        success: false, 
        error: { message: `Cannot delete template. It is being used by ${resumes.length} student resume(s).` } 
      }
    }
    
    // Delete the template
    const { error } = await supabase
      .from("resume_templates")
      .delete()
      .eq("id", templateId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/resume-builder")
    revalidatePath("/student-dashboard/other-services/resume-builder")
    revalidatePath("/dashboard/other-services/resume-builder")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting resume template:", error)
    return { success: false, error }
  }
}

// Upload template preview image
export async function uploadTemplatePreviewImage(templateId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `resume_templates/${templateId}/preview/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resume_templates")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("resume_templates").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the template with the preview image URL
    const { data, error } = await supabase
      .from("resume_templates")
      .update({
        preview_image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", templateId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/resume-builder")
    revalidatePath("/student-dashboard/other-services/resume-builder")
    revalidatePath("/dashboard/other-services/resume-builder")
    
    return { success: true, data, imageUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading template preview image:", error)
    return { success: false, error }
  }
}

// Get all student resumes
export async function getAllStudentResumes() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("student_resumes")
      .select(`
        *,
        student:student_id(*),
        template:template_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student resumes:", error)
    return { success: false, error }
  }
}

// Get student resumes by student ID
export async function getStudentResumesByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("student_resumes")
      .select(`
        *,
        student:student_id(*),
        template:template_id(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student resumes:", error)
    return { success: false, error }
  }
}

// Get student resume by ID
export async function getStudentResumeById(resumeId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("student_resumes")
      .select(`
        *,
        student:student_id(*),
        template:template_id(*)
      `)
      .eq("id", resumeId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student resume:", error)
    return { success: false, error }
  }
}

// Create a new student resume
export async function createStudentResume(resume: Omit<StudentResume, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("student_resumes")
      .insert(resume)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/resume-builder")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating student resume:", error)
    return { success: false, error }
  }
}

// Update a student resume
export async function updateStudentResume(resumeId: string, updates: Partial<StudentResume>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("student_resumes")
      .update(updatedData)
      .eq("id", resumeId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/resume-builder")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating student resume:", error)
    return { success: false, error }
  }
}

// Delete a student resume
export async function deleteStudentResume(resumeId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from("student_resumes")
      .delete()
      .eq("id", resumeId)
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/resume-builder")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting student resume:", error)
    return { success: false, error }
  }
}

// Generate PDF from resume HTML
export async function generateResumePDF(resumeId: string, resumeHTML: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // This would typically involve a server-side PDF generation service
    // For now, we'll just update the resume with the HTML and a placeholder PDF URL
    
    // In a real implementation, you would:
    // 1. Send the HTML to a PDF generation service
    // 2. Get back the PDF file
    // 3. Upload the PDF to storage
    // 4. Update the resume with the PDF URL
    
    // For this example, we'll just update the HTML and set a placeholder PDF URL
    const { data, error } = await supabase
      .from("student_resumes")
      .update({
        resume_html: resumeHTML,
        // In a real implementation, this would be the actual PDF URL
        pdf_url: `/api/resumes/${resumeId}/pdf`,
        updated_at: new Date().toISOString()
      })
      .eq("id", resumeId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/student-dashboard/other-services/resume-builder")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error generating resume PDF:", error)
    return { success: false, error }
  }
}

// Filter resume templates
export async function filterResumeTemplates(filters: {
  category?: string
  isFeatured?: boolean
  searchQuery?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("resume_templates")
      .select()
    
    // Apply filters
    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category.toLowerCase())
    }
    
    if (filters.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering resume templates:", error)
    return { success: false, error }
  }
}
