const { createClient } = require('@supabase/supabase-js');

// Use the original Supabase URL and ANON KEY that the user confirmed
const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE';

console.log('Testing original Supabase connection...');
console.log('URL:', supabaseUrl);

// Just test if we can resolve the hostname
const dns = require('dns');

dns.lookup('jtguryzyprgqraimyimt.supabase.co', (err, address, family) => {
    if (err) {
        console.error('DNS lookup failed:', err);
        return;
    }
    console.log('DNS lookup successful:');
    console.log('Address:', address);
    console.log('Family:', family);

    // If DNS works, try to connect with Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try a simple query
    supabase
        .from('pending_registrations')
        .select('count')
        .limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.error('Supabase connection error:', error);
            } else {
                console.log('Supabase connection successful!');
                console.log('Data:', data);
            }
        })
        .catch(err => {
            console.error('Supabase connection failed:', err);
        });
});