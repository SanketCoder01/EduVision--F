#!/usr/bin/env node

/**
 * Test Script for EduVision Approval Process
 * This script tests the admin approval workflow
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing EduVision Approval Process...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
    'app/api/admin/approve-registration/route.ts',
    'app/api/admin/test-approval/route.ts',
    'app/auth/pending-approval/page.tsx',
    'app/debug-approval/page.tsx',
    'middleware.ts'
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

// Test 2: Check API endpoints
console.log('🔌 Checking API endpoints...');
const apiEndpoints = [
    'app/api/admin/approve-registration/route.ts',
    'app/api/admin/test-approval/route.ts'
];

apiEndpoints.forEach(endpoint => {
    if (fs.existsSync(endpoint)) {
        const content = fs.readFileSync(endpoint, 'utf8');

        // Check for required functions
        if (content.includes('export async function POST') || content.includes('export async function GET')) {
            console.log(`✅ ${endpoint} - API function found`);
        } else {
            console.log(`❌ ${endpoint} - API function missing`);
        }

        // Check for Supabase integration
        if (content.includes('createClient') && content.includes('supabase')) {
            console.log(`✅ ${endpoint} - Supabase integration found`);
        } else {
            console.log(`❌ ${endpoint} - Supabase integration missing`);
        }
    } else {
        console.log(`❌ ${endpoint} - MISSING`);
    }
});

// Test 3: Check pending approval page
console.log('\n📄 Checking pending approval page...');
const pendingPage = 'app/auth/pending-approval/page.tsx';
if (fs.existsSync(pendingPage)) {
    const content = fs.readFileSync(pendingPage, 'utf8');

    // Check for required features
    const requiredFeatures = [
        'checkStatus',
        'router.replace',
        'real-time subscription',
        'pending_registrations'
    ];

    let featuresValid = true;
    requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`✅ Feature: ${feature}`);
        } else {
            console.log(`❌ Feature missing: ${feature}`);
            featuresValid = false;
        }
    });

    if (featuresValid) {
        console.log('\n✅ Pending approval page has all required features!');
    } else {
        console.log('\n❌ Some features are missing from pending approval page.');
    }
}

// Test 4: Check debug page
console.log('\n🐛 Checking debug page...');
const debugPage = 'app/debug-approval/page.tsx';
if (fs.existsSync(debugPage)) {
    const content = fs.readFileSync(debugPage, 'utf8');

    // Check for required features
    const requiredFeatures = [
        'fetchData',
        'test-approval',
        'pending_registrations',
        'students',
        'faculty'
    ];

    let featuresValid = true;
    requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`✅ Feature: ${feature}`);
        } else {
            console.log(`❌ Feature missing: ${feature}`);
            featuresValid = false;
        }
    });

    if (featuresValid) {
        console.log('\n✅ Debug page has all required features!');
    } else {
        console.log('\n❌ Some features are missing from debug page.');
    }
}

// Test 5: Check middleware
console.log('\n🛡️ Checking middleware...');
const middlewareFile = 'middleware.ts';
if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8');

    // Check for required features
    const requiredFeatures = [
        '/debug-approval',
        'admin routes',
        'pending_registrations'
    ];

    let featuresValid = true;
    requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`✅ Feature: ${feature}`);
        } else {
            console.log(`❌ Feature missing: ${feature}`);
            featuresValid = false;
        }
    });

    if (featuresValid) {
        console.log('\n✅ Middleware has all required features!');
    } else {
        console.log('\n❌ Some features are missing from middleware.');
    }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 APPROVAL PROCESS TEST SUMMARY');
console.log('='.repeat(60));

console.log('\n🎯 TESTING STEPS:');
console.log('1. Start Next.js app: npm run dev');
console.log('2. Go to debug page: http://localhost:3000/debug-approval');
console.log('3. Check current data in all tables');
console.log('4. Go to admin dashboard: http://localhost:3000/admin/login');
console.log('5. Approve a pending registration');
console.log('6. Return to debug page and click "Refresh"');
console.log('7. Verify user moved from "Pending" to "Approved" section');
console.log('8. Check if user can access their dashboard');

console.log('\n🔧 TROUBLESHOOTING:');
console.log('• If approval doesn\'t work: Check admin approval API logs');
console.log('• If user stays on pending page: Check pending approval page logic');
console.log('• If tables are empty: Verify database migration was run');
console.log('• If cookie errors: Check browser console and Supabase logs');

console.log('\n📱 DEBUG PAGES:');
console.log('• Main Debug: http://localhost:3000/debug-approval');
console.log('• Admin Debug: http://localhost:3000/admin/debug');
console.log('• Test API: http://localhost:3000/api/admin/test-approval');

console.log('\n✅ All tests completed!');
console.log('🚀 Ready to test the approval process!');