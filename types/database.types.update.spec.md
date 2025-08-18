# Database Types Update Specification

This document specifies the exact changes needed to update the `database.types.ts` file to include the missing `name` column in the `students` table definition.

## Current Students Table Definition (Lines 908-939)

```typescript
students: {
  Row: {
    address: string | null
    department: string | null
    email: string
    id: string
    password: string | null
    phone: string | null
    prn: string | null
    year: string | null
  }
  Insert: {
    address?: string | null
    department?: string | null
    email: string
    id?: string
    password?: string | null
    phone?: string | null
    prn?: string | null
    year?: string | null
  }
  Update: {
    address?: string | null
    department?: string | null
    email?: string
    id?: string
    password?: string | null
    phone?: string | null
    prn?: string | null
    year?: string | null
  }
  Relationships: []
}
```

## Updated Students Table Definition

The `name` column needs to be added to all three sections:

### Row Definition Changes
Add `name: string | null` to the Row interface:

```typescript
Row: {
  address: string | null
  department: string | null
  email: string
  id: string
  name: string | null  // NEW COLUMN
  password: string | null
  phone: string | null
  prn: string | null
  year: string | null
}
```

### Insert Definition Changes
Add `name?: string | null` to the Insert interface:

```typescript
Insert: {
  address?: string | null
  department?: string | null
  email: string
  id?: string
  name?: string | null  // NEW COLUMN
  password?: string | null
  phone?: string | null
  prn?: string | null
  year?: string | null
}
```

### Update Definition Changes
Add `name?: string | null` to the Update interface:

```typescript
Update: {
  address?: string | null
  department?: string | null
  email?: string
  id?: string
  name?: string | null  // NEW COLUMN
  password?: string | null
  phone?: string | null
  prn?: string | null
  year?: string | null
}
```

## Implementation Instructions

To update the `database.types.ts` file:

1. Locate the `students` table definition (around line 908)
2. In the `Row` interface, add `name: string | null` after the `id` field
3. In the `Insert` interface, add `name?: string | null` after the `id` field
4. In the `Update` interface, add `name?: string | null` after the `id` field
5. Ensure proper comma placement in all three sections

## Verification

After making these changes, the approve-registration API should be able to successfully insert the `name` field into the `students` table without encountering the "Could not find the 'name' column" error.