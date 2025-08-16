"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for lost and found items
export type LostFoundItem = {
  id: string
  user_id: string
  item_id: string
  title: string
  description: string
  category: string
  location: string
  date_found?: string
  date_lost?: string
  status: "lost" | "found" | "claimed" | "returned"
  item_type: "lost" | "found"
  image_urls?: string[]
  contact_info: string
  created_at: string
  updated_at: string
  claimed_at?: string
  claimed_by?: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  claimedByUser?: {
    id: string
    name: string
    email: string
    role: string
  }
}

export type LostFoundComment = {
  id: string
  item_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  created_at: string
  user?: {
    name: string
  }
}

export type LostFoundReaction = {
  id: string
  item_id: string
  user_id: string
  reaction_type: 'helpful' | 'found_it' | 'interested' | 'thumbs_up'
  created_at: string
}

// Get all lost and found items
export async function getAllLostFoundItems() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .select(`
        *,
        user:user_id(*),
        claimedByUser:claimed_by(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching lost and found items:", error)
    return { success: false, error }
  }
}

// Get lost and found items by user ID
export async function getLostFoundItemsByUserId(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .select(`
        *,
        user:user_id(*),
        claimedByUser:claimed_by(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching user's lost and found items:", error)
    return { success: false, error }
  }
}

// Get lost and found item by ID
export async function getLostFoundItemById(itemId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .select(`
        *,
        user:user_id(*),
        claimedByUser:claimed_by(*)
      `)
      .eq("id", itemId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching lost and found item:", error)
    return { success: false, error }
  }
}

// Create a new lost or found item
export async function createLostFoundItem(item: Omit<LostFoundItem, "id" | "item_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate an item ID based on whether it's lost or found
    const prefix = item.item_type === "lost" ? "LOST" : "FOUND"
    const itemId = `${prefix}-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .insert({
        ...item,
        item_id: itemId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating lost and found item:", error)
    return { success: false, error }
  }
}

// Update a lost or found item
export async function updateLostFoundItem(itemId: string, updates: Partial<LostFoundItem>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to claimed or returned, set claimed_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if ((updates.status === "claimed" || updates.status === "returned") && !updates.claimed_at) {
      updatedData.claimed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .update(updatedData)
      .eq("id", itemId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating lost and found item:", error)
    return { success: false, error }
  }
}

// Get comments for a lost or found item
export async function getLostFoundComments(itemId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("item_id", itemId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching lost and found comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a lost or found item
export async function addLostFoundComment(
  itemId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_comments")
      .insert({
        item_id: itemId,
        user_id: userId,
        user_type: userType,
        comment
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding lost and found comment:", error)
    return { success: false, error }
  }
}

// Upload images for a lost or found item
export async function uploadLostFoundImages(itemId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current item to retrieve existing image URLs
    const { data: item, error: fetchError } = await supabase
      .from("lost_found_items")
      .select("image_urls")
      .eq("id", itemId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = item.image_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `lost_found/${itemId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lost_found")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("lost_found").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the item with the new image URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("lost_found_items")
      .update({
        image_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", itemId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true, data, imageUrls: newUrls }
  } catch (error) {
    console.error("Error uploading lost and found images:", error)
    return { success: false, error }
  }
}

// Filter lost and found items
export async function filterLostFoundItems(filters: {
  status?: string
  itemType?: "lost" | "found" | "all"
  category?: string
  searchQuery?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("lost_found_items")
      .select(`
        *,
        user:user_id(*),
        claimedByUser:claimed_by(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.itemType && filters.itemType !== "all") {
      query = query.eq("item_type", filters.itemType.toLowerCase())
    }
    
    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
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
        `item_id.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,user.name.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering lost and found items:", error)
    return { success: false, error }
  }
}

// Add reaction to lost and found item
export async function addLostFoundReaction(
  itemId: string,
  userId: string,
  reactionType: 'helpful' | 'found_it' | 'interested' | 'thumbs_up'
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_reactions")
      .insert({
        item_id: itemId,
        user_id: userId,
        reaction_type: reactionType
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding lost and found reaction:", error)
    return { success: false, error }
  }
}

// Remove reaction from lost and found item
export async function removeLostFoundReaction(
  itemId: string,
  userId: string,
  reactionType: 'helpful' | 'found_it' | 'interested' | 'thumbs_up'
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from("lost_found_reactions")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/lost-found")
    revalidatePath("/student-dashboard/other-services/lost-found")
    revalidatePath("/dashboard/other-services/lost-found")
    
    return { success: true }
  } catch (error) {
    console.error("Error removing lost and found reaction:", error)
    return { success: false, error }
  }
}

// Get reactions for a lost and found item
export async function getLostFoundReactions(itemId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("lost_found_reactions")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching lost and found reactions:", error)
    return { success: false, error }
  }
}
