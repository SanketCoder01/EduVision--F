// Usage: node scripts/set-test-student-password.js
// This script sets a plain text password for a student in Supabase for testing purposes.

require('dotenv').config();
global.fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '[PRESENT]' : '[MISSING]');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// Change these values as needed
const PRN = '2124UCEm2059'; // Replace with the PRN you want to update
const PASSWORD = 'sanku99';  // Replace with the password you want to set

async function setStudentPassword() {
    try {
        console.log(`Setting plain text password for PRN ${PRN}...`);
        
        // First check if the student exists
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('id, prn')
            .eq('prn', PRN)
            .single();
        
        if (fetchError) {
            console.error('Error finding student:', fetchError);
            process.exit(1);
        }
        
        if (!student) {
            console.error(`No student found with PRN ${PRN}`);
            process.exit(1);
        }
        
        console.log(`Found student with PRN ${PRN}, ID: ${student.id}`);
        
        // Update the password as plain text (not hashed)
        const { error: updateError } = await supabase
            .from('students')
            .update({ 
                password: PASSWORD,
                status: 'active' 
            })
            .eq('id', student.id);
        
        if (updateError) {
            console.error('Failed to update password:', updateError);
            process.exit(1);
        }
        
        console.log(`Password for PRN ${PRN} updated successfully to '${PASSWORD}' (plain text).`);
        console.log('You can now test login with this PRN and password.');
        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
}

setStudentPassword();