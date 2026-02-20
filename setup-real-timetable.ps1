# EduVision - Setup Real Timetable (No Static Data)
# This script replaces old timetable files with new real Supabase + OCR versions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EduVision Real-Time Timetable Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Faculty Dashboard Timetable
Write-Host "1. Setting up Faculty Timetable..." -ForegroundColor Yellow

$facultyOld = "app\dashboard\timetable\page.tsx"
$facultyBackup = "app\dashboard\timetable\page-old-backup.tsx"
$facultyNew = "app\dashboard\timetable\page-real.tsx"

if (Test-Path $facultyOld) {
    Write-Host "   - Backing up old faculty timetable..." -ForegroundColor Gray
    Move-Item -Path $facultyOld -Destination $facultyBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $facultyNew) {
    Write-Host "   - Activating new faculty timetable..." -ForegroundColor Gray
    Move-Item -Path $facultyNew -Destination $facultyOld -Force
    Write-Host "   ✓ Activated page-real.tsx as page.tsx" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error: page-real.tsx not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Student Dashboard Timetable
Write-Host "2. Setting up Student Timetable..." -ForegroundColor Yellow

$studentOld = "app\student-dashboard\timetable\page.tsx"
$studentBackup = "app\student-dashboard\timetable\page-old-backup.tsx"
$studentNew = "app\student-dashboard\timetable\page-real.tsx"

if (Test-Path $studentOld) {
    Write-Host "   - Backing up old student timetable..." -ForegroundColor Gray
    Move-Item -Path $studentOld -Destination $studentBackup -Force
    Write-Host "   ✓ Backed up to page-old-backup.tsx" -ForegroundColor Green
}

if (Test-Path $studentNew) {
    Write-Host "   - Activating new student timetable..." -ForegroundColor Gray
    Move-Item -Path $studentNew -Destination $studentOld -Force
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
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run COMPLETE_REALTIME_FIX.sql in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Install dependencies: npm install tesseract.js" -ForegroundColor White
Write-Host "3. Restart dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Old files backed up as:" -ForegroundColor Gray
Write-Host "  - $facultyBackup" -ForegroundColor Gray
Write-Host "  - $studentBackup" -ForegroundColor Gray
Write-Host ""
