"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for health service requests
export type HealthServiceRequest = {
  id: string
  student_id: string
  request_id: string
  service_type: "consultation" | "emergency" | "medication" | "counseling" | "checkup" | "other"
  description: string
  symptoms?: string
  medical_history?: string
  preferred_date?: string
  preferred_time?: string
  is_urgent: boolean
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled"
  appointment_date?: string
  appointment_time?: string
  doctor_name?: string
  prescription_url?: string
  medical_report_url?: string
  document_urls?: string[]
  created_at: string
  updated_at: string
  completed_at?: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
    phone?: string
  }
}

export type HealthServiceComment = {
  id: string
  request_id: string
  user_id: string
  user_type: "student" | "staff" | "doctor" | "admin"
  comment: string
  is_private: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all health service requests
export async function getAllHealthServiceRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .select(`
        *,
        student:student_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching health service requests:", error)
    return { success: false, error }
  }
}

// Get health service requests by student ID
export async function getHealthServiceRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .select(`
        *,
        student:student_id(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student health service requests:", error)
    return { success: false, error }
  }
}

// Get health service request by ID
export async function getHealthServiceRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .select(`
        *,
        student:student_id(*)
      `)
      .eq("id", requestId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching health service request:", error)
    return { success: false, error }
  }
}

// Create a new health service request
export async function createHealthServiceRequest(request: Omit<HealthServiceRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `HEALTH-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating health service request:", error)
    return { success: false, error }
  }
}

// Update a health service request
export async function updateHealthServiceRequest(requestId: string, updates: Partial<HealthServiceRequest>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to completed, set completed_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if (updates.status === "completed" && !updates.completed_at) {
      updatedData.completed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating health service request:", error)
    return { success: false, error }
  }
}

// Get comments for a health service request
export async function getHealthServiceComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching health service comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a health service request
export async function addHealthServiceComment(
  requestId: string,
  userId: string,
  userType: "student" | "staff" | "doctor" | "admin",
  comment: string,
  isPrivate: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_private: isPrivate
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding health service comment:", error)
    return { success: false, error }
  }
}

// Upload medical documents for a health service request
export async function uploadMedicalDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("health_service_requests")
      .select("document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `health_services/documents/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("health_services")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("health_services").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .update({
        document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading medical documents:", error)
    return { success: false, error }
  }
}

// Upload prescription for a health service request
export async function uploadPrescription(requestId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `health_services/prescriptions/${requestId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("health_services")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("health_services").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the request with the prescription URL
    const { data, error } = await supabase
      .from("health_service_requests")
      .update({
        prescription_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data, prescriptionUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading prescription:", error)
    return { success: false, error }
  }
}

// Upload medical report for a health service request
export async function uploadMedicalReport(requestId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `health_services/reports/${requestId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("health_services")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("health_services").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the request with the medical report URL
    const { data, error } = await supabase
      .from("health_service_requests")
      .update({
        medical_report_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data, reportUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading medical report:", error)
    return { success: false, error }
  }
}

// Filter health service requests
export async function filterHealthServiceRequests(filters: {
  status?: string
  serviceType?: string
  isUrgent?: boolean
  searchQuery?: string
  department?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("health_service_requests")
      .select(`
        *,
        student:student_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.serviceType && filters.serviceType !== "all") {
      query = query.eq("service_type", filters.serviceType.toLowerCase())
    }
    
    if (filters.isUrgent !== undefined) {
      query = query.eq("is_urgent", filters.isUrgent)
    }
    
    if (filters.department && filters.department !== "all") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        query = query.gte("created_at", filters.dateRange.start)
      }
      
      if (filters.dateRange.end) {
        query = query.lte("created_at", filters.dateRange.end)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,symptoms.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering health service requests:", error)
    return { success: false, error }
  }
}

// Get available appointment slots
export async function getAvailableAppointmentSlots(date: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all appointments for the given date
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from("health_service_requests")
      .select("appointment_time")
      .eq("appointment_date", date)
      .not("appointment_time", "is", null)
    
    if (appointmentsError) throw appointmentsError
    
    // Define all possible time slots (9 AM to 5 PM, 30-minute intervals)
    const allTimeSlots = []
    for (let hour = 9; hour < 17; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    
    // Filter out already booked slots
    const bookedSlots = existingAppointments.map(appointment => appointment.appointment_time)
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot))
    
    return { success: true, data: availableSlots }
  } catch (error) {
    console.error("Error fetching available appointment slots:", error)
    return { success: false, error }
  }
}

// Schedule an appointment
export async function scheduleAppointment(
  requestId: string,
  appointmentDate: string,
  appointmentTime: string,
  doctorName: string
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("health_service_requests")
      .update({
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
        status: "scheduled",
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/health-services")
    revalidatePath("/student-dashboard/other-services/health-services")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error scheduling appointment:", error)
    return { success: false, error }
  }
}
