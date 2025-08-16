-- Schema for the Nearby Cafeteria Module

-- 1. Create custom type for cafeteria category (idempotent)
DO $$
BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'cafeteria_type';
  IF NOT FOUND THEN
    CREATE TYPE cafeteria_type AS ENUM ('cafeteria', 'mess', 'cafe_mess');
  END IF;
END$$;

-- 2. Create the main cafeterias table
CREATE TABLE IF NOT EXISTS cafeterias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type cafeteria_type NOT NULL,
    address TEXT,
    contact_info TEXT,
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT cafeterias_name_unique UNIQUE (name)
);

-- 3. Create the menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 4. Create the mess details table for tiffin rates
CREATE TABLE IF NOT EXISTS mess_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE NOT NULL UNIQUE,
    one_time_rate NUMERIC(10, 2),
    two_time_rate NUMERIC(10, 2)
);

-- 5. Enable RLS for all tables
ALTER TABLE cafeterias ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_details ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Allow all authenticated users to view data
DROP POLICY IF EXISTS "Allow all authenticated users to view cafeterias" ON cafeterias;
CREATE POLICY "Allow all authenticated users to view cafeterias" ON cafeterias
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all authenticated users to view menu items" ON menu_items;
CREATE POLICY "Allow all authenticated users to view menu items" ON menu_items
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all authenticated users to view mess details" ON mess_details;
CREATE POLICY "Allow all authenticated users to view mess details" ON mess_details
FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Helpful indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_cafeteria_id ON menu_items(cafeteria_id);
CREATE INDEX IF NOT EXISTS idx_cafeterias_type ON cafeterias(type);

-- 8. Pre-populate the cafeterias table with initial data (idempotent)
INSERT INTO cafeterias (name, type)
VALUES
    ('Sumit Canteen & Mess', 'cafe_mess'),
    ('Cafe Corner (CC)', 'cafeteria'),
    ('HP Cafe', 'cafeteria'),
    ('Sweet and Treats (SNT)', 'cafeteria'),
    ('Bharti Mess & Cafe', 'cafe_mess'),
    ('Vaishnavi', 'cafeteria'),
    ('Dibre Mess', 'mess')
ON CONFLICT (name) DO NOTHING;
