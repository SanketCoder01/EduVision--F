# EduVision - Complete Module Setup Script
# This script sets up Timetable and Study Materials with real Supabase integration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EduVision Complete Module Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "app")) {
    Write-Host "Error: Please run this script from the EduVision root directory" -ForegroundColor Red
    exit 1
}

# 1. Setup Timetable Module
Write-Host "1. Setting up Timetable Module..." -ForegroundColor Yellow
Write-Host ""

# Faculty Timetable
$facultyTimetableOld = "app\dashboard\timetable\page.tsx"
$facultyTimetableBackup = "app\dashboard\timetable\page-old-backup.tsx"
$facultyTimetableNew = "app\dashboard\timetable\page-real.tsx"

if (Test-Path $facultyTimetableOld) {
    Write-Host "   - Backing up faculty timetable..." -ForegroundColor Gray
    Move-Item -Path $facultyTimetableOld -Destination $facultyTimetableBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $facultyTimetableNew) {
    Write-Host "   - Activating new faculty timetable..." -ForegroundColor Gray
    Move-Item -Path $facultyTimetableNew -Destination $facultyTimetableOld -Force
    Write-Host "   ✓ Activated page-real.tsx as page.tsx" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error: page-real.tsx not found!" -ForegroundColor Red
    exit 1
}

# Student Timetable
$studentTimetableOld = "app\student-dashboard\timetable\page.tsx"
$studentTimetableBackup = "app\student-dashboard\timetable\page-old-backup.tsx"
$studentTimetableNew = "app\student-dashboard\timetable\page-real.tsx"

if (Test-Path $studentTimetableOld) {
    Write-Host "   - Backing up student timetable..." -ForegroundColor Gray
    Move-Item -Path $studentTimetableOld -Destination $studentTimetableBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $studentTimetableNew) {
    Write-Host "   - Activating new student timetable..." -ForegroundColor Gray
    Move-Item -Path $studentTimetableNew -Destination $studentTimetableOld -Force
    Write-Host "   ✓ Activated page-real.tsx as page.tsx" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error: page-real.tsx not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Setup Study Materials Module
Write-Host "2. Setting up Study Materials Module..." -ForegroundColor Yellow
Write-Host ""

# Faculty Study Materials
$facultyMaterialsOld = "app\dashboard\study-materials\page.tsx"
$facultyMaterialsBackup = "app\dashboard\study-materials\page-old-backup.tsx"
$facultyMaterialsNew = "app\dashboard\study-materials\page-real.tsx"

if (Test-Path $facultyMaterialsOld) {
    Write-Host "   - Backing up faculty study materials..." -ForegroundColor Gray
    Move-Item -Path $facultyMaterialsOld -Destination $facultyMaterialsBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $facultyMaterialsNew) {
    Write-Host "   - Activating new faculty study materials..." -ForegroundColor Gray
    Move-Item -Path $facultyMaterialsNew -Destination $facultyMaterialsOld -Force
    Write-Host "   ✓ Activated page-real.tsx as page.tsx" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error: page-real.tsx not found!" -ForegroundColor Red
    exit 1
}

# Student Study Materials
$studentMaterialsOld = "app\student-dashboard\study-materials\page.tsx"
$studentMaterialsBackup = "app\student-dashboard\study-materials\page-old-backup.tsx"
$studentMaterialsNew = "app\student-dashboard\study-materials\page-real.tsx"

if (Test-Path $studentMaterialsOld) {
    Write-Host "   - Backing up student study materials..." -ForegroundColor Gray
    Move-Item -Path $studentMaterialsOld -Destination $studentMaterialsBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $studentMaterialsNew) {
    Write-Host "   - Activating new student study materials..." -ForegroundColor Gray
    Move-Item -Path $studentMaterialsNew -Destination $studentMaterialsOld -Force
    Write-Host "   ✓ Activated page-real.tsx as page.tsx" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error: page-real.tsx not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Modules Activated:" -ForegroundColor Yellow
Write-Host "  ✓ Timetable (Faculty + Student)" -ForegroundColor Green
Write-Host "  ✓ Study Materials (Faculty + Student)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run SQL migrations in Supabase Dashboard:" -ForegroundColor White
Write-Host "   - FINAL_YEAR_FIX_V2.sql (FIRST!)" -ForegroundColor White
Write-Host "   - COMPLETE_REALTIME_FIX.sql (SECOND!)" -ForegroundColor White
Write-Host ""
Write-Host "2. Install dependencies:" -ForegroundColor White
Write-Host "   npm install tesseract.js" -ForegroundColor White
Write-Host ""
Write-Host "3. Restart dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Old files backed up as:" -ForegroundColor Gray
Write-Host "  - app/dashboard/timetable/page-old-backup.tsx" -ForegroundColor Gray
Write-Host "  - app/student-dashboard/timetable/page-old-backup.tsx" -ForegroundColor Gray
Write-Host "  - app/dashboard/study-materials/page-old-backup.tsx" -ForegroundColor Gray
Write-Host "  - app/student-dashboard/study-materials/page-old-backup.tsx" -ForegroundColor Gray
Write-Host ""
