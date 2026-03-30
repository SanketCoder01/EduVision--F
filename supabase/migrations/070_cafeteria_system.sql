-- ================================================================
-- Migration 070: Cafeteria System Tables
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Cafeteria Owners table (one per auth account)
CREATE TABLE IF NOT EXISTS cafeteria_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  outside_images TEXT[] DEFAULT '{}',  -- max 2, stored as public URLs
  inside_images TEXT[] DEFAULT '{}',   -- max 8, stored as public URLs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cafeteria Menu Items
CREATE TABLE IF NOT EXISTS cafeteria_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES cafeteria_owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'Main Course',
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafe_menu_owner ON cafeteria_menu_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_cafe_owners_auth ON cafeteria_owners(auth_id);

-- 4. Updated_at trigger for owners
CREATE OR REPLACE FUNCTION fn_update_cafeteria_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_cafeteria_owners_updated ON cafeteria_owners;
CREATE TRIGGER trig_cafeteria_owners_updated
  BEFORE UPDATE ON cafeteria_owners
  FOR EACH ROW EXECUTE FUNCTION fn_update_cafeteria_updated_at();

DROP TRIGGER IF EXISTS trig_cafeteria_items_updated ON cafeteria_menu_items;
CREATE TRIGGER trig_cafeteria_items_updated
  BEFORE UPDATE ON cafeteria_menu_items
  FOR EACH ROW EXECUTE FUNCTION fn_update_cafeteria_updated_at();

-- 5. RLS Policies

-- cafeteria_owners: owner can manage their own record; everyone else can read
ALTER TABLE cafeteria_owners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cafe_owner_manage" ON cafeteria_owners;
DROP POLICY IF EXISTS "cafe_public_read" ON cafeteria_owners;

CREATE POLICY "cafe_owner_manage" ON cafeteria_owners
  FOR ALL
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "cafe_public_read" ON cafeteria_owners
  FOR SELECT
  USING (true);

-- cafeteria_menu_items: owner manages their items; everyone reads
ALTER TABLE cafeteria_menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cafe_item_owner_manage" ON cafeteria_menu_items;
DROP POLICY IF EXISTS "cafe_item_public_read" ON cafeteria_menu_items;

CREATE POLICY "cafe_item_owner_manage" ON cafeteria_menu_items
  FOR ALL
  USING (
    owner_id = (SELECT id FROM cafeteria_owners WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    owner_id = (SELECT id FROM cafeteria_owners WHERE auth_id = auth.uid())
  );

CREATE POLICY "cafe_item_public_read" ON cafeteria_menu_items
  FOR SELECT
  USING (true);

-- 6. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cafeteria_owners;
ALTER PUBLICATION supabase_realtime ADD TABLE cafeteria_menu_items;

-- 7. Supabase Storage bucket for cafe images (run if not already created)
-- This needs to be done from the Supabase dashboard OR using the storage API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;
-- If 'uploads' bucket already exists and is public, skip.
