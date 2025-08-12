// This script deploys the SQL functions to Supabase
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to read SQL files and deploy them
function deployFunctions() {
  console.log('Deploying SQL functions to Supabase...');
  
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  const sqlFiles = fs.readdirSync(functionsDir).filter(file => file.endsWith('.sql'));
  
  for (const file of sqlFiles) {
    const filePath = path.join(functionsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Write SQL to a temporary file
      const tempFile = path.join(__dirname, 'temp.sql');
      fs.writeFileSync(tempFile, sql);
      
      // Execute SQL using supabase CLI
      console.log(`Deploying function from ${file}...`);
      execSync(`supabase db execute --file ${tempFile}`, { stdio: 'inherit' });
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
      console.log(`Successfully deployed ${file}`);
    } catch (error) {
      console.error(`Error deploying ${file}:`, error.message);
    }
  }
  
  console.log('Deployment completed.');
}

deployFunctions();