# Updated Database Types

This document shows the updated database types with the missing columns added to the students and faculty tables.

## Students Table Updates

The `students` table needs to be updated to include the following columns:
- `face_data` (JSONB)
- `face_url` (TEXT)
- `face_registered` (BOOLEAN)
- `face_registered_at` (TIMESTAMP WITH TIME ZONE)
- `password_hash` (TEXT)

## Faculty Table Updates

The `faculty` table needs to be updated to include the following columns:
- `face_data` (JSONB)
- `face_url` (TEXT)
- `face_registered` (BOOLEAN)
- `face_registered_at` (TIMESTAMP WITH TIME ZONE)
- `password_hash` (TEXT)
- `designation` (TEXT)
- `qualification` (TEXT)
- `experience_years` (INTEGER)

These updates will align the database types with the actual database schema and the code expectations in the approve-registration API.