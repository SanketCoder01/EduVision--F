const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://jtguryzyprgqraimyimt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .limit(1);

  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data found, can't infer schema.");

    // Attempt an invalid insert to get the schema from error message
    const { error: insErr } = await supabase.from('assignment_submissions').insert([{ invalid_col: 1 }]);
    console.log("Insert error:", insErr);
  }
}

check();
