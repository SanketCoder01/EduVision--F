@echo off
echo ========================================
echo Timetable OCR Module Setup
echo ========================================
echo.

echo Step 1: Backing up old files...
if exist "app\dashboard\timetable\page.tsx" (
    move "app\dashboard\timetable\page.tsx" "app\dashboard\timetable\page-old-backup.tsx"
    echo - Faculty page backed up
)

if exist "app\student-dashboard\timetable\page.tsx" (
    move "app\student-dashboard\timetable\page.tsx" "app\student-dashboard\timetable\page-old-backup.tsx"
    echo - Student page backed up
)
echo.

echo Step 2: Activating new OCR-enabled pages...
if exist "app\dashboard\timetable\page-new.tsx" (
    move "app\dashboard\timetable\page-new.tsx" "app\dashboard\timetable\page.tsx"
    echo - Faculty OCR page activated
)

if exist "app\student-dashboard\timetable\page-new.tsx" (
    move "app\student-dashboard\timetable\page-new.tsx" "app\student-dashboard\timetable\page.tsx"
    echo - Student page activated
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Apply database migration in Supabase
echo 2. Run: supabase db push
echo 3. Or manually run: supabase/migrations/20250122_timetables_table.sql
echo.
echo See TIMETABLE_OCR_SETUP.md for detailed instructions
echo.
pause
