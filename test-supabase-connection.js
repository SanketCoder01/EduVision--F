const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase URL and ANON KEY
const supabaseUrl = 'https://oqbklsgddbpwtjiuflji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYmtsc2dkZGJwd3RqaXVmbGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODE2NzUsImV4cCI6MjA2OTI1NzY3NX0.jy_xWVei5DoJvvEaSBhxiFgK1nqWWi6KLkXQmEOY1-8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        console.log('URL:', supabaseUrl);

        // Try to get the schema
        const { data, error } = await supabase
            .from('pending_registrations')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Error connecting to Supabase:', error);
            return;
        }

        console.log('Successfully connected to Supabase!');
        console.log('Test query result:', data);
    } catch (err) {
        console.error('Failed to connect to Supabase:', err);
    }
}

testConnection();