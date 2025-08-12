// Usage: node scripts/set-student-password.js
// This script sets the password for PRN 2124UCEm2059 to 'sanku99' (hashed) in Supabase.

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PRN = '2124UCEm2059';
const PASSWORD = 'sanku99';

async function setStudentPassword() {
    const hash = await bcrypt.hash(PASSWORD, 10);
    const { error } = await supabase
        .from('students')
        .update({ password: hash, status: 'active' })
        .eq('prn', PRN);
    if (error) {
        console.error('Failed to update password:', error);
        process.exit(1);
    }
    console.log(`Password for PRN ${PRN} updated successfully.`);
}

setStudentPassword();