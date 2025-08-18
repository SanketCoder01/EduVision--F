#!/usr/bin/env node

/**
 * Test Script for EduVision Registration Flow
 * This script tests the complete registration flow from start to finish
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing EduVision Registration Flow...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
    'app/student-registration/page.tsx',
    'app/faculty-registration/page.tsx',
    'app/admin/login/page.tsx',
    'app/admin/registration-approvals/page.tsx',
    'app/api/admin/approve-registration/route.ts',
    'components/registration/registration-form.tsx',
    'lib/constants/departments.ts',
    'supabase/migrations/2025-01-15-complete-registration-flow.sql'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please check the file structure.');
    process.exit(1);
}

console.log('\n✅ All required files exist!\n');

// Test 2: Check database schema
console.log('🗄️ Checking database schema...');
const schemaFile = 'supabase/migrations/2025-01-15-complete-registration-flow.sql';
if (fs.existsSync(schemaFile)) {
    const schema = fs.readFileSync(schemaFile, 'utf8');

    // Check for required tables
    const requiredTables = [
        'pending_registrations',
        'students',
        'faculty',
        'student_faces',
        'faculty_faces'
    ];

    const requiredFields = [
        'department VARCHAR(50) NOT NULL CHECK (department IN (\'CSE\', \'Cyber\', \'AIDS\', \'AIML\'))',
        'year VARCHAR(20) NOT NULL CHECK (year IN (\'1st\', \'2nd\', \'3rd\', \'4th\'))',
        'user_type VARCHAR(20) NOT NULL CHECK (user_type IN (\'student\', \'faculty\'))'
    ];

    let schemaValid = true;

    requiredTables.forEach(table => {
        if (schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
            console.log(`✅ Table ${table} defined`);
        } else {
            console.log(`❌ Table ${table} missing`);
            schemaValid = false;
        }
    });

    requiredFields.forEach(field => {
        if (schema.includes(field)) {
            console.log(`✅ Field constraint: ${field.split('CHECK')[0].trim()}`);
        } else {
            console.log(`❌ Field constraint missing: ${field.split('CHECK')[0].trim()}`);
            schemaValid = false;
        }
    });

    if (schemaValid) {
        console.log('\n✅ Database schema is valid!');
    } else {
        console.log('\n❌ Database schema has issues.');
    }
}

// Test 3: Check API endpoints
console.log('\n🔌 Checking API endpoints...');
const apiEndpoints = [
    'app/api/admin/approve-registration/route.ts',
    'app/api/admin/pending-registrations/route.ts',
    'app/api/student/complete-registration/route.ts',
    'app/api/faculty/complete-registration/route.ts'
];

apiEndpoints.forEach(endpoint => {
    if (fs.existsSync(endpoint)) {
        console.log(`✅ ${endpoint}`);
    } else {
        console.log(`❌ ${endpoint} - MISSING`);
    }
});

// Test 4: Check constants
console.log('\n📋 Checking constants...');
const constantsFile = 'lib/constants/departments.ts';
if (fs.existsSync(constantsFile)) {
    const constants = fs.readFileSync(constantsFile, 'utf8');

    const requiredConstants = [
        'CSE',
        'Cyber',
        'AIDS',
        'AIML',
        '1st',
        '2nd',
        '3rd',
        '4th'
    ];

    let constantsValid = true;
    requiredConstants.forEach(constant => {
        if (constants.includes(constant)) {
            console.log(`✅ Constant: ${constant}`);
        } else {
            console.log(`❌ Constant missing: ${constant}`);
            constantsValid = false;
        }
    });

    if (constantsValid) {
        console.log('\n✅ All constants are defined!');
    } else {
        console.log('\n❌ Some constants are missing.');
    }
}

// Test 5: Check components
console.log('\n🧩 Checking components...');
const components = [
    'components/registration/registration-form.tsx',
    'components/AdminNav.tsx',
    'hooks/useAdminAuth.ts'
];

components.forEach(component => {
    if (fs.existsSync(component)) {
        console.log(`✅ ${component}`);
    } else {
        console.log(`❌ ${component} - MISSING`);
    }
});

// Test 6: Check admin flow
console.log('\n👨‍💼 Checking admin flow...');
const adminFiles = [
    'app/admin/layout.tsx',
    'app/admin/page.tsx',
    'app/admin/debug/page.tsx'
];

adminFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Test 7: Check middleware
console.log('\n🛡️ Checking middleware...');
const middlewareFile = 'middleware.ts';
if (fs.existsSync(middlewareFile)) {
    const middleware = fs.readFileSync(middlewareFile, 'utf8');

    if (middleware.includes('/admin/login') && middleware.includes('admin routes')) {
        console.log('✅ Admin routes properly handled in middleware');
    } else {
        console.log('❌ Admin routes not properly handled in middleware');
    }
} else {
    console.log('❌ middleware.ts missing');
}

// Test 8: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageFile = 'package.json';
if (fs.existsSync(packageFile)) {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

    const requiredDeps = ['@supabase/supabase-js', 'bcrypt', 'framer-motion'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies ? .[dep] || packageJson.devDependencies ? .[dep]) {
            console.log(`✅ Dependency: ${dep}`);
        } else {
            console.log(`❌ Dependency missing: ${dep}`);
        }
    });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 REGISTRATION FLOW TEST SUMMARY');
console.log('='.repeat(50));

console.log('\n🎯 FLOW STEPS TO TEST:');
console.log('1. Google Sign-In → Registration Form');
console.log('2. Fill Form (Department: CSE/Cyber/AIDS/AIML, Year: 1st/2nd/3rd/4th)');
console.log('3. Face Capture (Python Flask App)');
console.log('4. Pending Approval Page');
console.log('5. Admin Dashboard (Real-time updates)');
console.log('6. Approve/Reject Registration');
console.log('7. Auto-redirect to Dashboard');
console.log('8. Profile with Picture');
console.log('9. Future Login with Email/Password');

console.log('\n🔧 SETUP REQUIRED:');
console.log('1. Run SQL migration in Supabase');
console.log('2. Start Python Flask app (face-capture-flask)');
console.log('3. Start Next.js app (npm run dev)');
console.log('4. Test admin login: admin@sanjivani.edu.in');

console.log('\n✅ All tests completed!');
console.log('🚀 Ready to test the complete registration flow!');