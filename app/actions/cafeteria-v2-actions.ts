'use server'

import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export type MenuItem = {
  id: string
  cafeteria_id: string
  name: string
  price: number
  description: string | null
  is_available: boolean
}

export type MessDetails = {
  id: string
  cafeteria_id: string
  one_time_rate: number | null
  two_time_rate: number | null
}

export type Cafeteria = {
  id: string
  name: string
  type: 'cafeteria' | 'mess' | 'cafe_mess'
  address: string | null
  contact_info: string | null
  images: string[] | null
  is_active: boolean
  created_at: string
  menu_items?: MenuItem[]
  mess_details?: MessDetails | null
}

// Fetch all cafeterias with related details (menu items + mess details)
export async function getCafeteriasWithDetails(): Promise<{ success: boolean; data?: Cafeteria[]; error?: any }> {
  noStore()
  const supabase = createServerSupabaseClient()
  try {
    console.log('🔍 Fetching cafeterias...')
    
    // First, try to get just cafeterias without joins
    const { data: basicData, error: basicError } = await supabase
      .from('cafeterias')
      .select('*')
      .order('name', { ascending: true })

    console.log('📊 Basic cafeterias query result:', { basicData, basicError })

    if (basicError) {
      console.error('❌ Basic query failed:', basicError)
      throw basicError
    }

    if (!basicData || basicData.length === 0) {
      console.log('⚠️ No cafeterias found in database')
      return { success: true, data: [] }
    }

    // Now try with joins
    const { data, error } = await supabase
      .from('cafeterias')
      .select(`
        *,
        menu_items (*),
        mess_details (*)
      `)
      .order('name', { ascending: true })

    console.log('📊 Full query result:', { dataCount: data?.length, error })

    if (error) throw error

    const formatted = (data || []).map((c: any) => ({
      ...c,
      // mess_details is 1-1; PostgREST may still return array in some cases
      mess_details: Array.isArray(c.mess_details) ? (c.mess_details[0] || null) : c.mess_details,
    })) as Cafeteria[]

    console.log('✅ Formatted cafeterias:', formatted.length)
    return { success: true, data: formatted }
  } catch (error) {
    console.error('❌ Error getCafeteriasWithDetails:', error)
    return { success: false, error }
  }
}

// Fetch single cafeteria with details
export async function getCafeteriaByIdWithDetails(cafeteriaId: string): Promise<{ success: boolean; data?: Cafeteria; error?: any }> {
  noStore()
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('cafeterias')
      .select(`
        *,
        menu_items (*),
        mess_details (*)
      `)
      .eq('id', cafeteriaId)
      .single()

    if (error) throw error

    const formatted = {
      ...data,
      mess_details: Array.isArray((data as any).mess_details) ? ((data as any).mess_details[0] || null) : (data as any).mess_details,
    } as Cafeteria

    return { success: true, data: formatted }
  } catch (error) {
    console.error('Error getCafeteriaByIdWithDetails:', error)
    return { success: false, error }
  }
}

// Fetch only menu items for a cafeteria
export async function getMenuItemsForCafeteria(cafeteriaId: string): Promise<{ success: boolean; data?: MenuItem[]; error?: any }> {
  noStore()
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('cafeteria_id', cafeteriaId)
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, data: data as MenuItem[] }
  } catch (error) {
    console.error('Error getMenuItemsForCafeteria:', error)
    return { success: false, error }
  }
}

// Fetch mess details for a cafeteria (if exists)
export async function getMessDetailsForCafeteria(cafeteriaId: string): Promise<{ success: boolean; data?: MessDetails | null; error?: any }> {
  noStore()
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('mess_details')
      .select('*')
      .eq('cafeteria_id', cafeteriaId)
      .maybeSingle()

    if (error) throw error
    return { success: true, data: (data as MessDetails) || null }
  } catch (error) {
    console.error('Error getMessDetailsForCafeteria:', error)
    return { success: false, error }
  }
}

// Upload images for a cafeteria
export async function uploadCafeteriaImages(cafeteriaId: string, files: File[]): Promise<{ success: boolean; data?: string[]; error?: any }> {
  const supabase = createServerSupabaseClient()
  try {
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      const filePath = `cafeterias/${cafeteriaId}/${Date.now()}-${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cafeterias')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = await supabase.storage.from('cafeterias').getPublicUrl(filePath)
      if (!urlData) throw new Error('Failed to get public URL for uploaded file')
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Get current images and append new ones
    const { data: currentCafe, error: fetchError } = await supabase
      .from('cafeterias')
      .select('images')
      .eq('id', cafeteriaId)
      .single()
    
    if (fetchError) throw fetchError
    
    const updatedImages = [...(currentCafe.images || []), ...newUrls]
    
    // Update cafeteria with new images
    const { data, error } = await supabase
      .from('cafeterias')
      .update({ images: updatedImages })
      .eq('id', cafeteriaId)
      .select()
    
    if (error) throw error
    
    return { success: true, data: newUrls }
  } catch (error) {
    console.error('Error uploadCafeteriaImages:', error)
    return { success: false, error }
  }
}
