"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for cafeterias and menu items
export type Cafeteria = {
  id: string
  name: string
  description: string
  location: string
  contact_number?: string
  email?: string
  opening_time: string
  closing_time: string
  is_open_weekends: boolean
  image_url?: string
  rating?: number
  created_at: string
  updated_at: string
}

export type CafeteriaMenuItem = {
  id: string
  cafeteria_id: string
  name: string
  description?: string
  price: number
  category: "breakfast" | "lunch" | "dinner" | "snacks" | "beverages" | "desserts"
  is_vegetarian: boolean
  is_available: boolean
  image_url?: string
  created_at: string
  updated_at: string
  cafeteria?: Cafeteria
}

// Get all cafeterias
export async function getAllCafeterias() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeterias")
      .select()
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching cafeterias:", error)
    return { success: false, error }
  }
}

// Get cafeteria by ID
export async function getCafeteriaById(cafeteriaId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeterias")
      .select()
      .eq("id", cafeteriaId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching cafeteria:", error)
    return { success: false, error }
  }
}

// Create a new cafeteria
export async function createCafeteria(cafeteria: Omit<Cafeteria, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeterias")
      .insert(cafeteria)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating cafeteria:", error)
    return { success: false, error }
  }
}

// Update a cafeteria
export async function updateCafeteria(cafeteriaId: string, updates: Partial<Cafeteria>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("cafeterias")
      .update(updatedData)
      .eq("id", cafeteriaId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating cafeteria:", error)
    return { success: false, error }
  }
}

// Delete a cafeteria
export async function deleteCafeteria(cafeteriaId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // First delete all menu items associated with this cafeteria
    const { error: menuItemsError } = await supabase
      .from("cafeteria_menu_items")
      .delete()
      .eq("cafeteria_id", cafeteriaId)
    
    if (menuItemsError) throw menuItemsError
    
    // Then delete the cafeteria
    const { error } = await supabase
      .from("cafeterias")
      .delete()
      .eq("id", cafeteriaId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting cafeteria:", error)
    return { success: false, error }
  }
}

// Upload cafeteria image
export async function uploadCafeteriaImage(cafeteriaId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `cafeterias/${cafeteriaId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cafeterias")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("cafeterias").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the cafeteria with the image URL
    const { data, error } = await supabase
      .from("cafeterias")
      .update({
        image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", cafeteriaId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data, imageUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading cafeteria image:", error)
    return { success: false, error }
  }
}

// Get all menu items for a cafeteria
export async function getCafeteriaMenuItems(cafeteriaId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeteria_menu_items")
      .select()
      .eq("cafeteria_id", cafeteriaId)
      .order("category", { ascending: true })
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching cafeteria menu items:", error)
    return { success: false, error }
  }
}

// Get menu item by ID
export async function getMenuItemById(menuItemId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeteria_menu_items")
      .select(`
        *,
        cafeteria:cafeteria_id(*)
      `)
      .eq("id", menuItemId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return { success: false, error }
  }
}

// Create a new menu item
export async function createMenuItem(menuItem: Omit<CafeteriaMenuItem, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("cafeteria_menu_items")
      .insert(menuItem)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating menu item:", error)
    return { success: false, error }
  }
}

// Update a menu item
export async function updateMenuItem(menuItemId: string, updates: Partial<CafeteriaMenuItem>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("cafeteria_menu_items")
      .update(updatedData)
      .eq("id", menuItemId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating menu item:", error)
    return { success: false, error }
  }
}

// Delete a menu item
export async function deleteMenuItem(menuItemId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from("cafeteria_menu_items")
      .delete()
      .eq("id", menuItemId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return { success: false, error }
  }
}

// Upload menu item image
export async function uploadMenuItemImage(menuItemId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the cafeteria ID for this menu item
    const { data: menuItem, error: menuItemError } = await supabase
      .from("cafeteria_menu_items")
      .select("cafeteria_id")
      .eq("id", menuItemId)
      .single()
    
    if (menuItemError) throw menuItemError
    
    // Generate a unique file path
    const filePath = `cafeterias/${menuItem.cafeteria_id}/menu_items/${menuItemId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cafeterias")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("cafeterias").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the menu item with the image URL
    const { data, error } = await supabase
      .from("cafeteria_menu_items")
      .update({
        image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", menuItemId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/cafeterias")
    revalidatePath("/student-dashboard/other-services/cafeterias")
    revalidatePath("/dashboard/other-services/cafeterias")
    
    return { success: true, data, imageUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading menu item image:", error)
    return { success: false, error }
  }
}

// Filter cafeterias
export async function filterCafeterias(filters: {
  searchQuery?: string
  isOpenNow?: boolean
  isOpenWeekends?: boolean
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("cafeterias")
      .select()
    
    // Apply filters
    if (filters.isOpenWeekends !== undefined) {
      query = query.eq("is_open_weekends", filters.isOpenWeekends)
    }
    
    if (filters.isOpenNow) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      query = query.lte("opening_time", currentTime).gte("closing_time", currentTime)
      
      // If it's a weekend, also check is_open_weekends
      const isWeekend = now.getDay() === 0 || now.getDay() === 6
      if (isWeekend) {
        query = query.eq("is_open_weekends", true)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering cafeterias:", error)
    return { success: false, error }
  }
}

// Filter menu items
export async function filterMenuItems(cafeteriaId: string, filters: {
  category?: string
  isVegetarian?: boolean
  isAvailable?: boolean
  searchQuery?: string
  maxPrice?: number
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("cafeteria_menu_items")
      .select()
      .eq("cafeteria_id", cafeteriaId)
    
    // Apply filters
    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category.toLowerCase())
    }
    
    if (filters.isVegetarian !== undefined) {
      query = query.eq("is_vegetarian", filters.isVegetarian)
    }
    
    if (filters.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable)
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query
      .order("category", { ascending: true })
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering menu items:", error)
    return { success: false, error }
  }
}
