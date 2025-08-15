"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for suggestions
export type Suggestion = {
  id: string
  user_id: string
  suggestion_id: string
  title: string
  description: string
  category: string
  status: "pending" | "under_review" | "implemented" | "rejected"
  is_anonymous: boolean
  upvotes: number
  document_urls?: string[]
  created_at: string
  updated_at: string
  implemented_at?: string
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

export type SuggestionComment = {
  id: string
  suggestion_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_internal: boolean
  created_at: string
  user?: {
    name: string
  }
}

export type SuggestionUpvote = {
  id: string
  suggestion_id: string
  user_id: string
  created_at: string
}

// Get all suggestions
export async function getAllSuggestions() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestions")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return { success: false, error }
  }
}

// Get suggestions by user ID
export async function getSuggestionsByUserId(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestions")
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
    console.error("Error fetching user suggestions:", error)
    return { success: false, error }
  }
}

// Get suggestion by ID
export async function getSuggestionById(suggestionId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestions")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("id", suggestionId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching suggestion:", error)
    return { success: false, error }
  }
}

// Create a new suggestion
export async function createSuggestion(suggestion: Omit<Suggestion, "id" | "suggestion_id" | "created_at" | "updated_at" | "upvotes">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a suggestion ID
    const suggestionId = `SUG-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("suggestions")
      .insert({
        ...suggestion,
        suggestion_id: suggestionId,
        upvotes: 0
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return { success: false, error }
  }
}

// Update a suggestion
export async function updateSuggestion(suggestionId: string, updates: Partial<Suggestion>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to implemented, set implemented_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if (updates.status === "implemented" && !updates.implemented_at) {
      updatedData.implemented_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("suggestions")
      .update(updatedData)
      .eq("id", suggestionId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating suggestion:", error)
    return { success: false, error }
  }
}

// Get comments for a suggestion
export async function getSuggestionComments(suggestionId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestion_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("suggestion_id", suggestionId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching suggestion comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a suggestion
export async function addSuggestionComment(
  suggestionId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestion_comments")
      .insert({
        suggestion_id: suggestionId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding suggestion comment:", error)
    return { success: false, error }
  }
}

// Upload documents for a suggestion
export async function uploadSuggestionDocuments(suggestionId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current suggestion to retrieve existing document URLs
    const { data: suggestion, error: fetchError } = await supabase
      .from("suggestions")
      .select("document_urls")
      .eq("id", suggestionId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = suggestion.document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `suggestions/${suggestionId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("suggestions")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("suggestions").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the suggestion with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("suggestions")
      .update({
        document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", suggestionId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading suggestion documents:", error)
    return { success: false, error }
  }
}

// Upvote a suggestion
export async function upvoteSuggestion(suggestionId: string, userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the user has already upvoted this suggestion
    const { data: existingUpvote, error: checkError } = await supabase
      .from("suggestion_upvotes")
      .select("*")
      .eq("suggestion_id", suggestionId)
      .eq("user_id", userId)
      .maybeSingle()
    
    if (checkError) throw checkError
    
    // If the user has already upvoted, return early
    if (existingUpvote) {
      return { success: false, error: "You have already upvoted this suggestion" }
    }
    
    // Add the upvote record
    const { data: upvoteData, error: upvoteError } = await supabase
      .from("suggestion_upvotes")
      .insert({
        suggestion_id: suggestionId,
        user_id: userId
      })
      .select()
    
    if (upvoteError) throw upvoteError
    
    // Get the current suggestion to update the upvote count
    const { data: suggestion, error: fetchError } = await supabase
      .from("suggestions")
      .select("upvotes")
      .eq("id", suggestionId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Increment the upvote count
    const { data, error } = await supabase
      .from("suggestions")
      .update({
        upvotes: (suggestion.upvotes || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", suggestionId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error upvoting suggestion:", error)
    return { success: false, error }
  }
}

// Remove an upvote from a suggestion
export async function removeUpvote(suggestionId: string, userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Delete the upvote record
    const { error: deleteError } = await supabase
      .from("suggestion_upvotes")
      .delete()
      .eq("suggestion_id", suggestionId)
      .eq("user_id", userId)
    
    if (deleteError) throw deleteError
    
    // Get the current suggestion to update the upvote count
    const { data: suggestion, error: fetchError } = await supabase
      .from("suggestions")
      .select("upvotes")
      .eq("id", suggestionId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Decrement the upvote count (ensure it doesn't go below 0)
    const { data, error } = await supabase
      .from("suggestions")
      .update({
        upvotes: Math.max(0, (suggestion.upvotes || 0) - 1),
        updated_at: new Date().toISOString()
      })
      .eq("id", suggestionId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/suggestion-box")
    revalidatePath("/student-dashboard/other-services/suggestion-box")
    revalidatePath("/dashboard/other-services/suggestion-box")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error removing upvote from suggestion:", error)
    return { success: false, error }
  }
}

// Check if a user has upvoted a suggestion
export async function hasUserUpvoted(suggestionId: string, userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("suggestion_upvotes")
      .select("*")
      .eq("suggestion_id", suggestionId)
      .eq("user_id", userId)
      .maybeSingle()
    
    if (error) throw error
    
    return { success: true, hasUpvoted: !!data }
  } catch (error) {
    console.error("Error checking if user has upvoted suggestion:", error)
    return { success: false, error }
  }
}

// Filter suggestions
export async function filterSuggestions(filters: {
  status?: string
  category?: string
  searchQuery?: string
  sortBy?: "newest" | "oldest" | "most_upvotes"
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("suggestions")
      .select(`
        *,
        user:user_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `suggestion_id.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,user.name.ilike.%${searchTerm}%`
      )
    }
    
    // Apply sorting
    if (filters.sortBy === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (filters.sortBy === "most_upvotes") {
      query = query.order("upvotes", { ascending: false })
    } else {
      // Default to newest
      query = query.order("created_at", { ascending: false })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering suggestions:", error)
    return { success: false, error }
  }
}
