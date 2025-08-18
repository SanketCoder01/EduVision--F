# Updated Database Types - Complete Version

This document shows the updated database types with all missing columns added to the students and faculty tables.

## Students Table Updates

The `students` table needs to be updated to include the following columns:
- `name` (string | null) - NEW COLUMN
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

## Implementation Notes

1. The `name` column is critical for the approve-registration API to work correctly
2. All face-related columns should be added to support the facial recognition features
3. Password hash column is needed for authentication
4. Faculty-specific columns (`designation`, `qualification`, `experience_years`) are needed for complete faculty profiles

These updates will align the database types with the actual database schema and the code expectations in the approve-registration API.