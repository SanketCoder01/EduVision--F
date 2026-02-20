# Timetable Module - OCR Integration Setup Guide

## Overview
The timetable module has been completely rebuilt with **OCR (Optical Character Recognition)** capabilities to extract real data from uploaded timetable images. This eliminates static/mock data and provides a real faculty-to-student workflow.

## What's New

### ✅ Removed
- ❌ Static mock timetable data
- ❌ Auto-generated academic events (CIA exams, practical exams, etc.)
- ❌ localStorage-based storage
- ❌ Fake subject lists (Data Structures, Algorithms, etc.)

### ✨ Added
- ✅ **Real OCR extraction** using Tesseract.js
- ✅ **Supabase storage** for timetable files and data
- ✅ **Department/Year filtering** - students only see their timetables
- ✅ **Day-wise schedule display** extracted from actual images
- ✅ **Real-time data sync** between faculty and students

## Files Created/Modified

### New Files
1. **`app/dashboard/timetable/actions.ts`** - Server actions for Supabase operations
2. **`app/dashboard/timetable/page-new.tsx`** - New faculty timetable page with OCR
3. **`app/student-dashboard/timetable/page-new.tsx`** - New student timetable page
4. **`components/timetable/OCRExtractor.tsx`** - OCR extraction component
5. **`supabase/migrations/20250122_timetables_table.sql`** - Database migration

### Dependencies Installed
- `tesseract.js` - OCR library for text extraction from images

## Setup Instructions

### Step 1: Install Dependencies
The dependency has already been installed. Verify by checking:
```bash
npm list tesseract.js
```

### Step 2: Apply Database Migration
Run the migration to create the timetables table:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Manually in Supabase Dashboard
# Go to SQL Editor and run the contents of:
# supabase/migrations/20250122_timetables_table.sql
```

### Step 3: Replace Old Files
Replace the old timetable pages with the new OCR-enabled versions:

```bash
# Faculty timetable page
mv app/dashboard/timetable/page.tsx app/dashboard/timetable/page-old.tsx
mv app/dashboard/timetable/page-new.tsx app/dashboard/timetable/page.tsx

# Student timetable page
mv app/student-dashboard/timetable/page.tsx app/student-dashboard/timetable/page-old.tsx
mv app/student-dashboard/timetable/page-new.tsx app/student-dashboard/timetable/page.tsx
```

### Step 4: Verify Storage Bucket
Ensure the `timetables` storage bucket exists in Supabase:

1. Go to Supabase Dashboard → Storage
2. Check if `timetables` bucket exists
3. If not, the migration will create it automatically

## How It Works

### Faculty Workflow
1. **Upload Image**: Faculty uploads a timetable image (JPG/PNG)
2. **OCR Extraction**: Tesseract.js extracts text from the image
3. **Smart Parsing**: Text is parsed into structured schedule data (day, time, subject, room, faculty)
4. **Review & Save**: Faculty reviews extracted data and saves to Supabase
5. **Student Access**: Students of that department/year can now view the timetable

### Student Workflow
1. **Auto-Fetch**: Student's timetable is automatically fetched based on their department/year
2. **Day-wise View**: Schedule is displayed day-by-day with all lecture details
3. **Calendar View**: Month calendar showing which days have classes
4. **Real Data**: All data comes from faculty-uploaded timetables via OCR

## OCR Extraction Details

### What Gets Extracted
- **Day names**: Monday, Tuesday, Wednesday, etc.
- **Time slots**: 9:00 AM, 10:00-11:00, etc.
- **Subject names**: From the timetable text
- **Room numbers**: Lab names, room codes
- **Faculty names**: If present in the timetable
- **Lecture types**: Lecture, Practical, Tutorial, etc.

### Parsing Algorithm
The OCR component uses intelligent parsing to:
1. Detect day names in the extracted text
2. Find time patterns (HH:MM AM/PM)
3. Extract subject names and details
4. Identify room numbers and faculty names
5. Classify lecture types (Practical, Lab, Lecture, etc.)

### Accuracy Tips
For best OCR results, timetable images should:
- ✅ Be clear and high-resolution
- ✅ Have good contrast (dark text on light background)
- ✅ Be properly aligned (not skewed)
- ✅ Have readable text (not too small)
- ✅ Be in English language

## Database Schema

### `timetables` Table
```sql
- id: UUID (Primary Key)
- faculty_id: UUID (Foreign Key → faculty.id)
- department: TEXT
- year: TEXT
- file_name: TEXT
- file_url: TEXT (Supabase Storage URL)
- file_type: TEXT
- file_size: BIGINT
- schedule_data: JSONB (Extracted schedule)
- uploaded_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### `schedule_data` JSONB Structure
```json
[
  {
    "day": "Monday",
    "lectures": [
      {
        "time": "9:00-10:00",
        "subject": "Data Structures",
        "room": "CS-101",
        "faculty": "Dr. Smith",
        "type": "Lecture"
      }
    ]
  }
]
```

## Security (RLS Policies)

### Faculty Permissions
- ✅ Can upload timetables for their department
- ✅ Can view/edit/delete their own timetables
- ❌ Cannot access other faculty's timetables

### Student Permissions
- ✅ Can view timetables for their department/year only
- ❌ Cannot upload or modify timetables
- ❌ Cannot view other departments' timetables

## Testing

### Test Faculty Upload
1. Login as faculty
2. Go to Dashboard → Timetable
3. Select department and year
4. Upload a timetable image
5. Wait for OCR extraction
6. Review extracted schedule
7. Save to database

### Test Student View
1. Login as student
2. Go to Student Dashboard → Timetable
3. Verify timetable loads for your department/year
4. Check weekly schedule view
5. Check calendar view
6. Verify all lecture details are correct

## Troubleshooting

### OCR Not Working
- **Issue**: OCR extraction fails or shows errors
- **Solution**: 
  - Check image quality and format (JPG/PNG only)
  - Ensure tesseract.js is installed: `npm install tesseract.js`
  - Check browser console for errors

### No Timetable Showing for Students
- **Issue**: Student sees "No timetable available"
- **Solution**:
  - Verify faculty uploaded timetable for that department/year
  - Check department and year values match exactly
  - Verify RLS policies are applied correctly

### Upload Fails
- **Issue**: Timetable upload fails
- **Solution**:
  - Check Supabase storage bucket exists
  - Verify faculty is authenticated
  - Check file size (should be reasonable)
  - Check network connection

### Incorrect Extraction
- **Issue**: OCR extracts wrong data
- **Solution**:
  - Use clearer, higher-resolution images
  - Ensure timetable has standard format
  - Review and manually correct extracted data if needed
  - Consider using images with better contrast

## Future Enhancements

### Potential Improvements
- 📝 Manual editing of extracted schedule
- 🔄 Re-run OCR on same file
- 📊 Export schedule to PDF/Excel
- 🔔 Notifications when new timetable is uploaded
- 📱 Mobile app support
- 🌐 Multi-language OCR support
- 🤖 AI-powered schedule optimization
- 📅 Integration with Google Calendar

## Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Check Supabase logs
4. Verify database migrations applied
5. Test with sample timetable images

## Summary

✅ **Completed Features**:
- OCR-based timetable extraction
- Supabase storage and database
- Faculty upload interface
- Student viewing interface
- Department/year filtering
- Day-wise and calendar views
- Real-time data synchronization

❌ **Removed**:
- All static/mock data
- Auto-generated academic events
- localStorage usage
- Fake subject lists

🎯 **Result**: A fully functional, real-data timetable system with OCR capabilities!
