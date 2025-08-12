# Database Fix Tools for EduVision

This document provides instructions for fixing database table issues in the EduVision application, specifically addressing missing columns like `address` and `prn` in the `students` table.

## Problem

The application is encountering errors such as:

```
Error creating student: {code: PGRST204, details: null, hint: null, message: Could not find the 'address' column of 'students' in the schema cache}
Error checking PRN: {code: 42703, details: null, hint: null, message: column students.prn does not exist}
```

These errors occur because the database tables are missing required columns that the application code is trying to use.

## Solution

We've created several tools to fix this issue:

### 1. Database Fix Page

A user-friendly web interface is available at `/fix-database` that provides two options:

- **Auto Fix**: Automatically attempts to fix the database tables by creating or updating them with all required columns.
- **Manual SQL**: Allows you to execute custom SQL queries with pre-built templates for creating or altering tables.

### 2. API Endpoints

- `/api/fix-tables`: Executes a series of SQL statements to create or update the tables with all required columns.
- `/api/execute-sql`: Executes custom SQL queries directly against the database.

### 3. SQL Scripts

- `scripts/fix-tables.sql`: Contains SQL statements to create the tables with all required columns.
- `supabase/functions/create_students_table.sql`: Contains a PL/pgSQL function to create the students table.
- `supabase/functions/create_faculty_table.sql`: Contains a PL/pgSQL function to create the faculty table.

## How to Use

### Option 1: Using the Web Interface

1. Start the application with `npm run dev`
2. Navigate to `http://localhost:3003/fix-database`
3. Click the "Fix Database Tables" button in the Auto Fix tab

Or, if you prefer to execute custom SQL:

1. Go to the Manual SQL tab
2. Select a template from the dropdown (e.g., "Add Missing Student Columns")
3. Click "Use Template" to load the SQL
4. Click "Execute SQL" to run the query

### Option 2: Using the API Directly

To fix all tables at once:

```bash
curl -X POST http://localhost:3003/api/fix-tables
```

To execute a custom SQL query:

```bash
curl -X POST http://localhost:3003/api/execute-sql \
  -H "Content-Type: application/json" \
  -d '{"sql":"ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;"}'
```

### Option 3: Using Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
node scripts/deploy-functions.js
```

This will deploy the SQL functions to your Supabase project, which you can then call using the Supabase client.

## Table Schemas

### Students Table

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  department VARCHAR(50) NOT NULL,
  year VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  prn VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Faculty Table

```sql
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  department VARCHAR(50) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  qualification VARCHAR(255),
  experience_years INTEGER DEFAULT 0,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

If you encounter issues with the automatic fix:

1. Try using the Manual SQL tab to execute the ALTER TABLE statements directly
2. Check the Supabase logs for any errors
3. Ensure your Supabase instance has the necessary permissions to create and alter tables

## Notes

- The fix tools will attempt to preserve existing data when possible
- If you're using a production database, make sure to back up your data before running these fixes
- After fixing the database, you may need to restart the application for the changes to take effect