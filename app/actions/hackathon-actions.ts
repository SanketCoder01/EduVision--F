"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for hackathons and teams
export type Hackathon = {
  id: string
  name: string
  description: string
  rules?: string
  start_date: string
  end_date: string
  registration_deadline: string
  location: string
  organizer_id: string
  organizer_type: "faculty" | "student" | "university"
  max_team_size: number
  min_team_size: number
  prizes?: string
  technologies?: string[]
  status: "upcoming" | "ongoing" | "completed"
  image_url?: string
  website_url?: string
  report_url?: string
  created_at: string
  updated_at: string
  organizer?: {
    id: string
    name: string
    email: string
    department?: string
  }
}

export type HackathonTeam = {
  id: string
  hackathon_id: string
  team_name: string
  project_name: string
  project_description?: string
  technologies_used?: string[]
  github_url?: string
  demo_url?: string
  presentation_url?: string
  leader_id: string
  leader_type: "student" | "faculty"
  is_registered: boolean
  is_submitted: boolean
  submission_time?: string
  rank?: number
  score?: number
  feedback?: string
  created_at: string
  updated_at: string
  hackathon?: Hackathon
  leader?: {
    id: string
    name: string
    email: string
    department?: string
  }
  members?: HackathonTeamMember[]
}

export type HackathonTeamMember = {
  id: string
  team_id: string
  user_id: string
  user_type: "student" | "faculty"
  role?: string
  joined_at: string
  user?: {
    id: string
    name: string
    email: string
    department?: string
  }
}

// Get all hackathons
export async function getAllHackathons() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathons")
      .select(`
        *,
        organizer:organizer_id(*)
      `)
      .order("start_date", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return { success: false, error }
  }
}

// Get hackathon by ID
export async function getHackathonById(hackathonId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathons")
      .select(`
        *,
        organizer:organizer_id(*)
      `)
      .eq("id", hackathonId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return { success: false, error }
  }
}

// Create a new hackathon
export async function createHackathon(hackathon: Omit<Hackathon, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathons")
      .insert(hackathon)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating hackathon:", error)
    return { success: false, error }
  }
}

// Update a hackathon
export async function updateHackathon(hackathonId: string, updates: Partial<Hackathon>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("hackathons")
      .update(updatedData)
      .eq("id", hackathonId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return { success: false, error }
  }
}

// Delete a hackathon
export async function deleteHackathon(hackathonId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // First get all teams for this hackathon
    const { data: teams, error: teamsError } = await supabase
      .from("hackathon_teams")
      .select("id")
      .eq("hackathon_id", hackathonId)
    
    if (teamsError) throw teamsError
    
    // Delete all team members for each team
    for (const team of teams) {
      const { error: membersError } = await supabase
        .from("hackathon_team_members")
        .delete()
        .eq("team_id", team.id)
      
      if (membersError) throw membersError
    }
    
    // Delete all teams
    const { error: deleteTeamsError } = await supabase
      .from("hackathon_teams")
      .delete()
      .eq("hackathon_id", hackathonId)
    
    if (deleteTeamsError) throw deleteTeamsError
    
    // Finally delete the hackathon
    const { error } = await supabase
      .from("hackathons")
      .delete()
      .eq("id", hackathonId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting hackathon:", error)
    return { success: false, error }
  }
}

// Upload hackathon image
export async function uploadHackathonImage(hackathonId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `hackathons/${hackathonId}/image/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("hackathons")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("hackathons").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the hackathon with the image URL
    const { data, error } = await supabase
      .from("hackathons")
      .update({
        image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", hackathonId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data, imageUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading hackathon image:", error)
    return { success: false, error }
  }
}

// Upload hackathon report
export async function uploadHackathonReport(hackathonId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `hackathons/${hackathonId}/report/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("hackathons")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("hackathons").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the hackathon with the report URL
    const { data, error } = await supabase
      .from("hackathons")
      .update({
        report_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", hackathonId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data, reportUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading hackathon report:", error)
    return { success: false, error }
  }
}

// Get all teams for a hackathon
export async function getHackathonTeams(hackathonId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathon_teams")
      .select(`
        *,
        hackathon:hackathon_id(*),
        leader:leader_id(*)
      `)
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching hackathon teams:", error)
    return { success: false, error }
  }
}

// Get team by ID
export async function getTeamById(teamId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathon_teams")
      .select(`
        *,
        hackathon:hackathon_id(*),
        leader:leader_id(*)
      `)
      .eq("id", teamId)
      .single()
    
    if (error) throw error
    
    // Get team members
    const { data: members, error: membersError } = await supabase
      .from("hackathon_team_members")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("team_id", teamId)
      .order("joined_at", { ascending: true })
    
    if (membersError) throw membersError
    
    return { success: true, data: { ...data, members } }
  } catch (error) {
    console.error("Error fetching team:", error)
    return { success: false, error }
  }
}

// Get teams by user ID
export async function getTeamsByUserId(userId: string, userType: "student" | "faculty") {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get teams where user is leader
    const { data: leaderTeams, error: leaderError } = await supabase
      .from("hackathon_teams")
      .select(`
        *,
        hackathon:hackathon_id(*),
        leader:leader_id(*)
      `)
      .eq("leader_id", userId)
      .eq("leader_type", userType)
      .order("created_at", { ascending: false })
    
    if (leaderError) throw leaderError
    
    // Get teams where user is a member
    const { data: memberTeams, error: memberError } = await supabase
      .from("hackathon_team_members")
      .select(`
        team:team_id(
          *,
          hackathon:hackathon_id(*),
          leader:leader_id(*)
        )
      `)
      .eq("user_id", userId)
      .eq("user_type", userType)
      .order("joined_at", { ascending: false })
    
    if (memberError) throw memberError
    
    // Combine and deduplicate teams
    const memberTeamsData = memberTeams.map(item => item.team)
    const allTeams = [...leaderTeams]
    
    // Add member teams that aren't already in the list (where user isn't the leader)
    for (const team of memberTeamsData) {
      if (!allTeams.some(t => t.id === team.id)) {
        allTeams.push(team)
      }
    }
    
    return { success: true, data: allTeams }
  } catch (error) {
    console.error("Error fetching user teams:", error)
    return { success: false, error }
  }
}

// Create a new team
export async function createTeam(team: Omit<HackathonTeam, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the hackathon exists and is open for registration
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("registration_deadline, status")
      .eq("id", team.hackathon_id)
      .single()
    
    if (hackathonError) throw hackathonError
    
    const now = new Date()
    const registrationDeadline = new Date(hackathon.registration_deadline)
    
    if (now > registrationDeadline || hackathon.status === "completed") {
      return { 
        success: false, 
        error: { message: "Registration for this hackathon has closed" } 
      }
    }
    
    // Create the team
    const { data, error } = await supabase
      .from("hackathon_teams")
      .insert({
        ...team,
        is_registered: true
      })
      .select()
    
    if (error) throw error
    
    // Add the leader as a team member
    const { error: memberError } = await supabase
      .from("hackathon_team_members")
      .insert({
        team_id: data[0].id,
        user_id: team.leader_id,
        user_type: team.leader_type,
        role: "Team Leader",
        joined_at: new Date().toISOString()
      })
    
    if (memberError) throw memberError
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, error }
  }
}

// Update a team
export async function updateTeam(teamId: string, updates: Partial<HackathonTeam>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("hackathon_teams")
      .update(updatedData)
      .eq("id", teamId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, error }
  }
}

// Delete a team
export async function deleteTeam(teamId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // First delete all team members
    const { error: membersError } = await supabase
      .from("hackathon_team_members")
      .delete()
      .eq("team_id", teamId)
    
    if (membersError) throw membersError
    
    // Then delete the team
    const { error } = await supabase
      .from("hackathon_teams")
      .delete()
      .eq("id", teamId)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, error }
  }
}

// Get team members
export async function getTeamMembers(teamId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathon_team_members")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("team_id", teamId)
      .order("joined_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching team members:", error)
    return { success: false, error }
  }
}

// Add a team member
export async function addTeamMember(
  teamId: string,
  userId: string,
  userType: "student" | "faculty",
  role?: string
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the team exists and get the hackathon ID
    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .select("hackathon_id")
      .eq("id", teamId)
      .single()
    
    if (teamError) throw teamError
    
    // Check if the hackathon is still open for registration
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("registration_deadline, status, max_team_size")
      .eq("id", team.hackathon_id)
      .single()
    
    if (hackathonError) throw hackathonError
    
    const now = new Date()
    const registrationDeadline = new Date(hackathon.registration_deadline)
    
    if (now > registrationDeadline || hackathon.status === "completed") {
      return { 
        success: false, 
        error: { message: "Registration for this hackathon has closed" } 
      }
    }
    
    // Check if the team is already at maximum capacity
    const { data: members, error: membersError } = await supabase
      .from("hackathon_team_members")
      .select("id")
      .eq("team_id", teamId)
    
    if (membersError) throw membersError
    
    if (members.length >= hackathon.max_team_size) {
      return { 
        success: false, 
        error: { message: "Team is already at maximum capacity" } 
      }
    }
    
    // Check if the user is already a member of this team
    const { data: existingMember, error: existingMemberError } = await supabase
      .from("hackathon_team_members")
      .select()
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .eq("user_type", userType)
    
    if (existingMemberError) throw existingMemberError
    
    if (existingMember && existingMember.length > 0) {
      return { 
        success: false, 
        error: { message: "User is already a member of this team" } 
      }
    }
    
    // Add the member
    const { data, error } = await supabase
      .from("hackathon_team_members")
      .insert({
        team_id: teamId,
        user_id: userId,
        user_type: userType,
        role,
        joined_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding team member:", error)
    return { success: false, error }
  }
}

// Remove a team member
export async function removeTeamMember(teamId: string, userId: string, userType: "student" | "faculty") {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the user is the team leader
    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .select("leader_id, leader_type")
      .eq("id", teamId)
      .single()
    
    if (teamError) throw teamError
    
    if (team.leader_id === userId && team.leader_type === userType) {
      return { 
        success: false, 
        error: { message: "Cannot remove the team leader. Transfer leadership first or delete the team." } 
      }
    }
    
    // Remove the member
    const { error } = await supabase
      .from("hackathon_team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .eq("user_type", userType)
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true }
  } catch (error) {
    console.error("Error removing team member:", error)
    return { success: false, error }
  }
}

// Submit team project
export async function submitTeamProject(
  teamId: string,
  projectDetails: {
    project_name: string
    project_description: string
    technologies_used?: string[]
    github_url?: string
    demo_url?: string
  }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the team exists and get the hackathon ID
    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .select("hackathon_id, is_submitted")
      .eq("id", teamId)
      .single()
    
    if (teamError) throw teamError
    
    if (team.is_submitted) {
      return { 
        success: false, 
        error: { message: "Team has already submitted their project" } 
      }
    }
    
    // Check if the hackathon is still ongoing
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("end_date, status")
      .eq("id", team.hackathon_id)
      .single()
    
    if (hackathonError) throw hackathonError
    
    const now = new Date()
    const endDate = new Date(hackathon.end_date)
    
    if (now > endDate || hackathon.status === "completed") {
      return { 
        success: false, 
        error: { message: "Submission deadline for this hackathon has passed" } 
      }
    }
    
    // Update the team with project details and mark as submitted
    const { data, error } = await supabase
      .from("hackathon_teams")
      .update({
        ...projectDetails,
        is_submitted: true,
        submission_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error submitting team project:", error)
    return { success: false, error }
  }
}

// Upload team presentation
export async function uploadTeamPresentation(teamId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if the team exists and get the hackathon ID
    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .select("hackathon_id")
      .eq("id", teamId)
      .single()
    
    if (teamError) throw teamError
    
    // Generate a unique file path
    const filePath = `hackathons/${team.hackathon_id}/teams/${teamId}/presentation/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("hackathons")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("hackathons").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the team with the presentation URL
    const { data, error } = await supabase
      .from("hackathon_teams")
      .update({
        presentation_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data, presentationUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading team presentation:", error)
    return { success: false, error }
  }
}

// Judge a team
export async function judgeTeam(teamId: string, score: number, feedback: string, rank?: number) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("hackathon_teams")
      .update({
        score,
        feedback,
        rank,
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/hackathons")
    revalidatePath("/student-dashboard/other-services/hackathons")
    revalidatePath("/dashboard/other-services/hackathons")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error judging team:", error)
    return { success: false, error }
  }
}

// Filter hackathons
export async function filterHackathons(filters: {
  status?: string
  searchQuery?: string
  organizerType?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("hackathons")
      .select(`
        *,
        organizer:organizer_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.organizerType && filters.organizerType !== "all") {
      query = query.eq("organizer_type", filters.organizerType.toLowerCase())
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        query = query.gte("start_date", filters.dateRange.start)
      }
      
      if (filters.dateRange.end) {
        query = query.lte("end_date", filters.dateRange.end)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,organizer.name.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("start_date", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering hackathons:", error)
    return { success: false, error }
  }
}
