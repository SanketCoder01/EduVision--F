import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk4MjE1MywiZXhwIjoyMDYyNTU4MTUzfQ.eHe-6gghZ663u2Z14hE0t6Ame3Y-1K4ABJB_cac8d3g'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function seedUser() {
  console.log("Creating/updating user sumit@cafe.in...")
  
  // Try to find the user first
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error("Error listing users:", listError.message)
    return
  }
  
  const existingUser = existingUsers.users.find(u => u.email === 'sumit@cafe.in')
  
  if (existingUser) {
    console.log("User already exists. Updating password...")
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: 'Cafe@123',
      email_confirm: true
    })
    if (error) console.error("Password update failed:", error.message)
    else console.log("Password updated successfully! User ID:", data.user?.id)
  } else {
    console.log("User does not exist. Creating...")
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'sumit@cafe.in',
      password: 'Cafe@123',
      email_confirm: true
    })
    if (error) console.error("User creation failed:", error.message)
    else console.log("User created successfully! User ID:", data.user?.id)
  }
}

seedUser()
