"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for event help requests
export type EventHelpRequest = {
  id: string
  user_id: string
  request_id: string
  event_name: string
  event_date: string
  event_location: string
  request_type: string
  description: string
  requirements: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  document_urls?: string[]
  created_at: string
  updated_at: string
  completed_at?: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  assigned_to?: string
  assignedTo?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type EventHelpComment = {
  id: string
  request_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_internal: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all event help requests
export async function getAllEventHelpRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("event_help_requests")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching event help requests:", error)
    return { success: false, error }
  }
}

// Get event help requests by user ID
export async function getEventHelpRequestsByUserId(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("event_help_requests")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching user event help requests:", error)
    return { success: false, error }
  }
}

// Get event help request by ID
export async function getEventHelpRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("event_help_requests")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("id", requestId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching event help request:", error)
    return { success: false, error }
  }
}

// Create a new event help request
export async function createEventHelpRequest(request: Omit<EventHelpRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `EVT-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("event_help_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/event-help")
    revalidatePath("/student-dashboard/other-services/event-help")
    revalidatePath("/dashboard/other-services/event-help")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating event help request:", error)
    return { success: false, error }
  }
}

// Update an event help request
export async function updateEventHelpRequest(requestId: string, updates: Partial<EventHelpRequest>) {
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
      .from("event_help_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/event-help")
    revalidatePath("/student-dashboard/other-services/event-help")
    revalidatePath("/dashboard/other-services/event-help")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating event help request:", error)
    return { success: false, error }
  }
}

// Get comments for an event help request
export async function getEventHelpComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("event_help_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching event help comments:", error)
    return { success: false, error }
  }
}

// Add a comment to an event help request
export async function addEventHelpComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("event_help_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/event-help")
    revalidatePath("/student-dashboard/other-services/event-help")
    revalidatePath("/dashboard/other-services/event-help")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding event help comment:", error)
    return { success: false, error }
  }
}

// Upload documents for an event help request
export async function uploadEventHelpDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("event_help_requests")
      .select("document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `event_help/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event_help")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("event_help").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("event_help_requests")
      .update({
        document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/event-help")
    revalidatePath("/student-dashboard/other-services/event-help")
    revalidatePath("/dashboard/other-services/event-help")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading event help documents:", error)
    return { success: false, error }
  }
}

// Filter event help requests
export async function filterEventHelpRequests(filters: {
  status?: string
  requestType?: string
  searchQuery?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("event_help_requests")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.requestType && filters.requestType !== "all") {
      query = query.eq("request_type", filters.requestType)
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        query = query.gte("event_date", filters.dateRange.start)
      }
      
      if (filters.dateRange.end) {
        query = query.lte("event_date", filters.dateRange.end)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,event_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,event_location.ilike.%${searchTerm}%,user.name.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering event help requests:", error)
    return { success: false, error }
  }
}
