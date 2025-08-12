require('dotenv').config();
global.fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

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

function isHashed(password) {
    return typeof password === 'string' && password.startsWith('$2');
}

async function migratePasswords() {
    try {
        console.log('Connecting to Supabase...');
        const { data: students, error } = await supabase.from('students').select('id,prn,password');
        
        if (error) {
            console.error('Error fetching students:', error);
            process.exit(1);
        }

        if (!students || !students.length) {
            console.log('No students found in the database');
            process.exit(0);
        }

        console.log(`Found ${students.length} students`);
        let updated = 0;

        for (const student of students) {
            if (!student.password || isHashed(student.password)) {
                console.log(`Skipping student ${student.prn} - password already hashed or empty`);
                continue;
            }

            try {
                const hashedPassword = await bcrypt.hash(student.password, 10);
                const { error: updateError } = await supabase
                    .from('students')
                    .update({ password: hashedPassword })
                    .eq('id', student.id);

                if (updateError) {
                    console.error(`Error updating student ${student.prn}:`, updateError);
                    continue;
                }

                updated++;
                console.log(`Updated password for student ${student.prn}`);
            } catch (hashError) {
                console.error(`Error hashing password for student ${student.prn}:`, hashError);
            }
        }

        console.log(`Successfully hashed passwords for ${updated} students`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migratePasswords();